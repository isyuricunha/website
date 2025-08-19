export type TopArtist = { id: string; name: string; image: string | null; url: string; followers: number; genres: string[] }
export type TopTrack = { id: string; name: string; artist: string; album: string; albumImage: string | null; url: string; duration: number; popularity: number }
export type RecentTrack = { id: string; name: string; artist: string; album: string; albumImage: string | null; url: string; playedAt: string }

const toCsv = (rows: Array<Record<string, any>>): string => {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))]
  return lines.join('\n')
}

export const download = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const exportTopArtistsCsv = (artists: TopArtist[]) => {
  const rows = artists.map((a) => ({ id: a.id, name: a.name, url: a.url, followers: a.followers, genres: a.genres.join('|') }))
  download('top-artists.csv', toCsv(rows), 'text/csv;charset=utf-8')
}

export const exportTopTracksCsv = (tracks: TopTrack[]) => {
  const rows = tracks.map((t) => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, url: t.url, duration_ms: t.duration, popularity: t.popularity }))
  download('top-tracks.csv', toCsv(rows), 'text/csv;charset=utf-8')
}

export const exportRecentlyPlayedCsv = (tracks: RecentTrack[]) => {
  const rows = tracks.map((t) => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, url: t.url, played_at: t.playedAt }))
  download('recently-played.csv', toCsv(rows), 'text/csv;charset=utf-8')
}

export const exportJson = (filename: string, data: unknown) => {
  download(filename, JSON.stringify(data, null, 2), 'application/json')
}
