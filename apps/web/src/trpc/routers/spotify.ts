import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { env } from '@isyuricunha/env'
import { ratelimit } from '@isyuricunha/kv'
import { logger } from '@/lib/logger'

import { getIp } from '@/utils/get-ip'

import { createTRPCRouter, publicProcedure } from '../trpc'

const CLIENT_ID = env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = env.SPOTIFY_REFRESH_TOKEN

const BASIC = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'
const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists'
const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks'
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played'
const AUDIO_FEATURES_ENDPOINT = 'https://api.spotify.com/v1/audio-features'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

// Cache do access token (válido por ~50 minutos)
let cachedAccessToken: { token: string; expiresAt: number } | null = null

// Helper function for retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if it's a temporary error (502, 503, 504)
      const isTemporaryError =
        error instanceof Error &&
        (error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('504'))

      // Don't retry on non-temporary errors
      if (!isTemporaryError) {
        throw error
      }

      // Don't wait on last attempt
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        logger.debug(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

const getAccessToken = async () => {
  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      logger.error('Missing Spotify environment variables')
      throw new Error('Missing required Spotify environment variables')
    }

    // Check cache first (tokens are valid for ~1 hour, we cache for 50 minutes)
    const now = Date.now()
    if (cachedAccessToken && cachedAccessToken.expiresAt > now) {
      logger.debug('Using cached Spotify access token')
      return cachedAccessToken.token
    }

    logger.debug('Requesting new Spotify access token')

    // Use retry logic for token refresh
    const data = await retryWithBackoff(async () => {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${BASIC}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: REFRESH_TOKEN
        }),
        signal: AbortSignal.timeout(10_000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify token refresh failed', new Error(`Status: ${response.status}`), {
          status: response.status
        })
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      return response.json()
    })

    if (!data.access_token) {
      logger.error('No access token in Spotify response')
      throw new Error('No access token received')
    }

    // Cache the token (expires in 50 minutes)
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: now + 50 * 60 * 1000 // 50 minutes
    }

    logger.debug('Successfully obtained and cached Spotify access token')
    return data.access_token as string
  } catch (error) {
    logger.error('Error getting Spotify access token', error)
    throw error
  }
}

const getKey = (id: string, scope: string) => `spotify:${scope}:${id}`

