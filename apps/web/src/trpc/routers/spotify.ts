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
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASIC}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN
    })
  })

  const data = await response.json()

  return data.access_token as string
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
      }
    })

    if (response.status === 204) {
      return null
    }

    const song = await response.json()

    // Log the album images for debugging
    console.log('Album images:', song.item.album.images)
    console.log('Album images length:', song.item.album.images?.length)

    // Try to get the best quality image (usually the first one is the highest quality)
    const albumImage = song.item.album.images?.[0]?.url ||
                      song.item.album.images?.[1]?.url ||
                      song.item.album.images?.[2]?.url ||
                      null

    return {
      isPlaying: song.is_playing as boolean,
      songUrl: song.item.external_urls.spotify as string,
      name: song.item.name as string,
      artist: song.item.artists.map((artist: { name: string }) => artist.name).join(', '),
      album: song.item.album.name as string,
      albumImage,
      duration: song.item.duration_ms as number,
      progress: song.progress_ms as number
    }
  }),

  getTopArtists: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(`${TOP_ARTISTS_ENDPOINT}?limit=20&time_range=short_term`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
    }

    const data = await response.json()

    // Log the first artist images for debugging
    if (data.items.length > 0) {
      console.log('Artist images:', data.items[0].images)
      console.log('Artist images length:', data.items[0].images?.length)
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
  }),

  getTopTracks: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(`${TOP_TRACKS_ENDPOINT}?limit=20&time_range=short_term`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
    }

    const data = await response.json()

    // Log the first track album images for debugging
    if (data.items.length > 0) {
      console.log('Track album images:', data.items[0].album.images)
      console.log('Track album images length:', data.items[0].album.images?.length)
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
  }),

  getRecentlyPlayed: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const accessToken = await getAccessToken()

    const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=20`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
    }

    const data = await response.json()

    // Log the first recently played track album images for debugging
    if (data.items.length > 0) {
      console.log('Recently played album images:', data.items[0].track.album.images)
      console.log('Recently played album images length:', data.items[0].track.album.images?.length)
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
  })
})
