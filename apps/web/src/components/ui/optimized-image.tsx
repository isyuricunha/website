'use client'

import { BlurImage } from '@tszhong0411/ui'
import { useState, useCallback } from 'react'
import { getOptimizedImageProps } from '@/lib/performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  imageClassName?: string
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  imageClassName,
  fallbackSrc,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }, [onError])

  const imageProps = getOptimizedImageProps(
    hasError && fallbackSrc ? fallbackSrc : src,
    width,
    height,
    priority
  )

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded-lg"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
      <BlurImage
        {...imageProps}
        alt={alt}
        className={imageClassName}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  )
}

// Specialized image components for different use cases
export function BlogCoverImage({ slug, title, priority = false }: { 
  slug: string
  title: string
  priority?: boolean 
}) {
  return (
    <OptimizedImage
      src={`/images/blog/${slug}/cover.png`}
      alt={`Cover image for ${title}`}
      width={1200}
      height={630}
      priority={priority}
      fallbackSrc="/images/blog/default-cover.png"
      className="rounded-lg overflow-hidden"
      imageClassName="transition-transform group-hover:scale-105"
    />
  )
}

export function ProjectCoverImage({ slug, name, priority = false }: { 
  slug: string
  name: string
  priority?: boolean 
}) {
  return (
    <OptimizedImage
      src={`/images/projects/${slug}/cover.png`}
      alt={`Cover image for ${name}`}
      width={1280}
      height={832}
      priority={priority}
      fallbackSrc="/images/projects/default-cover.png"
      className="aspect-video w-full object-cover"
      imageClassName="transition-transform duration-500 group-hover:scale-110"
    />
  )
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 112, 
  priority = false 
}: { 
  src: string
  alt: string
  size?: number
  priority?: boolean 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className="rounded-full overflow-hidden"
      fallbackSrc="/images/default-avatar.png"
    />
  )
}
