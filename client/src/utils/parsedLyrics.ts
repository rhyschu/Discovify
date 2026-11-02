// import { API } from "@/api/interface";
// export interface LyricLine {
// }
// export interface MergedLyricLine extends LyricLine {
// }

// interface LyricUser {
// }

// export interface LyricData {
//     lines: MergedLyricLine[]
// }

// export function parseLyrics(lyricString: string): LyricLine[] {
//     const lines = lyricString.split('\n')
//     const parsedLines: LyricLine[] = []

//     lines.forEach((line) => {
//         const matches = [...line.matchAll(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/g)]

//         if (matches.length && lrc) {
//             matches.forEach((match) => {
//                 const minutes = parseInt(match[1], 10)
//                 const seconds = parseInt(match[2], 10)
//                 const milliseconds =
//                     match[3].length === 3
//                         ? parseInt(match[3], 10)
//                         : parseInt(match[3], 10) * 10
//                 const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds
//                 parsedLines.push({ time: time, lrc })
//             })
//         }
//     })

//     return parsedLines
// }

// export function parseAndMergeLyrics(lyrics: API.LyricsResponse): LyricData {
//     const { lyricUser, transUser, lrc, tlyric, romalrc } = lyrics
//     const originalParsed: LyricLine[] = parseLyrics(lrc?.lyric ?? '') || []
//     const translatedParsed: LyricLine[] = parseLyrics(tlyric?.lyric ?? '') || []
//     const romaParsed: LyricLine[] = parseLyrics(romalrc?.lyric ?? '') || []
//     let remark = ''
//     if (originalParsed.length === 0 && lrc?.lyric) {
//     }
//     const mergedLyrics = originalParsed.map((lyric) => {
//         const translation: LyricLine | undefined = translatedParsed.find(
//             (tran) => tran.time === lyric.time
//         )

//         const romaLrc: LyricLine | undefined = romaParsed.find(
//             (tran) => tran.time === lyric.time
//         )
//         return {
//             ...lyric,
//             tlyric: translation?.lrc,
//             romaLrc: romaLrc?.lrc,
//         }
//     })
//     if (mergedLyrics.length === 0 && lyrics.lyric) {
//         remark = lyrics.lyric
//     }

//     return {
//         lines: mergedLyrics,
//         lyricUser: lyricUser || '',
//         transUser: transUser || '',
//         remark,
//     }
// }