<script setup lang="ts">
import { getFavoriteSongs } from '@/api/system'
import type { Song } from '@/api/interface'
import coverImg from '@/assets/cover.png'
import { AudioStore } from '@/stores/modules/audio'
import { useRoute } from 'vue-router'

const route = useRoute()
const audui = AudioStore()
const { loadTrack, play } = useAudioPlayer()

const songs = ref<Song[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const playlist = ref({
    name: 'Liked songs',
    coverImgUrl: coverImg,
    trackCount: 0,
    tags: []
})

interface PageResult {
    items: Song[]
    total: number
}

const getSongs = async () => {
    const res = await getFavoriteSongs({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        songName: searchKeyword.value,
        artistName: '',
        album: ''
    })
    if (res.code === 0 && res.data) {
        const pageData = res.data as PageResult
        songs.value = pageData.items
        playlist.value.trackCount = pageData.total
        if (pageData.items.length > 0) {
            playlist.value.coverImgUrl = pageData.items[0].coverUrl || coverImg
        }
    }
}

const handleSearch = () => {
    currentPage.value = 1 
    getSongs()
}

const handlePlayAll = async () => {
    audui.setAudioStore('trackList', [])

    if (!songs.value.length) return

    const result = songs.value.map(song => ({
        id: song.songId.toString(),
        title: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: song.coverUrl || coverImg,
        url: song.audioUrl,
        duration: parseFloat(song.duration) * 1000,
        likeStatus: song.likeStatus
    }))

    audui.setAudioStore('trackList', result)
    audui.setAudioStore('currentSongIndex', 0)
    await loadTrack()
    play()
}
watch(() => audui.currentPageSongs, (newSongs) => {
    if (newSongs && newSongs.length > 0) {
        const hasUnlikedSong = newSongs.some((song) => song.likeStatus === 0)
        if (hasUnlikedSong) {
            getSongs()
        }
    }
}, { deep: true })
watch(() => route.path, (newPath) => {
    if (newPath === '/like') {
        getSongs()
    }
})

onMounted(() => {
    getSongs()
})
</script>

<template>
  <div class="flex flex-col h-full bg-background flex-1 md:overflow-hidden">
    <div class="flex flex-col md:flex-row p-6 gap-6">
      <div class="flex-shrink-0 w-60 h-60">
        <img :alt="playlist.name" class="w-full h-full object-cover rounded-lg shadow-lg"
          :src="playlist.coverImgUrl + '?param=500y500'" />
      </div>
      <div class="flex flex-col justify-between flex-1">
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ playlist.name }}</h1>
          <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4 ml-1">
            <span>{{ playlist.trackCount }}  tracks</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground" v-if="playlist.tags">
            <el-tag v-for="tag in playlist.tags" class="text-sm" effect="dark" :key="tag">{{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4">
          <button @click="handlePlayAll"
            class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg px-8">
            <icon-solar:play-line-duotone />
            Play all
          </button>

          <div class="relative">
            <icon-akar-icons:search
              class="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input v-model="searchKeyword" @keyup.enter="handleSearch"
              class="flex h-10 rounded-lg border border-input transform duration-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 pl-10 w-56"
              placeholder="Search" />
          </div>
        </div>
      </div>
    </div>
    <Table :data="songs" class="flex-1 md:overflow-x-hidden" />
    <nav class="mx-auto flex w-full justify-center mt-3">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="playlist.trackCount"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getSongs"
        @current-change="getSongs"
        class="mb-3"
      />
    </nav>
  </div>
</template>