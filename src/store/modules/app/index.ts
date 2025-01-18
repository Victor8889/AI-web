/*
 *  * @Description: 移动端配置
 */
import { createPinia, defineStore } from 'pinia'
import type { AppState, Language, Theme } from './helper'
import { getLocalSetting, setLocalSetting } from './helper'
// import { store } from '@/store'

export const store = createPinia()
/* 代码 `export const useAppStore = DefineStore('app-store', {...})` 使用 Pinia 库中的 `defineStore`
函数定义一个名为“app-store”的商店模块。 */
export const useAppStore = defineStore('app-store', {
  state: (): AppState => getLocalSetting(),
  actions: {
    // 删除app模式下侧边栏的聊天室
    setSiderCollapsed(collapsed: boolean) {
      this.siderCollapsed = collapsed
      this.recordState()
    },

    setTheme(theme: Theme) {
      this.theme = theme
      this.recordState()
    },

    setLanguage(language: Language) {
      if (this.language !== language) {
        this.language = language
        this.recordState()
      }
    },

    recordState() {
      setLocalSetting(this.$state)
    },
  },
})

export function useAppStoreWithOut() {
  return useAppStore(store)
}
