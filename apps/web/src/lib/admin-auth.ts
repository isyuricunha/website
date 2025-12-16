import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'

export const requireAdmin = async (): Promise<NextResponse | null> => {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
