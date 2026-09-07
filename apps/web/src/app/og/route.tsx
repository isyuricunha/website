import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export const GET = (request: NextRequest): NextResponse => {
  return NextResponse.redirect(new URL('/images/og.png', request.url), 308)
}
