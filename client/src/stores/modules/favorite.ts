import { defineStore } from 'pinia'
import { getFavoritePlaylists, collectPlaylist, cancelCollectPlaylist } from '@/api/system'
import type { ResultTable } from '@/api/system'
import { ElMessage } from 'element-plus'
import coverImg from '@/assets/cover.png'

interface FavoritePlaylist {
  id: number
  name: string
  coverImgUrl: string
}

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favoritePlaylists: [] as FavoritePlaylist[],
    loading: false
  }),

  actions: {
    async getFavoritePlaylists() {
      try {
        this.loading = true
        const res = await getFavoritePlaylists({
          pageNum: 1,
          pageSize: 50,
          title: '',
          style: ''
        })
        if (res.code === 0 && res.data) {
          const data = res.data as ResultTable['data']
          if (data?.items) {
            this.favoritePlaylists = data.items.map(item => ({
              id: item.playlistId,
              name: item.title,
              coverImgUrl: item.coverUrl ?? coverImg
            }))
          }
        }
      } catch (error) {
        ElMessage.error('Could not load saved playlists')
      } finally {
        this.loading = false
      }
    },
    async collectPlaylist(playlistId: number) {
      try {
        const res = await collectPlaylist(playlistId)
        if (res.code === 0) {
          ElMessage.success('Saved to favorites')
          this.getFavoritePlaylists()
          return true
        }
        return false
      } catch (error) {
        ElMessage.error('Could not save favorite')
        return false
      }
    },
    async cancelCollectPlaylist(playlistId: number) {
      try {
        const res = await cancelCollectPlaylist(playlistId)
        if (res.code === 0) {
          ElMessage.success('Removed from favorites')
          this.favoritePlaylists = this.favoritePlaylists.filter(item => item.id !== playlistId)
          return true
        }
        return false
      } catch (error) {
        ElMessage.error('Could not remove favorite')
        return false
      }
    },
    clearFavoritePlaylists() {
      this.favoritePlaylists = []
    }
  }
}) 