import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Same response contract as the Next.js implementation so infrastructure
// probes keep working during and after the migration.
export const GET: RequestHandler = async () => {
  return json({ ok: true, ts: new Date().toISOString() })
}
