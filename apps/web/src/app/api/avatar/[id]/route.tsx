/**
 * avatar (MIT License)
 * Copyright (c) Vercel
 * Source: https://github.com/vercel/avatar/blob/410bc1e438ef26a7456b037bbdd44d5aec49031a/pages/api/avatar/%5Bname%5D.tsx
 *
 * Modified by: isyuricunha
 */
import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type AvatarRouteProps = {
  params: Promise<{
    id: string
  }>
}

const djb2 = (str: string) => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.codePointAt(i)!
  }
  return hash
}

const avatarPalettes = [
  { base: '#1a1813', surface: '#201e17', accent: '#d6a84f' },
  { base: '#1b1913', surface: '#2a271f', accent: '#31d158' },
  { base: '#191811', surface: '#332f25', accent: '#bf5af2' },
  { base: '#1f1d17', surface: '#201e17', accent: '#64d2ff' }
] as const

const getAvatarPalette = (id: string) => {
  return avatarPalettes[Math.abs(djb2(id)) % avatarPalettes.length] ?? avatarPalettes[0]
}

export const GET = async (req: Request, props: AvatarRouteProps) => {
  const params = new URL(req.url)
  const rawSize = params.searchParams.get('size') ?? '40'
  // Unvalidated values (`?size=abc`, `?size=99999999`) crash ImageResponse and
  // allow unbounded render work; clamp to a sane square avatar range instead.
  const numericSize = Number(rawSize)
  const size = Number.isFinite(numericSize)
    ? String(Math.min(Math.max(numericSize, 16), 512))
    : '40'

  try {
    const { id } = await props.params

    const palette = getAvatarPalette(id)
    const dimension = Number(size)

    return new ImageResponse(
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g>
          <rect fill={palette.base} x='0' y='0' width={size} height={size} />
          <circle
            cx={dimension * 0.72}
            cy={dimension * 0.24}
            r={dimension * 0.34}
            fill={palette.surface}
          />
          <rect
            fill={palette.accent}
            opacity='0.72'
            x='0'
            y={dimension * 0.72}
            width={size}
            height={dimension * 0.28}
          />
        </g>
      </svg>,
      {
        width: dimension,
        height: dimension
      }
    )
  } catch {
    // Generic error body: never reflect internal exception text to callers.
    return NextResponse.json({ error: 'Failed to generate avatar' }, { status: 500 })
  }
}
