import { defineStore } from 'pinia'
import piniaPersistConfig from '@/stores/helper/persist'
import { UserState } from '@/stores/interface'
import { login, logout, getUserInfo } from '@/api/system'
import { AudioStore } from './audio'

interface UserInfo {
  userId?: number
  username?: string
  phone?: string
  email?: string
  avatarUrl?: string
  introduction?: string
  token?: string
}

export const UserStore = defineStore('UserStore', {
  state: (): UserState => ({
    userInfo: {} as UserInfo,
    isLoggedIn: false,
  }),
  actions: {
    setUserInfo(userInfo: any, token?: string) {
      this.userInfo = {
        userId: userInfo.userId,
        username: userInfo.username,
        phone: userInfo.phone,
        email: userInfo.email,
        avatarUrl: userInfo.userAvatar,
        introduction: userInfo.introduction,
        token: token
      }
      this.isLoggedIn = true
    },
    updateUserAvatar(avatarUrl: string) {
      if (this.userInfo) {
        this.userInfo.avatarUrl = avatarUrl
      }
    },
    clearUserInfo() {
      this.userInfo = {}
      this.isLoggedIn = false
      const audioStore = AudioStore()
      audioStore.trackList.forEach(track => {
        track.likeStatus = 0
      })
      if (audioStore.currentPageSongs) {
        audioStore.currentPageSongs.forEach(song => {
          song.likeStatus = 0
        })
      }
    },
    async userLogin(loginData: { email: string; password: string }) {
      try {
        const response = await login(loginData)

        if (response.code === 0) {
          const token = response.data
          this.userInfo = { token }

          try {
            const userInfoResponse = await getUserInfo()
            
            if (userInfoResponse.code === 0) {
              this.setUserInfo(userInfoResponse.data, token)
              return { success: true, message: 'Signed in' }
            }
            return { success: false, message: userInfoResponse.message || 'Could not load profile' }
          } catch (error: any) {
            return { success: false, message: error.message || 'Could not load profile' }
          }
        }
        return { success: false, message: response.message || 'Sign-in failed' }
      } catch (error: any) {
        return { success: false, message: error.message || 'Sign-in failed' }
      }
    },
    async userLogout() {
      try {
        const response = await logout()
        if (response.code === 0) {
          this.clearUserInfo()
          return { success: true, message: 'Signed out' }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error.message || 'Could not sign out' }
      }
    }
  },
  persist: piniaPersistConfig('UserStore'),
})
