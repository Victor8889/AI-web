/*
 * @Author: ll
 * @Description: 使用pinia
 */
import type { App } from 'vue'
import { createStore } from 'vuex'
import { store } from '@/store'
/* 语句“export const store = createPinia()”正在创建一个 Pinia
存储实例并将其导出为名为“store”的命名导出。该存储实例可用于管理应用程序中的状态并执行操作。它通常与 Vue.js 应用程序一起使用，以提供集中式状态管理解决方案。 */
// export const store = createPinia()

/**
 * 该函数为应用程序设置商店。
 * @param {App} app - “app”参数是 Vue 应用程序的实例。它用于安装商店插件并使其可供应用程序中的所有组件使用。
 */
export function setupStore(app: App) {
  app.use(store)
}
/* The code `const navbarType = getThemes()?.navbarType ?? '左侧菜单模式'` is assigning the value of
`navbarType` based on the result of `getThemes()?.navbarType`. */
const navbarType = '左侧菜单混合模式' // getThemes()?.navbarType ??
/* 该代码使用“vuex”库中的“createStore”函数创建一个 Vuex 存储。存储是一个保存应用程序的状态、突变、操作和模块的对象。 */
const vuexStore = createStore({
  state: {
    navbarType: '左侧菜单混合模式',
    isCollapse: false,
    activeMenu: '',
  },
  mutations: {
    // 设置导航栏类型
    setNavbarType(state, navbarType) {
      state.navbarType = navbarType
    },

    // 设置菜单折叠状态
    setCollapse(state, isCollapse) {
      state.isCollapse = isCollapse
    },

    // 设置当前选中菜单
    setActiveMenu(state, activeMenu) {
      state.activeMenu = activeMenu
    },
    // 获取当前选中菜单
    /**
     * 该函数将状态中的活动菜单设置为提供的数据。
     * @param state - “state”参数是一个表示应用程序当前状态的对象。它可能包含存储数据和控制应用程序行为的各种属性和值。
     * @param data - “data”参数是“state”对象中“activeMenu”属性的新值。
     */
    getActiveMenu(state, data) {
      state.activeMenu = data
    },

    getActiveMobileMenu(state) {
      return state.activeMenu
    },
  },
  actions: {},
  modules: {},
})

/* 语句 `export * from './modules'` 正在从 `./modules`
文件中导出所有命名的导出。它允许您从当前文件中的“./modules”文件重新导出所有功能。这意味着“./modules”文件中定义的任何命名导出都可以导入从此文件导入的其他文件中。 */
export * from './modules'
export { vuexStore }
