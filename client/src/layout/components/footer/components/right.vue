<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Recently from './recently.vue'
const { volume, setVolume, setPlayMode } = useAudioPlayer()

const isMuted = computed(() => volume.value === 0)

const toggleVolume = () => {
  setVolume(isMuted.value ? 0.5 : 0)
}
const playModes = {
  order: {
    icon: 'ri:order-play-line',
    next: 'shuffle',
    tooltip: 'Play in order'
  },
  shuffle: {
    icon: 'ri:shuffle-line',
    next: 'loop',
    tooltip: 'Shuffle'
  },
  loop: {
    icon: 'ri:repeat-2-line',
    next: 'single',
    tooltip: 'Repeat all'
  },
  single: {
    icon: 'ri:repeat-one-line',
    next: 'order',
    tooltip: 'Repeat one'
  }
}

const currentMode = ref('order')

const togglePlayMode = () => {
  const nextMode = playModes[currentMode.value].next
  currentMode.value = nextMode
  setPlayMode(nextMode)
}
</script>
<template>
  <div class="player-extras flex items-center pr-4">
    <div class="flex items-center mx-4">
      <el-tooltip :content="playModes[currentMode].tooltip" placement="top" effect="dark">
        <button class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9" :aria-label="playModes[currentMode].tooltip" @click="togglePlayMode">
          <Icon :icon="playModes[currentMode].icon" class="w-full h-full" />
        </button>
      </el-tooltip>
    </div>
    <button aria-label="Toggle mute" @click="toggleVolume" class="p-2 rounded-full hover:bg-hoverMenuBg transition w-9 h-9">
      <Icon :icon="isMuted ? 'ic:round-volume-off' : 'ic:round-volume-up'" class="w-full h-full" />
    </button>
    <el-slider v-model="volume" :show-tooltip="false" @change="setVolume" class="!w-24 mr-4" size="small" :max="100" />
    <Recently />
  </div>
</template>
<style lang="scss">
.el-slider__button-wrapper {
  display: none !important;
}
</style>
