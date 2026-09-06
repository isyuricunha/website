/// <reference lib="webworker" />

import { logger } from '@/lib/logger'

declare const self: ServiceWorkerGlobalScope

type BackgroundSyncEvent = ExtendableEvent & { tag: string }

const CACHE_NAME = 'yuri-cunha-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Critical pages to cache for offline access
const CRITICAL_PAGES = ['/', '/blog', '/projects', '/about', '/uses', '/offline']

// Static assets to cache
const STATIC_ASSETS = [
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/favicon.ico',
  '/favicon/site.webmanifest'
]

// Install event - cache critical resources
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      await Promise.all([
        (async () => {
          const cache = await caches.open(STATIC_CACHE)
          await cache.addAll(STATIC_ASSETS)
        })(),
        (async () => {
          const cache = await caches.open(DYNAMIC_CACHE)
          await cache.addAll(CRITICAL_PAGES)
        })()
      ])
      self.skipWaiting()
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME
          )
          .map((cacheName) => caches.delete(cacheName))
      )
      self.clients.claim()
    })()
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return

  // Skip API requests (let them fail gracefully)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc/')) {
    return
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request)
      // Return cached version if available
      if (cachedResponse) {
        // Update cache in background for next time
        ;(async () => {
          try {
            const response = await fetch(request)
            if (!response.ok) {
              return
            }

            const responseClone = response.clone()
            const cache = await caches.open(DYNAMIC_CACHE)
            await cache.put(request, responseClone)
          } catch {
            // Network failed, but we have cache
          }
        })()

        return cachedResponse
      }

      // Try network first
      try {
        const response = await fetch(request)
        // Don't cache non-successful responses
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const responseClone = response.clone()

        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, responseClone)

        return response
      } catch {
        // Network failed and no cache - show offline page for navigation requests
        if (request.mode === 'navigate') {
          const offline = await caches.match('/offline')
          return (
            offline ??
            new Response(
              `<!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - Yuri Cunha</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
                    .offline { max-width: 400px; margin: 0 auto; }
                    .icon { font-size: 4rem; margin-bottom: 1rem; }
                  </style>
                </head>
                <body>
                  <div class="offline">
                    <div class="icon">📱</div>
                    <h1>You're offline</h1>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                  </div>
                </body>
                </html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            )
          )
        }

        // For other requests, just fail
        throw new Error('Network request failed and no cache available')
      }
    })()
  )
})

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  const syncEvent = event as unknown as BackgroundSyncEvent
  if (syncEvent.tag === 'background-sync') {
    syncEvent.waitUntil(
      (async () => {
        // Perform any background sync tasks here
        logger.debug('Background sync triggered')
      })()
    )
  }
})

// Push notifications (if needed in the future)
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) {
    return
  }

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/android-chrome-192x192.png',
      tag: data.tag || 'default',
      data: data.url || '/'
    })
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  event.waitUntil(self.clients.openWindow(event.notification.data || '/'))
})
