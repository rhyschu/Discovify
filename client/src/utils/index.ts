import { useNavigatorLanguage } from '@vueuse/core'

export function getBrowserLang() {
  const { language } = useNavigatorLanguage()
  if (['zh-CN'].includes(language.value as string)) {
    language.value = 'zh'
  }
  return language.value
}

export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function formatMillisecondsToTime(totalMilliseconds: number) {
  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((n) => (n < 10 ? `0${n}` : n.toString()))
    .filter((val, index) => val !== '00' || index > 0)
    .join(':')
}

export function getTimeState() {
  let timeNow = new Date()
  let hours = timeNow.getHours()
  if (hours >= 6 && hours <= 10) return `Good morning ⛅`
  if (hours >= 10 && hours <= 14) return `Good afternoon 🌞`
  if (hours >= 14 && hours <= 18) return `Good afternoon 🌞`
  if (hours >= 18 && hours <= 24) return `Good evening 🌛`
  if (hours >= 0 && hours <= 6) return `Good evening 🌛`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}

export function replaceUrlParams(url: string, newParam: string): string {
  const questionMarkIndex = url.indexOf('?')
  if (questionMarkIndex === -1) {
    return url
  }
  const baseUrl = url.substring(0, questionMarkIndex)
  return `${baseUrl}?${newParam}`
}

export function parseTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
