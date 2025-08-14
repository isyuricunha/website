/**
 * Performance optimization utilities
 */

import { unstable_cache } from 'next/cache'

// Cache tags for revalidation
export const CACHE_TAGS = {
  POSTS: 'posts',
  PROJECTS: 'projects',
  SPOTIFY: 'spotify',
  GITHUB: 'github',
  VIEWS: 'views',
  LIKES: 'likes'
} as const

// Cache durations in seconds
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const

/**
 * Create a cached version of a function with automatic revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => any>(
  fn: T,
  keyParts: string[],
  options: {
    revalidate?: number
    tags?: string[]
  } = {}
): T {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
      tags: options.tags || []
    }
  ) as T
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Lazy load component with intersection observer
 */
export function createLazyComponent<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn)
  
  return function LazyWrapper(props: T) {
    return React.createElement(
      React.Suspense,
      { fallback: fallback ? React.createElement(fallback) : null },
      React.createElement(LazyComponent, props)
    )
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    document.head.appendChild(link)
  }
}

/**
 * Optimize image loading with proper sizing
 */
export function getOptimizedImageProps(
  src: string,
  width: number,
  height: number,
  priority = false
) {
  return {
    src,
    width,
    height,
    priority,
    sizes: priority 
      ? '100vw'
      : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
}

import React from 'react'
