import { randomBytes } from 'node:crypto'

import { TRPCError } from '@trpc/server'
import { eq, siteConfig } from '@isyuricunha/db'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import {
  AI_CONFIG_KEYS,
  encrypt_ai_api_key,
  get_ai_admin_settings,
  get_ai_models,
  get_ai_runtime_config,
  normalize_ai_endpoint
} from '@/lib/ai/runtime-config'
import { logger } from '@/lib/logger'

import { adminProcedure, createTRPCRouter } from '../trpc'

const endpointSchema = z.string().trim().min(1).max(1000)
const apiKeySchema = z.string().trim().min(1).max(10_000)
const modelSchema = z.string().trim().min(1).max(500)

const get_error_message = (error: unknown) => {
  if (error instanceof Error) return error.message
  return 'Unexpected runtime configuration error'
}

export const aiSettingsRouter = createTRPCRouter({
  getSettings: adminProcedure.query(async () => {
    try {
      return await get_ai_admin_settings()
    } catch (error) {
      logger.error('Failed to load runtime AI settings', {
        error: get_error_message(error)
      })
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load runtime settings'
      })
    }
  }),

  listModels: adminProcedure
    .input(
      z.object({
        endpoint: endpointSchema,
        apiKey: apiKeySchema.optional(),
        forceRefresh: z.boolean().default(false)
      })
    )
    .mutation(async ({ input }) => {
      try {
        const current = await get_ai_runtime_config()
        const apiKey = input.apiKey?.trim() || current?.apiKey
        if (!apiKey) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Enter an API key before loading models'
          })
        }

        return await get_ai_models({
          apiKey,
          endpoint: normalize_ai_endpoint(input.endpoint),
          forceRefresh: input.forceRefresh
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error

        logger.warn('Failed to load runtime AI models', {
          error: get_error_message(error)
        })
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: get_error_message(error)
        })
      }
    }),

  saveSettings: adminProcedure
    .input(
      z.object({
        endpoint: endpointSchema,
        apiKey: apiKeySchema.optional(),
        model: modelSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const current = await get_ai_runtime_config()
        const apiKey = input.apiKey?.trim() || current?.apiKey
        if (!apiKey) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'API key is required'
          })
        }

        const endpoint = normalize_ai_endpoint(input.endpoint)
        const model = input.model.trim()
        const modelsResult = await get_ai_models({ apiKey, endpoint })

        if (!modelsResult.models.includes(model)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Select a model returned by the configured endpoint'
          })
        }

        const rows = [
          {
            key: AI_CONFIG_KEYS.apiKey,
            value: encrypt_ai_api_key(apiKey),
            description: 'Encrypted API key used by the public chat endpoint'
          },
          {
            key: AI_CONFIG_KEYS.endpoint,
            value: endpoint,
            description: 'OpenAI-compatible API base URL'
          },
          {
            key: AI_CONFIG_KEYS.model,
            value: model,
            description: 'Selected chat model'
          }
        ]

        await ctx.db.transaction(async (transaction) => {
          for (const row of rows) {
            const existing = await transaction.query.siteConfig.findFirst({
              where: eq(siteConfig.key, row.key),
              columns: { id: true }
            })

            if (existing) {
              await transaction
                .update(siteConfig)
                .set({
                  value: row.value,
                  type: 'features',
                  description: row.description,
                  isPublic: false,
                  updatedBy: ctx.session.user.id,
                  updatedAt: new Date()
                })
                .where(eq(siteConfig.key, row.key))
            } else {
              await transaction.insert(siteConfig).values({
                id: randomBytes(16).toString('hex'),
                key: row.key,
                value: row.value,
                type: 'features',
                description: row.description,
                isPublic: false,
                updatedBy: ctx.session.user.id,
                createdAt: new Date(),
                updatedAt: new Date()
              })
            }
          }
        })

        const auditLogger = new AuditLogger(ctx.db)
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'settings_update',
          targetType: 'config',
          targetId: 'runtime-ai',
          details: {
            endpoint,
            model,
            apiKeyUpdated: Boolean(input.apiKey?.trim())
          },
          ipAddress: getIpFromHeaders(ctx.headers),
          userAgent: getUserAgentFromHeaders(ctx.headers)
        })

        return await get_ai_admin_settings()
      } catch (error) {
        if (error instanceof TRPCError) throw error

        logger.error('Failed to save runtime AI settings', {
          error: get_error_message(error)
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save runtime settings'
        })
      }
    })
})
