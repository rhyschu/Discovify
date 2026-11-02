// import { ParsedLyrics } from '@/utils/parsedLyrics'
/* UserState */
export interface UserState {
  userInfo: Partial<userModel> // User information
  isLoggedIn: boolean 
}
// user
export interface userModel {
  avatarUrl: string // Avatar
  username: string // Username
  userId: number // Userid
  token?: string // Usertoken
}

/* AudioState*/
export interface AudioState {
  trackList: trackModel[]
  currentSongIndex: number 
  currentPageSongs: []
  volume: number // Volume
  quality: string // Quality
}
export interface trackModel {
  id: string // Songid
  title: string // Song title
  artist: string // Artist
  album: string // Album
  cover: string // Cover
  url: string // Audio URL
  duration: number // Duration
  likeStatus: number
}

/* MenuState */
export interface MenuState {
  menuIndex: string 
}

/* SettingState */
export interface SettingState {
  isDrawerCover: boolean 
  isOriginalParsed: boolean 
  isRomaParsed: boolean 
  isTranslatedParsed: boolean 
  language: string | null 
}

/* ThemeState */
export interface ThemeState {
  isDark: boolean 
  primary: string // Accent color
}
