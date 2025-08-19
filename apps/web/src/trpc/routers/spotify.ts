import { TRPCError } from '@trpc/server'
import { env } from '@tszhong0411/env'
import { ratelimit } from '@tszhong0411/kv'

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

const getAccessToken = async () => {
  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      console.error('Missing Spotify environment variables:', {
        CLIENT_ID: !!CLIENT_ID,
        CLIENT_SECRET: !!CLIENT_SECRET,
        REFRESH_TOKEN: !!REFRESH_TOKEN
      })
      console.error('Make sure NEXT_PUBLIC_FLAG_SPOTIFY=true is set in your .env.local file')
      throw new Error('Missing required Spotify environment variables')
    }

    console.log('Attempting token refresh with CLIENT_ID:', CLIENT_ID.substring(0, 8) + '...')

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
      console.error('Spotify token refresh failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Token refresh error response:', errorText)
      
      // Try to parse the error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText)
        console.error('Parsed error details:', errorJson)
      } catch (e) {
        console.error('Could not parse error response as JSON')
      }
      
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      console.error('No access token in response:', data)
      throw new Error('No access token received')
    }

    console.log('Successfully obtained access token')
    return data.access_token as string
  } catch (error) {
    console.error('Error getting Spotify access token:', error)
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
        console.error('Spotify API error for top artists:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top artists: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        console.warn('No items in top artists response:', data)
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
      console.error('Error in getTopArtists:', error)
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
        console.error('Spotify API error for top tracks:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top tracks: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        console.warn('No items in top tracks response:', data)
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
      console.error('Error in getTopTracks:', error)
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
        console.error('Spotify API error for recently played:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch recently played tracks: ${response.status}` })
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        console.warn('No items in recently played response:', data)
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
      console.error('Error in getRecentlyPlayed:', error)
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
        const accessToken = await getAccessToken()
        const response = await fetch(`${TOP_ARTISTS_ENDPOINT}?limit=${input.limit}&time_range=${input.time_range}` as string, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error top artists by range:', response.status, errorText)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top artists (${response.status})` })
        }
        const data = await response.json()
        if (!data.items || !Array.isArray(data.items)) return []
        return data.items.map((artist: any) => {
          const image = artist.images?.[0]?.url || artist.images?.[1]?.url || artist.images?.[2]?.url || null
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
        console.error('Error in getTopArtistsByRange:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top artists by range' })
      }
    }),

  // New: Fetch top tracks by time range without altering existing getTopTracks
  getTopTracksByRange: publicProcedure
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
        const accessToken = await getAccessToken()
        const response = await fetch(`${TOP_TRACKS_ENDPOINT}?limit=${input.limit}&time_range=${input.time_range}` as string, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error top tracks by range:', response.status, errorText)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch top tracks (${response.status})` })
        }
        const data = await response.json()
        if (!data.items || !Array.isArray(data.items)) return []
        return data.items.map((track: any) => {
          const albumImage = track.album.images?.[0]?.url || track.album.images?.[1]?.url || track.album.images?.[2]?.url || null
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
        console.error('Error in getTopTracksByRange:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top tracks by range' })
      }
    }),

  // New: Fetch audio features for given track IDs (up to 100)
  getAudioFeaturesForTracks: publicProcedure
    .input((val: unknown) => {
      const input = val as { ids: string[] }
      const ids = Array.isArray(input?.ids) ? input.ids.slice(0, 100).filter(Boolean) : []
      return { ids }
    })
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)
      const { success } = await ratelimit.limit(getKey(ip))
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      if (!input.ids.length) return []
      try {
        const accessToken = await getAccessToken()
        const url = `${AUDIO_FEATURES_ENDPOINT}?ids=${encodeURIComponent(input.ids.join(','))}`
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error audio features:', response.status, errorText)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to fetch audio features (${response.status})` })
        }
        const data = await response.json()
        return (data.audio_features || []).filter(Boolean).map((f: any) => ({
          id: f.id as string,
          danceability: f.danceability as number,
          energy: f.energy as number,
          valence: f.valence as number,
          tempo: f.tempo as number,
          acousticness: f.acousticness as number,
          instrumentalness: f.instrumentalness as number
        }))
      } catch (error) {
        console.error('Error in getAudioFeaturesForTracks:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch audio features' })
      }
    }),

  // New: Convenience endpoint to fetch audio features for current top tracks
  getAudioFeaturesForTopTracks: publicProcedure
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
        const accessToken = await getAccessToken()
        const tracksRes = await fetch(`${TOP_TRACKS_ENDPOINT}?limit=${input.limit}&time_range=${input.time_range}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        })
        if (!tracksRes.ok) {
          const errorText = await tracksRes.text()
          console.error('Error fetching top tracks for features:', tracksRes.status, errorText)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top tracks' })
        }
        const tracksData = await tracksRes.json()
        const ids: string[] = (tracksData.items || []).map((t: any) => t.id).filter(Boolean)
        if (!ids.length) return { features: [], aggregates: null }

        const featuresRes = await fetch(`${AUDIO_FEATURES_ENDPOINT}?ids=${encodeURIComponent(ids.join(','))}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        })
        if (!featuresRes.ok) {
          const errorText = await featuresRes.text()
          console.error('Error fetching audio features for top tracks:', featuresRes.status, errorText)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch audio features for top tracks' })
        }
        const featuresData = await featuresRes.json()
        const features = (featuresData.audio_features || []).filter(Boolean).map((f: any) => ({
          id: f.id as string,
          danceability: f.danceability as number,
          energy: f.energy as number,
          valence: f.valence as number,
          tempo: f.tempo as number,
          acousticness: f.acousticness as number,
          instrumentalness: f.instrumentalness as number
        }))

        const n = features.length || 1
        const avg = (key: keyof typeof features[number]) => features.reduce((a, b) => a + (b[key] as number), 0) / n
        const aggregates = {
          danceability: Number(avg('danceability').toFixed(2)),
          energy: Number(avg('energy').toFixed(2)),
          valence: Number(avg('valence').toFixed(2)),
          tempo: Number(avg('tempo').toFixed(0)),
          acousticness: Number(avg('acousticness').toFixed(2)),
          instrumentalness: Number(avg('instrumentalness').toFixed(2))
        }
        return { features, aggregates }
      } catch (error) {
        console.error('Error in getAudioFeaturesForTopTracks:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch audio features for top tracks' })
      }
    })
})
