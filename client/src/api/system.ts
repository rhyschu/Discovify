import { http } from '@/utils/http'

export type Result = {
  code: number
  message: string
  data?: Array<any> | number | string | object
}

export type ResultTable = {
  code: number
  message: string
  data?: {
    
    items: Array<any>
    
    total?: number
    
    pageSize?: number
    
    currentPage?: number
  }
}

export const login = (data: object) => {
  return http<Result>('post', '/user/login', { data })
}

export const logout = () => {
  return http<Result>('post', '/user/logout')
}

export const sendEmailCode = (email: string) => {
  return http<Result>('get', '/user/sendVerificationCode', {
    params: { email },
  })
}

export const register = (data: object) => {
  return http<Result>('post', '/user/register', { data })
}

export const resetPassword = (data: object) => {
  return http<Result>('patch', '/user/resetUserPassword', { data })
}

export const getUserInfo = () => {
  return http<Result>('get', '/user/getUserInfo')
}

export const updateUserInfo = (data: object) => {
  return http<Result>('put', '/user/updateUserInfo', { data })
}

export const updateUserAvatar = (formData: FormData) => {
  return http<Result>('patch', '/user/updateUserAvatar', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    transformRequest: [(data) => data],
  })
}

export const deleteUser = () => {
  return http<Result>('delete', '/user/deleteAccount')
}

export const getBanner = () => {
  return http<Result>('get', '/banner/getBannerList')
}

export const getRecommendedPlaylists = () => {
  return http<Result>('get', '/playlist/getRecommendedPlaylists')
}

export const getRecommendedSongs = () => {
  return http<Result>('get', '/song/getRecommendedSongs')
}

export const discoverSongs = (intent = '') =>
  http<{ code: number; message: string; data: { songs: import('./interface').Song[]; mode: string; personalized: boolean; cached: boolean } }>('post', '/song/discover', { data: { intent } })

export const recordListeningEvent = (songId: number, eventId: string, listenedSeconds: number) =>
  http<Result>('post', '/song/listening-event', { data: { songId, eventId, listenedSeconds } })

export const getAllSongs = (data: object) => {
  return http<ResultTable>('post', '/song/getAllSongs', { data })
}

export const getSongDetail = (id: number) => {
  return http<ResultTable>('get', `/song/getSongDetail/${id}`)
}

export const getAllArtists = (data: object) => {
  return http<ResultTable>('post', '/artist/getAllArtists', { data })
}

export const getArtistDetail = (id: number) => {
  return http<Result>('get', `/artist/getArtistDetail/${id}`)
}

export const getAllPlaylists = (data: object) => {
  return http<ResultTable>('post', '/playlist/getAllPlaylists', { data })
}

export const getPlaylistDetail = (id: number) => {
  return http<Result>('get', `/playlist/getPlaylistDetail/${id}`)
}

export const getFavoriteSongs = (data: object) => {
  return http<Result>('post', '/favorite/getFavoriteSongs', { data })
}

export const collectSong = (songId: number) => {
  return http<Result>('post', '/favorite/collectSong', { params: { songId } })
}

export const cancelCollectSong = (songId: number) => {
  return http<Result>('delete', '/favorite/cancelCollectSong', {
    params: { songId },
  })
}

export const getFavoritePlaylists = (data: object) => {
  return http<Result>('post', '/favorite/getFavoritePlaylists', { data })
}

export const collectPlaylist = (playlistId: number) => {
  return http<Result>('post', '/favorite/collectPlaylist', {
    params: { playlistId },
  })
}

export const cancelCollectPlaylist = (playlistId: number) => {
  return http<Result>('delete', '/favorite/cancelCollectPlaylist', {
    params: { playlistId },
  })
}

export const addSongComment = (data: object) => {
  return http<Result>('post', '/comment/addSongComment', { data })
}

export const addPlaylistComment = (data: object) => {
  return http<Result>('post', '/comment/addPlaylistComment', { data })
}

export const likeComment = (commentId: number) => {
  return http<Result>('patch', `/comment/likeComment/${commentId}`)
}

export const cancelLikeComment = (commentId: number) => {
  return http<Result>('patch', `/comment/cancelLikeComment/${commentId}`)
}

export const deleteComment = (commentId: number) => {
  return http<Result>('delete', `/comment/deleteComment/${commentId}`)
}

export const addFeedback = (data: { content: string }) => {
  return http<Result>('post', '/feedback/addFeedback', { params: data })
}
