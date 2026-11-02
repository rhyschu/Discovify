import { trackModel } from '@/stores/interface'
import { defaultSong } from '@/config/playbackDefaults'
import { ElNotification } from 'element-plus'
import { PlayMode } from './interface'
import { urlV1 } from '@/api'
import { recordListeningEvent } from '@/api/system'
import { UserStore } from '@/stores/modules/user'
interface AudioPlayer {
  isPlaying: Ref<boolean>
  currentTrack: ComputedRef<trackModel>
  currentTime: Ref<number>
  duration: Ref<number>
  volume: Ref<number>
  //   currentLyricIndex: Ref<number>
  audioElement: Ref<HTMLAudioElement | null>
  play: () => void
  pause: () => void
  nextTrack: () => void
  prevTrack: () => void
  seek: (time: number) => void
  togglePlayPause: () => void
  setVolume: (volume: number) => void
  setPlayMode: (mode: PlayMode) => void
  loadTrack: () => Promise<void>
}

export const AudioPlayer = () => {
  const audioStore = AudioStore()
  const audioElement = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const volume = ref()
  const playMode = ref<PlayMode>('order')
  const currentTrack = computed<trackModel>(
    () => audioStore.trackList[audioStore.currentSongIndex] || defaultSong
  )
  const currentTime = ref(0)
  const duration = ref(0)
  const listener = UserStore()
  let listenId = crypto.randomUUID()
  let listenedSeconds = 0
  let lastTick = 0
  let listenRecorded = false
  let recording = false
  const resetListening = () => {
    listenId = crypto.randomUUID()
    listenedSeconds = 0
    lastTick = 0
    listenRecorded = false
    recording = false
  }
  watch(() => listener.userInfo?.token, resetListening)
  //   const currentLyricIndex = ref(0)

  //   currentTrack.value.lyrics?.lyrics
  //   const updateCurrentLyricIndex = (newTime: number = 0) => {
  //     if (!currentTrack.value.lyrics?.lines) return
  //     const lyrics = currentTrack.value.lyrics.lines
  //     const targetIndex = lyrics.findIndex(
  //       (line: { time: number }) => line.time > newTime * 1000
  //     )
  //     currentLyricIndex.value =
  //       targetIndex === -1 ? lyrics.length - 1 : targetIndex - 1
  //   }
  const play = () => {
    if (audioElement.value) {
      audioElement.value.play()
      isPlaying.value = true
    }
  }
  const seek = (time: number) => {
    if (audioElement.value) {
      audioElement.value.currentTime = time
      currentTime.value = time
    }
  }
  const pause = () => {
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }
  }
  const nextTrack = async () => {
    switch (playMode.value) {
      case 'loop':
        if (audioStore.currentSongIndex < audioStore.trackList.length - 1) {
          audioStore.currentSongIndex++
        } else {
          audioStore.currentSongIndex = 0 // From start
        }
        break
      case 'shuffle':
        audioStore.currentSongIndex = Math.floor(
          Math.random() * audioStore.trackList.length
        )
        break
      case 'single':
        audioElement.value!.currentTime = 0
        break
      case 'order':
      default:
        if (audioStore.currentSongIndex < audioStore.trackList.length - 1) {
          audioStore.currentSongIndex++
        } else {
          audioStore.currentSongIndex = 0 // From start
        }
        break
    }
    await loadTrack()
    play()
  }
  const prevTrack = async () => {
    switch (playMode.value) {
      case 'loop':
        if (audioStore.currentSongIndex > 0) {
          audioStore.currentSongIndex--
        } else {
          audioStore.currentSongIndex = audioStore.trackList.length - 1 // From end
        }
        break
      case 'shuffle':
        audioStore.currentSongIndex = Math.floor(
          Math.random() * audioStore.trackList.length
        )
        break
      case 'single':
        audioElement.value!.currentTime = 0
        break
      case 'order':
      default:
        if (audioStore.currentSongIndex > 0) {
          audioStore.currentSongIndex--
        } else {
          audioStore.currentSongIndex = audioStore.trackList.length - 1 // From end
        }
        break
    }
    await loadTrack()
    play()
  }
  const loadTrack = async () => {
    resetListening()
    await checkUrl()
    // checkLyrics()

    if (audioElement.value) {
      audioElement.value.src = currentTrack.value.url
      audioElement.value.load()
    }
  }
  const checkUrl = async () => {
    if (!currentTrack.value.url) {
      const response = await urlV1(currentTrack.value.id)
      const url = response.data[0]?.url 

      if (!url) return
      const trackIndex = audioStore.trackList.findIndex(
        (track: { id: any }) => track.id === currentTrack.value.id
      )
      if (trackIndex !== -1) {
        audioStore.trackList[trackIndex].url = url // Update URL
      }
    }
    return Promise.resolve()
  }
  //   const checkLyrics = () => {
  //     if (!currentTrack.value.lyrics) {
  //       lyricNew(currentTrack.value.id).then((response) => {
  //         const trackIndex = audioStore.trackList.findIndex(
  //           (track: { id: any }) => track.id === currentTrack.value.id
  //         )
  //         if (trackIndex !== -1) {
  //           audioStore.trackList[trackIndex].lyrics =
  //         }
  //       })
  //     }
  //   }
  const updateTime = () => {
    if (audioElement.value) {
      currentTime.value = audioElement.value.currentTime
      const now = performance.now()
      if (!audioElement.value.paused && !audioElement.value.seeking && audioElement.value.readyState >= 3 && lastTick) {
        // Accumulate actual playback wall time; seeking to 30 seconds does not count as listening.
        listenedSeconds += Math.min((now - lastTick) / 1000, 1)
      }
      lastTick = now
      if (listener.isLoggedIn && listenedSeconds >= 30 && !listenRecorded && !recording) {
        const sentId = listenId
        recording = true
        recordListeningEvent(Number(currentTrack.value.id), sentId, Math.floor(listenedSeconds))
          .then(result => { if (listenId === sentId && result.code === 0) listenRecorded = true })
          .catch(() => { /* Optional telemetry must not interrupt playback. */ })
          .finally(() => { if (listenId === sentId) recording = false })
      }
    }
  }
  const onLoadedMetadata = () => {
    if (audioElement.value) {
      duration.value = audioElement.value.duration
    }
  }
  const togglePlayPause = () => {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }
  const setVolume = (newVolume: number) => {
    if (audioElement.value) {
      volume.value = newVolume
      audioStore.setAudioStore('volume', newVolume)
      audioElement.value.volume = newVolume / 100
    }
  }
  const setPlayMode = (mode: PlayMode) => {
    playMode.value = mode
    const modeText = {
      order: 'Play in order',
      shuffle: 'Shuffle',
      loop: 'Repeat all',
      single: 'Repeat one',
    }
    ElNotification({
      title: 'Playback mode',
      message: `Switched to ${modeText[mode]}`,
      type: 'success',
    })
  }
  //   watch(currentTime, (newTime) => {
  //     updateCurrentLyricIndex(newTime)
  //   })
  onMounted(() => {
    audioElement.value = new Audio(currentTrack.value.url)
    volume.value = audioStore.volume || 50
    audioElement.value.volume = volume.value / 100
    // checkLyrics()
    audioElement.value.addEventListener('timeupdate', updateTime)
    audioElement.value.addEventListener('ended', nextTrack)
    audioElement.value.addEventListener('loadedmetadata', onLoadedMetadata)
  })
  onUnmounted(() => {
    if (audioElement.value) {
      audioElement.value.removeEventListener('timeupdate', updateTime)
      audioElement.value.removeEventListener('ended', nextTrack)
      audioElement.value.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  })

  const audioPlayer: AudioPlayer = {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    // currentLyricIndex,
    audioElement,
    play,
    pause,
    nextTrack,
    prevTrack,
    seek,
    togglePlayPause,
    setVolume,
    setPlayMode,
    loadTrack,
  }

  return audioPlayer
}

export const useAudioPlayer = (): AudioPlayer => {
  const audioPlayer = inject<AudioPlayer>('audioPlayer')
  if (!audioPlayer) {
    throw new Error('useAudioPlayer must be used within a provider')
  }
  return audioPlayer
}
