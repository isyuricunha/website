import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@isyuricunha/env'

const get_r2_endpoint = () => {
  if (env.R2_ENDPOINT) return env.R2_ENDPOINT
  if (env.R2_ACCOUNT_ID) return `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  return null
}

export const get_r2_public_base_url = () => {
  return env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? null
}

export const create_r2_client = () => {
  const endpoint = get_r2_endpoint()
  if (!endpoint || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) return null

  return new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })
}

type PresignedPutOptions = {
  bucket: string
  key: string
  contentType: string
  cacheControl?: string
  expiresInSeconds?: number
}

export const create_presigned_r2_put_url = async (opts: PresignedPutOptions) => {
  const client = create_r2_client()
  if (!client) return null

  const command = new PutObjectCommand({
    Bucket: opts.bucket,
    Key: opts.key,
    ContentType: opts.contentType,
    CacheControl: opts.cacheControl
  })

  const url = await getSignedUrl(client, command, {
    expiresIn: opts.expiresInSeconds ?? 60
  })

  return {
    url,
    requiredHeaders: {
      'Content-Type': opts.contentType,
      ...(opts.cacheControl ? { 'Cache-Control': opts.cacheControl } : {})
    }
  }
}
