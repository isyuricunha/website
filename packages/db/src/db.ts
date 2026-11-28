import { env } from '@isyuricunha/env'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

export const db: NodePgDatabase<typeof schema> = drizzle({
  connection: env.DATABASE_URL,
  schema
})