export const spotifyRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip, 'get'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) {
      return {
        isPlaying: false,
        songUrl: null,
        name: null,
        artist: null
      }
    }

    const song = await response.json()

    return {
      isPlaying: song.is_playing as boolean,
      songUrl: song.item.external_urls.spotify as string,
      name: song.item.name as string,
      artist: song.item.artists.map((artist: { name: string }) => artist.name).join(', ') as string
    }
  }),

  getCurrentlyPlaying: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip, 'getCurrentlyPlaying'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      signal: AbortSignal.timeout(10_000) // 10 second timeout
    })

    if (response.status === 204) {
      return null
    }

    const song = await response.json()

    // Check if song.item exists to prevent undefined errors
    if (!song.item) {
      return null
    }

    // Try to get the best quality image (usually the first one is the highest quality)
    const albumImage =
      song.item.album?.images?.[0]?.url ||
      song.item.album?.images?.[1]?.url ||
      song.item.album?.images?.[2]?.url ||
      null

    return {
      isPlaying: song.is_playing as boolean,
      songUrl: song.item.external_urls?.spotify as string,
      name: song.item.name as string,
      artist:
        song.item.artists?.map((artist: { name: string }) => artist.name).join(', ') ||
        'Unknown Artist',
      album: (song.item.album?.name as string) || 'Unknown Album',
      albumImage,
      duration: song.item.duration_ms as number,
      progress: song.progress_ms as number
    }
  }),

  getTopArtists: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip, 'getTopArtists'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${TOP_ARTISTS_ENDPOINT}?limit=20&time_range=short_term`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10_000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify API error for top artists', new Error(`Status: ${response.status}`))
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch top artists: ${response.status}`
        })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in top artists response')
        return []
      }

      return data.items.map((artist: any) => {
        // Try to get the best quality image
        const image =
          artist.images?.[0]?.url || artist.images?.[1]?.url || artist.images?.[2]?.url || null

        return {
          id: artist.id as string,
          name: artist.name as string,
          image,
          url: artist.external_urls.spotify as string,
          followers: artist.followers.total as number,
          genres: artist.genres as string[]
        }
      })
    } catch (error) {
      logger.error('Error in getTopArtists', error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top artists' })
    }
  }),

  getTopTracks: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip, 'getTopTracks'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${TOP_TRACKS_ENDPOINT}?limit=20&time_range=short_term`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10_000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify API error for top tracks', new Error(`Status: ${response.status}`))
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch top tracks: ${response.status}`
        })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in top tracks response')
        return []
      }

      return data.items.map((track: any) => {
        // Try to get the best quality image
        const albumImage =
          track.album.images?.[0]?.url ||
          track.album.images?.[1]?.url ||
          track.album.images?.[2]?.url ||
          null

        return {
          id: track.id as string,
          name: track.name as string,
          artist: track.artists.map((artist: { name: string }) => artist.name).join(', '),
          album: track.album.name as string,
          albumImage,
          url: track.external_urls.spotify as string,
          duration: track.duration_ms as number,
          popularity: track.popularity as number
        }
      })
    } catch (error) {
      logger.error('Error in getTopTracks', error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top tracks' })
    }
  }),

  getRecentlyPlayed: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip, 'getRecentlyPlayed'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=20`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10_000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error(
          'Spotify API error for recently played',
          new Error(`Status: ${response.status}`)
        )
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch recently played tracks: ${response.status}`
        })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in recently played response')
        return []
      }

      return data.items.map((item: any) => {
        // Try to get the best quality image
        const albumImage =
          item.track.album.images?.[0]?.url ||
          item.track.album.images?.[1]?.url ||
          item.track.album.images?.[2]?.url ||
          null

        return {
          id: item.track.id as string,
          name: item.track.name as string,
          artist: item.track.artists.map((artist: { name: string }) => artist.name).join(', '),
          album: item.track.album.name as string,
          albumImage,
          url: item.track.external_urls.spotify as string,
          duration: item.track.duration_ms as number,
          playedAt: item.played_at as string
        }
      })
    } catch (error) {
      logger.error('Error in getRecentlyPlayed', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recently played tracks'
      })
    }
  }),

  getAudioFeaturesSummaryByRange: publicProcedure
    .input(
      z.object({
        time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
      })
    )
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(ip, 'getAudioFeaturesSummaryByRange'))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
        const accessToken = await getAccessToken()

        // Fetch top tracks for a given time range to get track IDs
        const topTracksResponse = await fetch(
          `${TOP_TRACKS_ENDPOINT}?limit=50&time_range=${input.time_range}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            signal: AbortSignal.timeout(10_000)
          }
        )

        if (!topTracksResponse.ok) {
          if (topTracksResponse.status === 429) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: 'Spotify rate limit reached'
            })
          }

          logger.error(
            'Spotify API error for audio features (top tracks)',
            new Error(`Status: ${topTracksResponse.status}`)
          )
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch top tracks: ${topTracksResponse.status}`
          })
        }

        const topTracksData = await topTracksResponse.json()
        const ids: string[] = Array.isArray(topTracksData.items)
          ? topTracksData.items.map((t: any) => t?.id).filter(Boolean)
          : []

        if (ids.length === 0) {
          return {
            sampleSize: 0,
            danceability: null,
            energy: null,
            valence: null,
            tempo: null,
            acousticness: null,
            instrumentalness: null
          }
        }

        // Spotify audio-features endpoint supports up to 100 IDs, so we're safe with 50.
        const audioFeaturesResponse = await fetch(
          `${AUDIO_FEATURES_ENDPOINT}?ids=${encodeURIComponent(ids.join(','))}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            signal: AbortSignal.timeout(10_000)
          }
        )

        if (!audioFeaturesResponse.ok) {
          if (audioFeaturesResponse.status === 429) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: 'Spotify rate limit reached'
            })
          }

          logger.error(
            'Spotify API error for audio features (features fetch)',
            new Error(`Status: ${audioFeaturesResponse.status}`)
          )
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch audio features: ${audioFeaturesResponse.status}`
          })
        }

        const audioFeaturesData = await audioFeaturesResponse.json()
        const features: any[] = Array.isArray(audioFeaturesData.audio_features)
          ? audioFeaturesData.audio_features.filter(Boolean)
          : []

        const sums = {
          danceability: 0,
          energy: 0,
          valence: 0,
          tempo: 0,
          acousticness: 0,
          instrumentalness: 0
        }
        const counts = {
          danceability: 0,
          energy: 0,
          valence: 0,
          tempo: 0,
          acousticness: 0,
          instrumentalness: 0
        }

        for (const f of features) {
          if (typeof f.danceability === 'number') {
            sums.danceability += f.danceability
            counts.danceability += 1
          }
          if (typeof f.energy === 'number') {
            sums.energy += f.energy
            counts.energy += 1
          }
          if (typeof f.valence === 'number') {
            sums.valence += f.valence
            counts.valence += 1
          }
          if (typeof f.tempo === 'number') {
            sums.tempo += f.tempo
            counts.tempo += 1
          }
          if (typeof f.acousticness === 'number') {
            sums.acousticness += f.acousticness
            counts.acousticness += 1
          }
          if (typeof f.instrumentalness === 'number') {
            sums.instrumentalness += f.instrumentalness
            counts.instrumentalness += 1
          }
        }

        const average = (sum: number, count: number) => (count > 0 ? sum / count : null)

        const sampleSize = Math.max(
          counts.danceability,
          counts.energy,
          counts.valence,
          counts.tempo,
          counts.acousticness,
          counts.instrumentalness
        )

        return {
          sampleSize,
          danceability: average(sums.danceability, counts.danceability),
          energy: average(sums.energy, counts.energy),
          valence: average(sums.valence, counts.valence),
          tempo: average(sums.tempo, counts.tempo),
          acousticness: average(sums.acousticness, counts.acousticness),
          instrumentalness: average(sums.instrumentalness, counts.instrumentalness)
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error

        logger.error('Error in getAudioFeaturesSummaryByRange', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audio features'
        })
      }
    }),

  getTopArtistsByRange: publicProcedure
    .input(
      z.object({
        time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
      })
    )
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(ip, 'getTopArtistsByRange'))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
        const accessToken = await getAccessToken()

        const response = await fetch(
          `${TOP_ARTISTS_ENDPOINT}?limit=20&time_range=${input.time_range}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            signal: AbortSignal.timeout(10_000) // 10 second timeout
          }
        )

        if (!response.ok) {
          logger.error(
            'Spotify API error for top artists by range',
            new Error(`Status: ${response.status}`)
          )
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch top artists: ${response.status}`
          })
        }

        const data = await response.json()

        if (!data.items || !Array.isArray(data.items)) {
          logger.warn('No items in top artists by range response')
          return []
        }

        return data.items.map((artist: any) => {
          // Try to get the best quality image
          const image =
            artist.images?.[0]?.url || artist.images?.[1]?.url || artist.images?.[2]?.url || null

          return {
            id: artist.id as string,
            name: artist.name as string,
            image,
            url: artist.external_urls.spotify as string,
            followers: artist.followers.total as number,
            genres: artist.genres as string[]
          }
        })
      } catch (error) {
        logger.error('Error in getTopArtistsByRange', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch top artists'
        })
      }
    }),

  getTopTracksByRange: publicProcedure
    .input(
      z.object({
        time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
      })
    )
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(ip, 'getTopTracksByRange'))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
        const accessToken = await getAccessToken()

        const response = await fetch(
          `${TOP_TRACKS_ENDPOINT}?limit=20&time_range=${input.time_range}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            signal: AbortSignal.timeout(10_000) // 10 second timeout
          }
        )

        if (!response.ok) {
          logger.error(
            'Spotify API error for top tracks by range',
            new Error(`Status: ${response.status}`)
          )
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch top tracks: ${response.status}`
          })
        }

        const data = await response.json()

        if (!data.items || !Array.isArray(data.items)) {
          logger.warn('No items in top tracks by range response')
          return []
        }

        return data.items.map((track: any) => {
          // Try to get the best quality image
          const albumImage =
            track.album.images?.[0]?.url ||
            track.album.images?.[1]?.url ||
            track.album.images?.[2]?.url ||
            null

          return {
            id: track.id as string,
            name: track.name as string,
            artist: track.artists.map((artist: { name: string }) => artist.name).join(', '),
            album: track.album.name as string,
            albumImage,
            url: track.external_urls.spotify as string,
            duration: track.duration_ms as number,
            popularity: track.popularity as number
          }
        })
      } catch (error) {
        logger.error('Error in getTopTracksByRange', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch top tracks'
        })
      }
    })
})
