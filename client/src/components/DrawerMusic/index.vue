<script setup lang="ts">
import Left from './left.vue'
import Right from './right.vue'
import { useDark, useToggle } from '@vueuse/core'
import { useDateFormat, useNow } from '@vueuse/core'
import { getSongDetail } from '@/api/system'
import type { SongDetail } from '@/api/interface'
import { ref, provide } from 'vue'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { themeStore } from '@/stores/modules/theme'

const formatted = useDateFormat(useNow(), 'HH:mm:ss')
const theme = themeStore()
const showDrawer = defineModel<boolean>()
const songDetail = ref<SongDetail | null>(null)

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)
const toggleMode = () => {
  theme.setDark(!isDark.value)
  toggleDark()
}
const { currentTrack } = useAudioPlayer()
watch(() => currentTrack.value.id, async (newId) => {
  if (newId) {
    try {
      const res = await getSongDetail(Number(newId))
      if (res.code === 0 && res.data) {
        const songData = res.data as unknown as SongDetail
        if (
          'songId' in songData &&
          'songName' in songData &&
          'artistName' in songData &&
          'album' in songData
        ) {
          songDetail.value = songData
        } else {
          console.error('Invalid song details received')
        }
      }
    } catch (error) {
      console.error('Could not load song details:', error)
    }
  }
}, { immediate: true })
provide('songDetail', songDetail)
</script>
<template>
  <el-drawer :style="{
    '--track-cover-url': `url(${currentTrack.cover})`,
  }" v-model="showDrawer" direction="btt" size="100%" :modal="false" :showClose="false"
    class="drawer-bg backdrop-filter backdrop-blur-md">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-center gap-2 text-primary-foreground">
          <el-button text circle @click="showDrawer = false">
            <icon-uiw:down />
          </el-button>
        </div>
        <div class="flex items-center gap-1">
          <icon-meteor-icons:clock />
          <span class="text-base"> {{ formatted }} </span>
        </div>
      </div>
    </template>
    <main class="flex h-full">
      <div class="flex w-full flex-1">
        <div class="w-1/2">
          <Left />
        </div>
        <div class="w-1/2 relative">
          <Right />
        </div>
      </div>
    </main>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-switch v-model="theme.isDark" @change="toggleMode" active-text="Dark mode" />
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.drawer-bg {
  background-image: var(--track-cover-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.drawer-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  z-index: -1;
}
</style>
