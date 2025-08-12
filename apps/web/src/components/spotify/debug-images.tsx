'use client'

import { api } from '@/trpc/react'

const DebugImages = () => {
  const { data: currentTrack } = api.spotify.getCurrentlyPlaying.useQuery()
  const { data: artists } = api.spotify.getTopArtists.useQuery()
  const { data: tracks } = api.spotify.getTopTracks.useQuery()

  if (currentTrack?.albumImage) {
    console.log('Current track album image:', currentTrack.albumImage)
  }

  if (artists && artists.length > 0) {
    console.log('Artist images:', artists.map(a => ({ name: a.name, image: a.image })))
  }

  if (tracks && tracks.length > 0) {
    console.log('Track album images:', tracks.map(t => ({ name: t.name, albumImage: t.albumImage })))
  }

  return null
}

export default DebugImages
