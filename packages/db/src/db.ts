import { env } from '@isyuricunha/env'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

export const db = drizzle({ connection: env.DATABASE_URL, schema })
