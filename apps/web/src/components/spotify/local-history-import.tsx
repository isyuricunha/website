'use client'

import { useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { flags } from '@isyuricunha/env'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from '@isyuricunha/ui'

// Simple parser for Spotify extended streaming history JSON files (array of plays)
// This runs entirely client-side; no upload.

type LocalPlay = {
  ts: string
  master_metadata_track_name?: string
  master_metadata_album_artist_name?: string
  master_metadata_album_album_name?: string
  ms_played?: number
}

const LocalHistoryImport = () => {
  const t = useTranslations()
  const [count, setCount] = useState<number | null>(null)
  const [artists, setArtists] = useState<number | null>(null)
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onFile = async (file?: File) => {
    try {
      setError(null)
      if (!file) return
      const text = await file.text()
      const data: unknown = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('Invalid file: expected JSON array')
      const list = data as LocalPlay[]
      setCount(list.length)
      const artistSet = new Set<string>()
      let total = 0
      for (const p of list) {
        if (p.master_metadata_album_artist_name) artistSet.add(p.master_metadata_album_artist_name)
        total += p.ms_played ?? 0
      }
      setArtists(artistSet.size)
      setDurationMs(total)
    } catch (error_: any) {
      setError(error_?.message || 'Parse error')
    }
  }

  if (!flags.spotifyImport) return null

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base sm:text-lg'>
              {t('spotify.import.title') || 'Import Local History'}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.import.subtitle') || 'Analyze your exported Spotify history offline'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Label htmlFor='spotifyHistoryFile' className='text-sm'>
              {t('spotify.import.choose') || 'Choose JSON file'}
            </Label>
            <Input
              id='spotifyHistoryFile'
              type='file'
              accept='application/json'
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          {error && <p className='text-sm text-red-500'>{error}</p>}
          {count !== null && (
            <div className='grid grid-cols-3 gap-3'>
              <div className='bg-muted/50 rounded p-3'>
                <div className='text-muted-foreground text-xs'>
                  {t('spotify.import.plays') || 'Total plays'}
                </div>
                <div className='text-lg font-semibold'>{count}</div>
              </div>
              <div className='bg-muted/50 rounded p-3'>
                <div className='text-muted-foreground text-xs'>
                  {t('spotify.import.artists') || 'Unique artists'}
                </div>
                <div className='text-lg font-semibold'>{artists ?? '—'}</div>
              </div>
              <div className='bg-muted/50 rounded p-3'>
                <div className='text-muted-foreground text-xs'>
                  {t('spotify.import.duration') || 'Total time'}
                </div>
                <div className='text-lg font-semibold'>
                  {durationMs ? Math.round(durationMs / 3_600_000) + 'h' : '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default LocalHistoryImport
