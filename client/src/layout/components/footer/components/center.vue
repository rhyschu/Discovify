<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { formatTime } from '@/utils'
import { UserStore } from '@/stores/modules/user'
import { AudioStore } from '@/stores/modules/audio'
import { collectSong, cancelCollectSong } from '@/api/system'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryStore } from '@/stores/modules/library'
import { useArtistStore } from '@/stores/modules/artist'
import { usePlaylistStore } from '@/stores/modules/playlist'

const userStore = UserStore()
const audioStore = AudioStore()
const route = useRoute()
const libraryStore = useLibraryStore()

const {
  isPlaying,
  currentTime,
  duration,
  nextTrack,
  prevTrack,
  togglePlayPause,
  seek,
} = useAudioPlayer()
const currentSongLikeStatus = computed(() => {
  const currentTrack = audioStore.trackList[audioStore.currentSongIndex]
  return currentTrack?.likeStatus || 0
})
const updateAllSongLikeStatus = (songId: number, status: number) => {
  audioStore.trackList.forEach(track => {
    if (Number(track.id) === songId) {
      track.likeStatus = status
    }
  })
  if (audioStore.currentPageSongs) {
    audioStore.currentPageSongs.forEach(song => {
      if (song.songId === songId) {
        song.likeStatus = status
      }
    })
  }
  if (route.path === '/library' && libraryStore.tableData?.items) {
    const song = libraryStore.tableData.items.find(song => song.songId === songId)
    if (song) {
      song.likeStatus = status
    }
  }
  if (route.path.startsWith('/artist/')) {
    const artistStore = useArtistStore()
    if (artistStore.artistInfo?.songs) {
      const song = artistStore.artistInfo.songs.find(song => song.songId === songId)
      if (song) {
        song.likeStatus = status
      }
    }
  }
  if (route.path.startsWith('/playlist/')) {
    const playlistStore = usePlaylistStore()
    if (playlistStore.songs) {
      const song = playlistStore.songs.find(song => song.songId === songId)
      if (song) {
        song.likeStatus = status
      }
    }
  }
}
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please sign in')
    return
  }

  const currentTrack = audioStore.trackList[audioStore.currentSongIndex]
  if (!currentTrack) return

  try {
    const songId = Number(currentTrack.id)
    if (currentSongLikeStatus.value === 0) {
      const res = await collectSong(songId)
      if (res.code === 0) {
        updateAllSongLikeStatus(songId, 1)
        ElMessage.success('Added to liked songs')
      } else {
        ElMessage.error(res.message || 'Could not save song')
      }
    } else {
      const res = await cancelCollectSong(songId)
      if (res.code === 0) {
        updateAllSongLikeStatus(songId, 0)
        ElMessage.success('Removed from liked songs')
      } else {
        ElMessage.error(res.message || 'Could not remove liked song')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}
</script>

<template>
  <div class="player-controls flex items-center flex-1">
    <div class="flex items-center mr-2">
      <button
        aria-label="Previous track" @click="prevTrack"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <icon-solar:skip-previous-bold class="text-lg" />
      </button>
      <button
        :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlayPause"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <Icon
          :icon="
            isPlaying ? 'ic:round-pause-circle' : 'material-symbols:play-circle'
          "
          class="text-5xl"
          :color="'#3b7256'"
        />
      </button>
      <button
        aria-label="Next track" @click="nextTrack"
        class="p-2 rounded-full hover:bg-hoverMenuBg transition"
      >
        <icon-solar:skip-previous-bold class="transform scale-x-[-1] text-lg" />
      </button>
      <button class="p-2 rounded-full hover:bg-hoverMenuBg transition" aria-label="Toggle favorite" @click="handleLike">
        <icon-mdi:cards-heart-outline v-if="currentSongLikeStatus === 0" class="text-lg" />
        <icon-mdi:cards-heart v-else class="text-lg text-red-500" />
      </button>
    </div>
    <div class="w-full flex items-center space-x-2">
      <el-slider
        v-model="currentTime"
        :step="1"
        :show-tooltip="false"
        @change="seek"
        :max="duration"
        class="w-full"
        size="small"
      />
      <span class="text-xs">{{ formatTime(currentTime) }}</span>
      <span> / </span>
      <span class="text-xs">{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>
