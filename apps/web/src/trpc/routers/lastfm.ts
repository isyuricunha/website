import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { env } from '@isyuricunha/env'
import { ratelimit } from '@isyuricunha/kv'
import { logger } from '@/lib/logger'

import { getIp } from '@/utils/get-ip'

import { createTRPCRouter, publicProcedure } from '../trpc'

const API_KEY = env.LASTFM_API_KEY
const USERNAME = env.LASTFM_USER
const BASE_URL = 'http://ws.audioscrobbler.com/2.0/'

const lastfmFetch = async (method: string, params: Record<string, string> = {}) => {
  const url = new URL(BASE_URL)
  url.searchParams.set('method', method)
  url.searchParams.set('user', USERNAME)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('format', 'json')

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000)
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.warn(`Last.fm API error for ${method}`, {
      status: response.status,
      error: errorText
    })
    throw new Error(`Last.fm API error: ${response.status}`)
  }

  return response.json()
}

const getKey = (id: string, scope: string) => `lastfm:${scope}:${id}`

const mapTimeRangeToPeriod = (range: 'short_term' | 'medium_term' | 'long_term') => {
  switch (range) {
    case 'short_term':
      return '1month'
    case 'medium_term':
      return '6month'
    default:
      return 'overall'
  }
}

export const lastfmRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'get'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.getrecenttracks', { limit: '1' })
      const track = data.recenttracks.track[0]

      if (!track) {
        return {
          isPlaying: false,
          songUrl: null,
          name: null,
          artist: null
        }
      }

      const isPlaying = track['@attr']?.nowplaying === 'true'

      return {
        isPlaying,
        songUrl: track.url as string,
        name: track.name as string,
        artist: track.artist['#text'] as string
      }
    } catch (error) {
      logger.error('Error in lastfm.get', error)
      return {
        isPlaying: false,
        songUrl: null,
        name: null,
        artist: null
      }
    }
  }),

  getCurrentlyPlaying: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'getCurrentlyPlaying'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.getrecenttracks', { limit: '1' })
      const track = data.recenttracks.track[0]

      if (!track) return null

      const isPlaying = track['@attr']?.nowplaying === 'true'

      // Best effort for album image
      const image = track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || 
                    track.image?.find((img: any) => img.size === 'large')?.['#text'] || 
                    null

      return {
        isPlaying,
        songUrl: track.url as string,
        name: track.name as string,
        artist: track.artist['#text'] as string,
        album: track.album['#text'] as string,
        albumImage: image,
        duration: 0, // Last.fm recent tracks doesn't give duration/progress
        progress: 0
      }
    } catch (error) {
      logger.error('Error in lastfm.getCurrentlyPlaying', error)
      return null
    }
  }),

  getTopArtists: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'getTopArtists'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.gettopartists', { limit: '20', period: '7day' })
      const artists = data.topartists.artist || []

      return artists.map((artist: any) => ({
        id: artist.mbid || artist.name,
        name: artist.name as string,
        image: artist.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
        url: artist.url as string,
        followers: parseInt(artist.playcount) || 0, // Fallback to playcount as followers isn't directly here
        genres: [] // Last.fm top artists doesn't include tags directly without another call
      }))
    } catch (error) {
      logger.error('Error in lastfm.getTopArtists', error)
      return []
    }
  }),

  getTopTracks: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'getTopTracks'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.gettoptracks', { limit: '20', period: '7day' })
      const tracks = data.toptracks.track || []

      return tracks.map((track: any) => ({
        id: track.mbid || `${track.artist.name}-${track.name}`,
        name: track.name as string,
        artist: track.artist.name as string,
        album: '', // Not in top tracks response
        albumImage: track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
        url: track.url as string,
        duration: parseInt(track.duration) * 1000 || 0,
        popularity: parseInt(track.playcount) || 0
      }))
    } catch (error) {
      logger.error('Error in lastfm.getTopTracks', error)
      return []
    }
  }),

  getRecentlyPlayed: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'getRecentlyPlayed'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.getrecenttracks', { limit: '20' })
      const tracks = data.recenttracks.track || []

      return tracks.map((track: any) => ({
        id: track.mbid || `${track.artist['#text']}-${track.name}`,
        name: track.name as string,
        artist: track.artist['#text'] as string,
        album: track.album['#text'] as string,
        albumImage: track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
        url: track.url as string,
        duration: 0,
        playedAt: track.date?.uts ? new Date(parseInt(track.date.uts) * 1000).toISOString() : new Date().toISOString()
      }))
    } catch (error) {
      logger.error('Error in lastfm.getRecentlyPlayed', error)
      return []
    }
  }),

  getTopArtistsByRange: publicProcedure
    .input(z.object({
      time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
    }))
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)
      const { success } = await ratelimit.limit(getKey(ip, 'getTopArtistsByRange'))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
        const period = mapTimeRangeToPeriod(input.time_range)
        const data = await lastfmFetch('user.gettopartists', { limit: '20', period })
        const artists = data.topartists.artist || []

        return artists.map((artist: any) => ({
          id: artist.mbid || artist.name,
          name: artist.name as string,
          image: artist.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
          url: artist.url as string,
          followers: parseInt(artist.playcount) || 0,
          genres: []
        }))
      } catch (error) {
        logger.error('Error in lastfm.getTopArtistsByRange', error)
        return []
      }
    }),

  getTopTracksByRange: publicProcedure
    .input(z.object({
      time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
    }))
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)
      const { success } = await ratelimit.limit(getKey(ip, 'getTopTracksByRange'))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      try {
        const period = mapTimeRangeToPeriod(input.time_range)
        const data = await lastfmFetch('user.gettoptracks', { limit: '20', period })
        const tracks = data.toptracks.track || []

        return tracks.map((track: any) => ({
          id: track.mbid || `${track.artist.name}-${track.name}`,
          name: track.name as string,
          artist: track.artist.name as string,
          album: '',
          albumImage: track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
          url: track.url as string,
          duration: parseInt(track.duration) * 1000 || 0,
          popularity: parseInt(track.playcount) || 0
        }))
      } catch (error) {
        logger.error('Error in lastfm.getTopTracksByRange', error)
        return []
      }
    }),
  
  // Audio features fallback
  getAudioFeaturesSummaryByRange: publicProcedure
    .input(z.object({
      time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('short_term')
    }))
    .query(async () => {
      return {
        sampleSize: 0,
        danceability: null,
        energy: null,
        valence: null,
        tempo: null,
        acousticness: null,
        instrumentalness: null
      }
    })
})
