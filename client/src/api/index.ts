import { httpGet } from '@/utils/http'
export const urlV1 = (id: number | string) => {
  const audio = AudioStore()
  return httpGet<{ data: { url: string }[] }>(
    `song/url/v1?id=${id}&level=${audio.quality}`
  )
}
// export const lyric = (id: number | string) =>
//   httpGet<LyricsResponse>(`/lyric?id=${id}`)
// export const lyricNew = (id: number | string) =>
//   httpGet<LyricsResponse>(`/lyric/new?id=${id}`)
