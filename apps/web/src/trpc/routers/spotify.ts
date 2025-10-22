import { TRPCError } from '@trpc/server'
import { env } from '@tszhong0411/env'
import { ratelimit } from '@tszhong0411/kv'
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
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

const getAccessToken = async () => {
  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      logger.error('Missing Spotify environment variables')
      throw new Error('Missing required Spotify environment variables')
    }

    logger.debug('Attempting Spotify token refresh')

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
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Spotify token refresh failed', new Error(`Status: ${response.status}`), { status: response.status })
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      logger.error('No access token in Spotify response')
      throw new Error('No access token received')
    }

    logger.debug('Successfully obtained Spotify access token')
    return data.access_token as string
  } catch (error) {
    logger.error('Error getting Spotify access token', error)
    throw error
  }
}

const getKey = (id: string) => `spotify:${id}`

export const spotifyRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

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

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
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
    const albumImage = song.item.album?.images?.[0]?.url ||
                      song.item.album?.images?.[1]?.url ||
                      song.item.album?.images?.[2]?.url ||
                      null

    return {
      isPlaying: song.is_playing as boolean,
      songUrl: song.item.external_urls?.spotify as string,
      name: song.item.name as string,
      artist: song.item.artists?.map((artist: { name: string }) => artist.name).join(', ') || 'Unknown Artist',
      album: song.item.album?.name as string || 'Unknown Album',
      albumImage,
      duration: song.item.duration_ms as number,
      progress: song.progress_ms as number
    }
  }),

  getTopArtists: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${TOP_ARTISTS_ENDPOINT}?limit=20&time_range=short_term`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify API error for top artists', new Error(`Status: ${response.status}`))
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top artists: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in top artists response')
        return []
      }

      return data.items.map((artist: any) => {
        // Try to get the best quality image
        const image = artist.images?.[0]?.url ||
                     artist.images?.[1]?.url ||
                     artist.images?.[2]?.url ||
                     null

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

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${TOP_TRACKS_ENDPOINT}?limit=20&time_range=short_term`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify API error for top tracks', new Error(`Status: ${response.status}`))
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top tracks: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in top tracks response')
        return []
      }

      return data.items.map((track: any) => {
        // Try to get the best quality image
        const albumImage = track.album.images?.[0]?.url ||
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

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const accessToken = await getAccessToken()

      const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=20`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        logger.error('Spotify API error for recently played', new Error(`Status: ${response.status}`))
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch recently played tracks: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        logger.warn('No items in recently played response')
        return []
      }

      return data.items.map((item: any) => {
        // Try to get the best quality image
        const albumImage = item.track.album.images?.[0]?.url ||
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
          playedAt: item.played_at as string
        }
      })
    } catch (error) {
      logger.error('Error in getRecentlyPlayed', error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch recently played tracks' })
    }
  })
  ,

  // New: Fetch top artists by time range without altering existing getTopArtists
  getTopArtistsByRange: publicProcedure
    .input((val: unknown) => {
      const input = val as { time_range?: 'short_term' | 'medium_term' | 'long_term', limit?: number }
      return {
        time_range: (input?.time_range ?? 'short_term') as 'short_term' | 'medium_term' | 'long_term',
        limit: Math.min(Math.max(input?.limit ?? 20, 1), 50)
      }
    })
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)
      const { success } = await ratelimit.limit(getKey(ip))
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
})
