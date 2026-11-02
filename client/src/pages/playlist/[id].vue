<script setup lang="ts">
import { getPlaylistDetail, addPlaylistComment, likeComment, deleteComment } from '@/api/system'
import { formatNumber } from '@/utils'
import type { PlaylistDetail, Song } from '@/api/interface'
import coverImg from '@/assets/cover.png'
import { usePlaylistStore } from '@/stores/modules/playlist'
import { useFavoriteStore } from '@/stores/modules/favorite'
import { ElMessage } from 'element-plus'
import { UserStore } from '@/stores/modules/user'

const route = useRoute()
const audui = AudioStore()
const playlistStore = usePlaylistStore()
const favoriteStore = useFavoriteStore()
const userStore = UserStore()
const playlist = computed(() => playlistStore.playlist)
const songs = computed(() => playlistStore.songs)
const { loadTrack, play } = useAudioPlayer()
const activeTab = ref('songs')
const isCollected = computed(() => {
  const playlistId = Number(route.params.id)
  return favoriteStore.favoritePlaylists.some(item => item.id === playlistId)
})
const toggleCollect = async () => {
  try {
    const playlistId = Number(route.params.id)
    if (isCollected.value) {
      await favoriteStore.cancelCollectPlaylist(playlistId)
    } else {
      await favoriteStore.collectPlaylist(playlistId)
    }
  } catch (error) {
    ElMessage.error('Operation failed')
  }
}

