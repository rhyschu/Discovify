<script setup lang="ts">
import { Song } from '@/api/interface'
import { PropType, watch } from 'vue'
import { formatMillisecondsToTime } from '@/utils'
import default_album from '@/assets/default_album.jpg'
import { collectSong, cancelCollectSong } from '@/api/system'
import { ElMessage } from 'element-plus'
import { UserStore } from '@/stores/modules/user'

const audio = AudioStore()
const userStore = UserStore()
const { loadTrack, play } = useAudioPlayer()

const props = defineProps({
  data: {
    type: Array as PropType<Song[]>,
    default: () => [],
  },
})
watch(() => props.data, (newData) => {
  audio.setCurrentPageSongs(newData)
}, { immediate: true })
const convertToTrackModel = (song: Song) => {
  if (!song.songId || !song.songName || !song.audioUrl) {
    console.error('Incomplete song data:', song)
    return null
  }
  return {
    id: song.songId.toString(),
    title: song.songName,
    artist: song.artistName,
    album: song.album,
    cover: song.coverUrl || default_album,
    url: song.audioUrl,
    duration: Number(song.duration) || 0,
    likeStatus: song.likeStatus || 0,
  }
}
const handlePlay = async (row: Song) => {
  const allTracks = props.data
    .map(song => convertToTrackModel(song))
    .filter(track => track !== null)
  const selectedIndex = props.data.findIndex(song => song.songId === row.songId)
  audio.setAudioStore('trackList', allTracks)
  audio.setAudioStore('currentSongIndex', selectedIndex)
  await loadTrack()
  play()
}
const updateAllSongLikeStatus = (songId: number, status: number) => {
  audio.trackList.forEach(track => {
    if (Number(track.id) === songId) {
      track.likeStatus = status
    }
  })
  if (audio.currentPageSongs) {
    audio.currentPageSongs.forEach(song => {
      if (song.songId === songId) {
        song.likeStatus = status
      }
    })
  }
  if (props.data) {
    const song = props.data.find(song => song.songId === songId)
    if (song) {
      song.likeStatus = status
    }
  }
}
const handleLike = async (row: Song, e: Event) => {
  e.stopPropagation()
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please sign in')
    return
  }

  try {
    if (row.likeStatus === 0) {
      const res = await collectSong(row.songId)
      if (res.code === 0) {
        updateAllSongLikeStatus(row.songId, 1)
        ElMessage.success('Added to liked songs')
      } else {
        ElMessage.error(res.message || 'Could not save song')
      }
    } else {
      const res = await cancelCollectSong(row.songId)
      if (res.code === 0) {
        updateAllSongLikeStatus(row.songId, 0)
        ElMessage.success('Removed from liked songs')
      } else {
        ElMessage.error(res.message || 'Could not remove liked song')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

const downLoadMusic = (row: Song, e: Event) => {
  e.stopPropagation()
  const link = document.createElement('a')
  link.href = row.audioUrl
  link.setAttribute('download', `${row.songName} - ${row.artistName}`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const isCurrentPlaying = (songId: number) => {
  const currentTrack = audio.trackList[audio.currentSongIndex]
  return currentTrack && Number(currentTrack.id) === songId
}
</script>

<template>
  <div class="track-table-wrap">
    <table class="track-table">
      <thead><tr><th scope="col">Title</th><th scope="col">Artist</th><th scope="col" class="album-column">Album</th><th scope="col">Time</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody><tr v-for="row in data" :key="row.songId" :class="{ 'is-playing': isCurrentPlaying(row.songId) }">
        <td><button class="track-title-button" :aria-label="'Play ' + row.songName" @click="handlePlay(row)"><img :src="row.coverUrl || default_album" alt="" loading="lazy"/><span>{{ row.songName }}</span><span v-if="isCurrentPlaying(row.songId)" class="playing-indicator" aria-label="Current track">♫</span></button></td>
        <td>{{ row.artistName }}<small v-if="row.recommendationReason" class="recommendation-reason">{{ row.recommendationReason }}</small></td><td class="album-column">{{ row.album }}</td>
        <td class="track-duration">{{ formatMillisecondsToTime(Number(row.duration) * 1000) }}</td>
        <td><div class="track-actions"><button :aria-label="(row.likeStatus ? 'Unlike ' : 'Like ') + row.songName" :aria-pressed="!!row.likeStatus && userStore.isLoggedIn" class="icon-button" @click="handleLike(row, $event)"><icon-mdi:cards-heart v-if="row.likeStatus && userStore.isLoggedIn" class="text-red-500"/><icon-mdi:cards-heart-outline v-else/></button><button class="icon-button" :aria-label="'Download ' + row.songName" @click="downLoadMusic(row, $event)"><icon-material-symbols:download/></button></div></td>
      </tr><tr v-if="!data?.length"><td colspan="5" class="empty-state">No tracks found.</td></tr></tbody>
    </table>
  </div>
</template>

<style scoped>
.recommendation-reason { display: block; max-width: 300px; font-size: 11px; line-height: 1.5; opacity: .65; margin-top: 4px; white-space: normal; }
</style>
