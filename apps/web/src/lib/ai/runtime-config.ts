import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { db, inArray, siteConfig } from '@isyuricunha/db'
import { redis } from '@isyuricunha/kv'

import { logger } from '@/lib/logger'

export const AI_CONFIG_KEYS = {
  apiKey: 'ai.api_key',
  endpoint: 'ai.endpoint',
  model: 'ai.model'
} as const

const ENCRYPTION_PREFIX = 'enc'
const ENCRYPTION_VERSION = 'v1'
const MODELS_CACHE_TTL_SECONDS = 60 * 60
const MODELS_REQUEST_TIMEOUT_MS = 15_000

type AiConfigSource = 'database' | 'environment'

export type AiRuntimeConfig = {
  apiKey: string
  endpoint: string
  model: string
  source: AiConfigSource
}

type ModelsCacheValue = {
  fetchedAt: string
  models: string[]
}

export type AiModelsResult = ModelsCacheValue & {
  cached: boolean
}

const get_encryption_key = () => {
  const secret = [
    process.env.BETTER_AUTH_SECRET,
    process.env.CRON_SECRET,
    process.env.UPSTASH_REDIS_REST_TOKEN
  ]
    .find((value) => value?.trim())
    ?.trim()

  if (!secret) {
    throw new Error('A server secret is required to protect the runtime API key')
  }

  return createHash('sha256').update(`website:runtime-ai:${secret}`).digest()
}

export const encrypt_ai_api_key = (apiKey: string) => {
  const value = apiKey.trim()
  if (!value) throw new Error('API key cannot be empty')

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', get_encryption_key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    ENCRYPTION_PREFIX,
    ENCRYPTION_VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url')
  ].join(':')
}

const decrypt_ai_api_key = (storedValue: string) => {
  const value = storedValue.trim()
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:${ENCRYPTION_VERSION}:`)) {
    return value
  }

  const parts = value.split(':')
  if (parts.length !== 5) {
    throw new Error('Stored API key has an invalid encrypted format')
  }

  const [prefix, version, ivValue, authTagValue, encryptedValue] = parts
  if (
    prefix !== ENCRYPTION_PREFIX ||
    version !== ENCRYPTION_VERSION ||
    !ivValue ||
    !authTagValue ||
    !encryptedValue
  ) {
    throw new Error('Stored API key has an invalid encrypted format')
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    get_encryption_key(),
    Buffer.from(ivValue, 'base64url')
  )
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final()
  ]).toString('utf8')
}

export const normalize_ai_endpoint = (rawEndpoint: string) => {
  const value = rawEndpoint.trim()
  if (!value) throw new Error('Endpoint is required')

  const endpoint = new URL(value)
  if (endpoint.protocol !== 'http:' && endpoint.protocol !== 'https:') {
    throw new Error('Endpoint must use HTTP or HTTPS')
  }
  if (process.env.NODE_ENV === 'production' && endpoint.protocol !== 'https:') {
    throw new Error('Production endpoints must use HTTPS')
  }
  if (endpoint.username || endpoint.password) {
    throw new Error('Endpoint credentials must not be included in the URL')
  }

  endpoint.search = ''
  endpoint.hash = ''

  return endpoint.toString().replace(/\/$/, '')
}

const normalize_environment_endpoint = (rawEndpoint: string | undefined) => {
  if (!rawEndpoint?.trim()) return 'https://api.mistral.ai/v1'

  const endpoint = new URL(rawEndpoint.trim())
  if (endpoint.hostname === 'api.mistral.ai' && (endpoint.pathname === '/' || !endpoint.pathname)) {
    endpoint.pathname = '/v1'
  }

  return normalize_ai_endpoint(endpoint.toString())
}

const get_environment_fallback = (): AiRuntimeConfig | null => {
  const apiKey = process.env.MISTRAL_API_KEY?.trim()
  const model = process.env.MISTRAL_AGENT_ID?.trim() || 'mistral-large-latest'

  if (!apiKey) return null

  return {
    apiKey,
    endpoint: normalize_environment_endpoint(process.env.MISTRAL_BASE_URL),
    model,
    source: 'environment'
  }
}

const get_database_values = async () => {
  const rows = await db.query.siteConfig.findMany({
    where: inArray(siteConfig.key, Object.values(AI_CONFIG_KEYS)),
    columns: {
      key: true,
      value: true
    }
  })

  return new Map(rows.map((row) => [row.key, row.value?.trim() || null]))
}

export const get_ai_runtime_config = async (): Promise<AiRuntimeConfig | null> => {
  const values = await get_database_values()
  const environment = get_environment_fallback()

  const encryptedApiKey = values.get(AI_CONFIG_KEYS.apiKey)
  const endpointValue = values.get(AI_CONFIG_KEYS.endpoint)
  const modelValue = values.get(AI_CONFIG_KEYS.model)

  const apiKey = encryptedApiKey ? decrypt_ai_api_key(encryptedApiKey) : environment?.apiKey
  const endpoint = endpointValue
    ? normalize_ai_endpoint(endpointValue)
    : environment?.endpoint
  const model = modelValue || environment?.model

  if (!apiKey || !endpoint || !model) return null

  return {
    apiKey,
    endpoint,
    model,
    source: encryptedApiKey && endpointValue && modelValue ? 'database' : 'environment'
  }
}

export const get_ai_admin_settings = async () => {
  const config = await get_ai_runtime_config()

  return {
    endpoint: config?.endpoint ?? '',
    model: config?.model ?? '',
    hasApiKey: Boolean(config?.apiKey),
    apiKeyPreview: config?.apiKey ? config.apiKey.slice(-4) : null,
    source: config?.source ?? null
  }
}

const create_models_cache_key = (endpoint: string, apiKey: string) => {
  const fingerprint = createHash('sha256')
    .update(`${endpoint}\0${apiKey}`)
    .digest('hex')
    .slice(0, 32)

  return `ai:models:${fingerprint}`
}

const parse_models_response = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return []

  const data = Reflect.get(payload, 'data')
  if (!Array.isArray(data)) return []

  const models = data
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const id = Reflect.get(item, 'id')
      return typeof id === 'string' ? id.trim() : null
    })
    .filter((id): id is string => Boolean(id))

  return Array.from(new Set(models)).toSorted((a, b) => a.localeCompare(b))
}

export const get_ai_models = async (input: {
  apiKey: string
  endpoint: string
  forceRefresh?: boolean
}): Promise<AiModelsResult> => {
  const endpoint = normalize_ai_endpoint(input.endpoint)
  const apiKey = input.apiKey.trim()
  if (!apiKey) throw new Error('API key is required to load models')

  const cacheKey = create_models_cache_key(endpoint, apiKey)

  if (!input.forceRefresh) {
    try {
      const cached = await redis.get<ModelsCacheValue>(cacheKey)
      if (cached?.models?.length) {
        return { ...cached, cached: true }
      }
    } catch (error) {
      logger.warn('Failed to read the AI model cache', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MODELS_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${endpoint}/models`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Model endpoint returned HTTP ${response.status}`)
    }

    const models = parse_models_response(await response.json())
    if (models.length === 0) {
      throw new Error('Model endpoint returned an empty or unsupported response')
    }

    const value: ModelsCacheValue = {
      fetchedAt: new Date().toISOString(),
      models
    }

    try {
      await redis.set(cacheKey, value, { ex: MODELS_CACHE_TTL_SECONDS })
    } catch (error) {
      logger.warn('Failed to write the AI model cache', {
        error: error instanceof Error ? error.message : String(error)
      })
    }

    return { ...value, cached: false }
  } finally {
    clearTimeout(timeout)
  }
}
