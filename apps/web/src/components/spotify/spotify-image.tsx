'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SpotifyImageProps {
  src: string | null | undefined
  alt: string
  fallbackIcon?: React.ReactNode
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

const SpotifyImage = ({
  src,
  alt,
  fallbackIcon = null,
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

  // If we have explicit width and height, use them instead of fill
  if (width && height) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            {fallbackIcon}
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes={sizes}
          loading="lazy"
          onLoad={() => {
            setIsLoading(false)
          }}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
        />
      </div>
    )
  }

  // Use fill for responsive images
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          {fallbackIcon}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        sizes={sizes}
        loading="lazy"
        onLoad={() => {
          setIsLoading(false)
        }}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}

export default SpotifyImage
