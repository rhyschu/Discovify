import { defineStore } from 'pinia'
import piniaPersistConfig from '@/stores/helper/persist'
import { trackListData } from '@/config/playbackDefaults'
import { AudioState, trackModel } from '@/stores/interface'
import { Song } from '@/api/interface'

export const AudioStore = defineStore({
  id: 'AudioStore',
  state: (): AudioState => ({
    trackList: trackListData,
    currentSongIndex: 0,
    volume: 50,
    quality: 'exhigh',
    currentPageSongs: [],
  }),
  actions: {
    //set AudioStore
    setAudioStore<T extends keyof AudioState>(key: T, value: AudioState[T]) {
      this[key] = value
    },
    addTracks(newTracks: trackModel | trackModel[]) {
      const existingIds = new Set(
        this.trackList.map((track: { id: any }) => track.id)
      )
      const tracksToAdd = Array.isArray(newTracks) ? newTracks : [newTracks]
      for (const track of tracksToAdd) {
        if (existingIds.has(track.id)) {
          this.currentSongIndex = this.trackList.findIndex(
            (existingTrack: { id: string }) => existingTrack.id === track.id
          )
          break
        } else {
          this.trackList.push(track)
          this.currentSongIndex = this.trackList.length - 1
        }
      }
    },
    deleteTrack(id: number | string) {
      this.trackList = this.trackList.filter(
        (track: { id: string | number }) => track.id !== id
      )
    },
    setCurrentPageSongs(songs: Song[]) {
      this.currentPageSongs = songs
    }
  },
  persist: piniaPersistConfig('AudioStore'),
})
