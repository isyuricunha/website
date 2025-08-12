'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SpotifyImageProps {
  src: string | null | undefined
  alt: string
  fallbackIcon: React.ReactNode
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

const SpotifyImage = ({
  src,
  alt,
  fallbackIcon,
  className = '',
  sizes = '100px',
  fill = true,
  width,
  height
}: SpotifyImageProps) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        {fallbackIcon}
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-muted animate-pulse ${className}`}>
          {fallbackIcon}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`object-cover ${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        sizes={sizes}
        loading="lazy"
        onLoad={() => {
          setIsLoading(false)
          console.log('Spotify image loaded successfully:', src)
        }}
        onError={(e) => {
          console.error('Spotify image failed to load:', src, e)
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}

export default SpotifyImage