interface PlaylistComment {
  commentId: number
  username: string
  userAvatar: string
  content: string
  createTime: string
  likeCount: number
}
const commentContent = ref('')
const maxLength = 180
const comments = computed(() => {
  const rawComments = (playlistStore.playlist?.comments || []) as PlaylistComment[]
  return rawComments
    .map(comment => ({
      ...comment,
      likeCount: comment.likeCount
    }))
    .sort((a, b) => {
      return b.commentId - a.commentId
    })
})
const currentUsername = computed(() => userStore.userInfo?.username || '')
const handleComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please sign in')
    return
  }

  if (!commentContent.value.trim()) {
    ElMessage.warning('Write a comment')
    return
  }
  
  try {
    const playlistId = Number(route.params.id)
    const content = commentContent.value.trim()
    
    const res = await addPlaylistComment({
      playlistId,
      content
    })
    
    if (res.code === 0) {
      ElMessage.success('Comment posted')
      commentContent.value = ''
      const detailRes = await getPlaylistDetail(playlistId)
      if (detailRes.code === 0 && detailRes.data) {
        const playlistData = detailRes.data as PlaylistDetail
        playlistStore.setPlaylistInfo({
          ...playlistStore.playlist!,
          comments: playlistData.comments || []
        })
      }
    } else {
      ElMessage.error('Could not post comment')
    }
  } catch (error) {
    ElMessage.error('Could not post comment')
  }
}
const handleLike = async (comment: PlaylistComment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please sign in')
    return
  }

  try {
    const res = await likeComment(comment.commentId)
    if (res.code === 0) {
      const updatedComments = comments.value.map(item => {
        if (item.commentId === comment.commentId) {
          return {
            ...item,
            likeCount: item.likeCount + 1
          }
        }
        return item
      })
      playlistStore.setPlaylistInfo({
        ...playlistStore.playlist!,
        comments: updatedComments
      })

      ElMessage.success('Comment liked')
    }
  } catch (error) {
    ElMessage.error('Could not like comment')
  }
}
const handleDelete = async (comment: PlaylistComment) => {
  try {
    const res = await deleteComment(comment.commentId)
    if (res.code === 0) {
      ElMessage.success('Deleted')
      const playlistId = Number(route.params.id)
      const detailRes = await getPlaylistDetail(playlistId)
      if (detailRes.code === 0 && detailRes.data) {
        const playlistData = detailRes.data as PlaylistDetail
        playlistStore.setPlaylistInfo({
          ...playlistStore.playlist!,
          comments: playlistData.comments || []
        })
      }
    } else {
      ElMessage.error('Could not delete record')
    }
  } catch (error) {
    ElMessage.error('Could not delete record')
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      playlistStore.setPlaylistInfo(null)
      playlistStore.setSongs([])
      const res = await getPlaylistDetail(Number(id))
      if (res.code === 0 && res.data && typeof res.data === 'object' && 'songs' in res.data) {
        const playlistData = res.data as PlaylistDetail
        const convertedSongs: Song[] = playlistData.songs.map(song => ({
          songId: song.songId,
          songName: song.songName,
          artistName: song.artistName,
          album: song.album,
          duration: song.duration,
          coverUrl: song.coverUrl || coverImg,
          audioUrl: song.audioUrl,
          likeStatus: song.likeStatus,
          releaseTime: song.releaseTime
        }))

        playlistStore.setSongs(convertedSongs)
        playlistStore.setPlaylistInfo({
          name: playlistData.title,
          description: playlistData.introduction,
          coverImgUrl: playlistData.coverUrl || coverImg,
          creator: {
            nickname: 'Discovify',
            avatarUrl: coverImg
          },
          trackCount: playlistData.songs.length,
          tracks: convertedSongs,
          commentCount: playlistData.comments?.length || 0,
          tags: [],
          comments: playlistData.comments || []
        })
      }
    }
  },
  { immediate: true }
)

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
</script>
<template>
  <div class="flex flex-col h-full bg-background flex-1 md:overflow-hidden">
    <div class="flex flex-col md:flex-row p-6 gap-6">
      <div class="flex-shrink-0 w-60 h-60">
        <img :alt="playlist?.name" class="w-full h-full object-cover rounded-lg shadow-lg"
          :src="(playlist?.coverImgUrl || coverImg) + '?param=500y500'" />
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ playlist?.name }}</h1>
          <p class="text-muted-foreground mb-4 line-clamp-2" :title="playlist?.description">
            {{ playlist?.description }}
          </p>
          <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span class="relative flex shrink-0 overflow-hidden rounded-full w-6 h-6">
              <img class="aspect-square h-full w-full" :alt="playlist?.creator.nickname"
                :src="playlist?.creator.avatarUrl" /></span>
            <span>{{ playlist?.creator.nickname }}</span>
            <span>•</span>
            <span>{{ playlist?.trackCount }}  tracks</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground" v-if="playlist?.tags">
            <el-tag v-for="tag in playlist?.tags" class="text-sm" effect="dark" :key="tag">{{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4">
          <button @click="handlePlayAll"
            class="text-white inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg px-8">
            <icon-solar:play-line-duotone />
            Play all</button>
          <button @click="toggleCollect"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-hoverMenuBg h-10 w-10 rounded-lg border-2 border-gray-300"
            :class="{ 'text-red-500': isCollected }">
            <icon-ic:round-favorite v-if="isCollected" class="text-xl" />
            <icon-ic:round-favorite-border v-else class="text-xl" />
          </button>
        </div>
      </div>
    </div>

    <div class="px-6 flex-1 flex flex-col overflow-hidden">
      <div class="border-b pb-1">
        <div
          class="inline-flex h-10 items-center rounded-lg bg-muted/70 p-1 text-muted-foreground w-full justify-start mb-2">
          <button v-for="tab in [
            { name: 'Song', value: 'songs' },
            { name: 'Comments', value: 'comments' }
          ]" :key="tab.value" @click="activeTab = tab.value" :class="{
            'bg-activeMenuBg text-foreground shadow-sm': activeTab === tab.value
          }"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {{ tab.name }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto min-h-0">
        <div v-show="activeTab === 'songs'">
          <Table :data="songs" />
        </div>
        <div v-show="activeTab === 'comments'" class="py-4">
          
          <div class="p-4 mb-4">
            <div class="flex items-start gap-3 mr-8">
              <div class="flex-1">
                <el-input
                  v-model="commentContent"
                  type="textarea"
                  :rows="3"
                  :maxlength="maxLength"
                  placeholder="Join the conversation"
                  resize="none"
                  show-word-limit
                />
                <div class="flex justify-end items-center mt-4 mr-1">
                  <button @click="handleComment" :disabled="!commentContent.trim()"
                    class="px-6 py-1.5 bg-primary text-white rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors">
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6 ml-6">
            <h3 class="font-bold mb-4">Latest comments ({{ formatNumber(playlist?.commentCount ?? 0) }})</h3>
            <div v-if="comments.length">
              <template v-for="comment in comments" :key="comment.commentId">
                <div class="flex gap-3 py-4 group mr-12">
                  <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    <img :src="comment.userAvatar || coverImg" alt="avatar" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-blue-500">{{ comment.username }}</span>
                    </div>
                    <p class="text-sm mt-1 mb-2">{{ comment.content }}</p>
                    <div class="flex items-center justify-between text-sm text-gray-400">
                      <span class="text-xs">{{ comment.createTime }}</span>
                      <div class="flex items-center gap-4">
                        
                        <button v-if="comment.username === currentUsername"
                          class="flex items-center gap-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          @click="handleDelete(comment)"
                        >
                          <icon-material-symbols:delete-outline />
                          <span>Delete</span>
                        </button>
                        <button 
                          class="flex items-center gap-1 hover:text-gray-600 mr-1"
                          @click="handleLike(comment)"
                        >
                          <span>{{ formatNumber(comment.likeCount) }}</span>
                          <icon-material-symbols:thumb-up />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="border-b border-gray-300/70 mr-12"></div>
              </template>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No comments yet. Start the conversation.~</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 12px !important;
}
</style>
