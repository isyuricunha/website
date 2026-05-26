/**
 * avatar (MIT License)
 * Copyright (c) Vercel
 * Source: https://github.com/vercel/avatar/blob/410bc1e438ef26a7456b037bbdd44d5aec49031a/pages/api/avatar/%5Bname%5D.tsx
 *
 * Modified by: isyuricunha
 */
import { getErrorMessage } from '@isyuricunha/utils'
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
  { base: '#14120b', surface: '#221f14', accent: '#c9572a' },
  { base: '#1b1912', surface: '#2a2619', accent: '#d9653a' },
  { base: '#1e1b10', surface: '#332e1e', accent: '#e07848' },
  { base: '#221f14', surface: '#14120b', accent: '#9a9080' }
] as const

const getAvatarPalette = (id: string) => {
  return avatarPalettes[Math.abs(djb2(id)) % avatarPalettes.length] ?? avatarPalettes[0]
}

export const GET = async (req: Request, props: AvatarRouteProps) => {
  const params = new URL(req.url)
  const size = params.searchParams.get('size') ?? '40'

  try {
    const { id } = await props.params

    const palette = getAvatarPalette(id)
    const numericSize = Number(size)

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
            cx={numericSize * 0.72}
            cy={numericSize * 0.24}
            r={numericSize * 0.34}
            fill={palette.surface}
          />
          <rect
            fill={palette.accent}
            opacity='0.72'
            x='0'
            y={numericSize * 0.72}
            width={size}
            height={numericSize * 0.28}
          />
        </g>
      </svg>,
      {
        width: numericSize,
        height: numericSize
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate avatar: ' + getErrorMessage(error)
      },
      {
        status: 500
      }
    )
  }
}
