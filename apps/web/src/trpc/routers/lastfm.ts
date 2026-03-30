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

/**
 * Cleans track and artist names to improve matching hit rate.
 * Removes common suffixes like (feat. ...), (ft. ...), - Remastered, etc.
 */
const cleanName = (name: string): string => {
  return (
    name
      .split(/\s+[\(\[]?(?:feat|ft|with|prod)\.?\s+/i)[0]
      ?.split(/\s+-\s+(?:remaster|live|radio edit|original mix)/i)[0]
      ?.replace(/\s*[\(\[].*[\)\]]\s*$/, '')
      ?.trim() || name
  )
}

const fetchRecentTracksImageMap = async (limit = 200): Promise<Map<string, string>> => {
  const imageMap = new Map<string, string>()
  try {
    const data = await lastfmFetch('user.getrecenttracks', { limit: String(limit) })
    const tracks = data.recenttracks?.track || []

    tracks.forEach((t: any) => {
      const key = `${t.artist['#text']}:${t.name}`.toLowerCase()
      const img = t.image?.find((i: any) => i.size === 'extralarge')?.['#text']
      if (img && !img.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
        imageMap.set(key, img)
      }
    })
  } catch (error) {
    logger.warn('Failed to fetch recent tracks for image enrichment', error as any)
  }
  return imageMap
}

const fetchArtistTopAlbumImage = async (artistName: string): Promise<string | null> => {
  try {
    const data = await lastfmFetch('artist.gettopalbums', {
      artist: artistName,
      limit: '1'
    })
    const album = data.topalbums?.album?.[0]
    if (!album) return null

    return (
      album.image?.find((img: any) => img.size === 'extralarge')?.['#text'] ||
      album.image?.find((img: any) => img.size === 'large')?.['#text'] ||
      null
    )
  } catch (error) {
    logger.warn(`Failed to fetch fallback image for artist: ${artistName}`, error as any)
    return null
  }
}

const fetchTrackFallbackImage = async (
  artistName: string,
  trackName: string
): Promise<string | null> => {
  // 1. Try track.getInfo with cleaned names
  try {
    const cleanedTrack = cleanName(trackName)
    const cleanedArtist = cleanName(artistName)

    const data = await lastfmFetch('track.getInfo', {
      artist: cleanedArtist,
      track: cleanedTrack,
      autocorrect: '1'
    })
    
    // If track.getInfo returns an album with an image, use it
    const albumImage = data.track?.album?.image?.find((img: any) => img.size === 'extralarge')?.['#text'] ||
                      data.track?.album?.image?.find((img: any) => img.size === 'large')?.['#text']
    
    if (albumImage && !albumImage.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
      return albumImage
    }
  } catch (error) {
    // Fail silently to try search fallback
  }

  // 2. Try track.search as a last resort
  try {
    const searchData = await lastfmFetch('track.search', {
      artist: artistName,
      track: trackName,
      limit: '1'
    })
    
    const track = searchData.results?.trackmatches?.track?.[0]
    const searchImage = track?.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || 
                        track?.image?.find((img: any) => img.size === 'large')?.['#text']

    if (searchImage && !searchImage.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
      return searchImage
    }
  } catch (error) {
    logger.warn(`Failed to fetch search fallback for track: ${trackName} by ${artistName}`, error as any)
  }

  return null
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
      logger.error('Error in lastfm.get', error as any)
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
      logger.error('Error in lastfm.getCurrentlyPlaying', error as any)
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

      const artistList = artists.map((artist: any) => ({
        id: artist.mbid || artist.name,
        name: artist.name as string,
        image: artist.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
        url: artist.url as string,
        followers: parseInt(artist.playcount) || 0,
        genres: []
      }))

      // Fallback for missing images
      const withFallbacks = await Promise.all(
        artistList.map(async (artist: any) => {
          if (artist.image && !artist.image.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
            return artist
          }
          const fallback = await fetchArtistTopAlbumImage(artist.name)
          return { ...artist, image: fallback || artist.image }
        })
      )

      return withFallbacks
    } catch (error) {
      logger.error('Error in lastfm.getTopArtists', error as any)
      return []
    }
  }),

  getTopTracks: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(ip, 'getTopTracks'))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const data = await lastfmFetch('user.gettoptracks', { limit: '20', period: '7day' })
      const tracks = data.toptracks?.track || []

      // Enrichment: Fetch recent tracks to use as a primary image source
      const recentImageMap = await fetchRecentTracksImageMap(200)

      const trackList = tracks.map((track: any) => ({
        id: track.mbid || `${track.artist.name}-${track.name}`,
        name: track.name as string,
        artist: track.artist.name as string,
        album: '',
        albumImage: track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
        url: track.url as string,
        duration: parseInt(track.duration) * 1000 || 0,
        popularity: parseInt(track.playcount) || 0
      }))

      // Request-level cache to avoid duplicate calls for identical tracks
      const fallbackCache = new Map<string, Promise<string | null>>()

      const withFallbacks = await Promise.all(
        trackList.map(async (track: any) => {
          const cacheKey = `${track.artist}:${track.name}`.toLowerCase()

          // 1. If we already have a real image from Top Tracks response, use it
          if (track.albumImage && !track.albumImage.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
            return track
          }

          // 2. Try to find image in recently played (Enrichment)
          const recentImg = recentImageMap.get(cacheKey)
          if (recentImg) {
            return { ...track, albumImage: recentImg }
          }

          // 3. Fallback to detail/search if necessary
          if (!fallbackCache.has(cacheKey)) {
            fallbackCache.set(cacheKey, fetchTrackFallbackImage(track.artist, track.name))
          }

          const fallback = await fallbackCache.get(cacheKey)!
          return { ...track, albumImage: fallback || track.albumImage }
        })
      )

      return withFallbacks
    } catch (error) {
      logger.error('Error in lastfm.getTopTracks', error as any)
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
      logger.error('Error in lastfm.getRecentlyPlayed', error as any)
      return []
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
        const period = mapTimeRangeToPeriod(input.time_range)
        const data = await lastfmFetch('user.gettopartists', { limit: '20', period })
        const artists = data.topartists.artist || []

        const artistList = artists.map((artist: any) => ({
          id: artist.mbid || artist.name,
          name: artist.name as string,
          image: artist.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
          url: artist.url as string,
          followers: parseInt(artist.playcount) || 0,
          genres: []
        }))

        // Fallback for missing images
        const withFallbacks = await Promise.all(
          artistList.map(async (artist: any) => {
            if (artist.image && !artist.image.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
              return artist
            }
            const fallback = await fetchArtistTopAlbumImage(artist.name)
            return { ...artist, image: fallback || artist.image }
          })
        )

        return withFallbacks
      } catch (error) {
        logger.error('Error in lastfm.getTopArtistsByRange', error as any)
        return []
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
        const period = mapTimeRangeToPeriod(input.time_range)
        const data = await lastfmFetch('user.gettoptracks', { limit: '20', period })
        const tracks = data.toptracks?.track || []

        // Enrichment: Fetch recent tracks to use as a primary image source
        const recentImageMap = await fetchRecentTracksImageMap(200)

        const trackList = tracks.map((track: any) => ({
          id: track.mbid || `${track.artist.name}-${track.name}`,
          name: track.name as string,
          artist: track.artist.name as string,
          album: '',
          albumImage: track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || null,
          url: track.url as string,
          duration: parseInt(track.duration) * 1000 || 0,
          popularity: parseInt(track.playcount) || 0
        }))

        // Request-level cache to avoid duplicate calls for identical tracks
        const fallbackCache = new Map<string, Promise<string | null>>()

        const withFallbacks = await Promise.all(
          trackList.map(async (track: any) => {
            const cacheKey = `${track.artist}:${track.name}`.toLowerCase()

            if (track.albumImage && !track.albumImage.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
              return track
            }

            const recentImg = recentImageMap.get(cacheKey)
            if (recentImg) {
              return { ...track, albumImage: recentImg }
            }

            if (!fallbackCache.has(cacheKey)) {
              fallbackCache.set(cacheKey, fetchTrackFallbackImage(track.artist, track.name))
            }

            const fallback = await fallbackCache.get(cacheKey)!
            return { ...track, albumImage: fallback || track.albumImage }
          })
        )

        return withFallbacks
      } catch (error) {
        logger.error('Error in lastfm.getTopTracksByRange', error as any)
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
