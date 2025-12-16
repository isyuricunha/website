/**
 * website
 * Copyright (c) Delba de Oliveira
 * Source: https://github.com/delbaoliveira/website/blob/59e6f181ad75751342ceaa8931db4cbcef86b018/ui/BlurImage.tsx
 *
 * Modified by: isyuricunha
 */
import { cn } from '@isyuricunha/utils'
import NextImage from 'next/image'
import { useState } from 'react'

type ImageProps = {
  imageClassName?: string
  lazy?: boolean
} & React.ComponentProps<typeof NextImage>

const BlurImage = (props: ImageProps) => {
  const {
    alt,
    src,
    className,
    imageClassName,
    lazy = true,
    onLoad,
    onError,
    priority,
    loading,
    quality,
    style,
    ...rest
  } = props
  const [isLoading, setIsLoading] = useState(true)

  const resolvedPriority = priority ?? !lazy
  const resolvedLoading = loading ?? (resolvedPriority ? undefined : lazy ? 'lazy' : undefined)
  const resolvedQuality = quality ?? 100

  return (
    <div className={cn('overflow-hidden', isLoading && 'animate-pulse', className)}>
      <NextImage
        className={cn(isLoading && 'scale-[1.02] blur-xl grayscale', imageClassName)}
        style={{
          transition: 'filter 700ms ease, scale 150ms ease',
          ...style
        }}
        src={src}
        alt={alt}
        loading={resolvedLoading}
        priority={resolvedPriority}
        quality={resolvedQuality}
        onLoad={(event) => {
          setIsLoading(false)
          onLoad?.(event)
        }}
        onError={(event) => {
          setIsLoading(false)
          onError?.(event)
        }}
        {...rest}
      />
    </div>
  )
}

export { BlurImage }
