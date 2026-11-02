import { defineStore } from 'pinia'
import piniaPersistConfig from '@/stores/helper/persist'
import { SettingState } from '@/stores/interface'

export const settingStore = defineStore({
  id: 'settingStore',
  state: (): SettingState => ({
    isDrawerCover: true,
    isOriginalParsed: true,
    isTranslatedParsed: true,
    isRomaParsed: true,
    language: null,
  }),
  actions: {
    // Set SettingState
    setSettingState(...args: ObjToKeyValArray<SettingState>) {
      this.$patch({ [args[0]]: args[1] } as Record<string, any>)
    },
  },
  persist: piniaPersistConfig('settingStore'),
})
