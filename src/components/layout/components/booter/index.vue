<script>
import { computed, defineAsyncComponent, onMounted, reactive, ref, toRefs, watch } from 'vue'

import { Moon, Present, Sunny } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getBreadcrumb, getTabs, getThemes, setBreadcrumb } from '../../../../utils/storages.js'
import UserInfo from '../navbar/UserInfo.vue'
import { _changeSetting, _data, _getThemes } from '../setting/index.js'
import Logo from '../Logo.vue'
import PresentDialog from './present.vue'
import SidebarItem from './SidebarItem.vue'
import { useAppStore, userParStore, vuexStore } from '@/store'
import 'element-plus/theme-chalk/index.css'

export default {
  components: {
    Logo,
    SidebarItem,
    Sunny,
    Moon,
    Present,
    UserInfo,
    PresentDialog,
  },
  props: {
    mode: String,
    showLogo: Boolean,
    collapse: Boolean,

  },

  setup(props) {
    try {
      const parStore = userParStore()
      const store = vuexStore// useStore()
      const collapse = props.collapse
      const themes = getThemes()
      const data = reactive({
        setting: null,
        breadcrumb: getBreadcrumb(),
        activeMenu: '',
        menuList: [
          { menuId: 'home', menuName: '主页', path: 'home', children: [] },
          { menuId: 'gpt', menuName: '助手聊天', path: 'Chat', children: [] },
          { menuId: 'mj', menuName: '文生图', path: 'mj', children: [] },
          { menuId: 'swd', menuName: '思维导图', path: 'swd', children: [] },
          { menuId: 'qr', menuName: '二维码生成', path: 'qr', children: [] },
          { menuId: 'pho', menuName: '图片处理', path: 'pho', children: [] },
          { menuId: 'video', menuName: '文生视频', path: 'video', children: [] },
        ],
        nightMode: themes.nightMode,
      })
      const ms = useMessage()
      const Present = defineAsyncComponent(() => import('./present.vue'))
      const showPresent = ref(false)

      const router = useRouter()
      const appStore = useAppStore()
      const data_ = reactive(_data)
      onMounted(() => {
        _getThemes({ data: data_ })
      })
      const changeSetting = (type, value) => {
        _changeSetting({ type, value, store, data })
      }

      const isShowLogo = computed(() => {
        return props.showLogo
      })

      const isCollapse = computed(() => {
        if (props.collapse)
          return collapse
        else
          return store.state.isCollapse
      })
      const navigateTo = (item) => {
        if (item.path === 'pho' || item.path === 'video')
          ms.info('开发中，敬请期待')
        else
          router.push({ name: item.path })
      }
      const _tabs = getTabs()
      _tabs.forEach((item) => {
        if (item.active)
          data.activeMenu = item.id
      })

      const _getParentMenu = (list, id) => {
        for (const i in list) {
          if (list[i].menuId === id)
            return [list[i]]

          if (list[i].children) {
            const node = _getParentMenu(list[i].children, id)
            if (node !== undefined)
              return node.concat(list[i])
          }
        }
      }
      setBreadcrumb(_getParentMenu(data.menuList, data.activeMenu))

      function openJd() {
        window.open('https://3.cn/1NdBD-bL')
      }
      watch(
        () => store.state.activeMenu,
        (value, old) => {
          data.activeMenu = value
          setBreadcrumb(_getParentMenu(data.menuList, value))
          data.breadcrumb = getBreadcrumb()
        },
      )

      const toggleNightMode = () => {
        data.nightMode = !data.nightMode
        changeSetting('nightMode', data.nightMode)
        // chatgpt切换主题颜色light、dark
        let chatgptTheme = 'light'
        if (data.nightMode)
          chatgptTheme = 'dark'
        appStore.setTheme(chatgptTheme)
        parStore.updateNight(data.nightMode)
      }
      return {
        ...toRefs(data),
        isShowLogo,
        isCollapse,
        navigateTo, // 返回 navigateTo 函数
        toggleNightMode,
        // 将showSetting方法修改为openSettingDialog方法
        // openSettingDialog,
        Present,
        showPresent,
        openJd,
        // 添加弹窗状态

      }
    }

    catch (error) {
      console.error(error)
      throw error
    }
  },
}
</script>

<template>
  <el-menu
    :default-active="activeMenu" :unique-opened="true" :mode="mode"
    :collapse="isCollapse && mode !== 'horizontal'" :class="{ 'no-transition': isCollapse }"
  >
    <Logo v-if="isShowLogo" />
    <!-- <sidebar-item v-for="item in menuList" :key="item.menuId" :item="item" :collapse="collapse"></sidebar-item> -->
    <SidebarItem v-for="item in menuList" :key="item.menuId" :item="item" :collapse="collapse" @click="navigateTo(item)">
      <template #icon />
    </SidebarItem>
    <div class="left-bottom">
      <!-- <figure style="position: relative; display: inline-block;" @click="openJd">
        <img
          src="/img/side-red.jpg" style="border-radius: 5px; width: auto;
         height: 120px; margin-right: 10px; margin-bottom: 50px;" alt="谢谢"
        >
        <figcaption style="position: absolute; top: 28%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <span style="font-size: small; color: aliceblue;">云服务器88元/年</span>
        </figcaption>
      </figure> -->
      <div class="hover-button-container">
        <HoverButton @click="showPresent = true">
          <span class=" text-[#4f555e] dark:text-white">
            <Present class="navbar-icon" :class="nightMode ? 'sun-mode' : 'night-mode'" />
          </span>
        </HoverButton>
        <PresentDialog v-model="showPresent" /><!-- :grid-data="gridData" -->
      </div>
      <Moon v-if="!nightMode" class="navbarm-icon" @click="toggleNightMode" />
      <Sunny v-else class="navbarm-icon sun-mode" @click="toggleNightMode" />
      <UserInfo />
    </div>

    <!-- <SystemSetting ref="setting" /> -->
  </el-menu>
</template>

<style lang="css">
.collapse-btn {
  width: 2em;
  height: 2em;
  background-color: #777575;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid #ccc;
}

.collapse-btn i {
  font-size: 1.2em;
}

.top-div {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin: 0 4px;
  justify-content: space-between;
}
  /**
  新加css 用户、设置等样式
  */
.left-bottom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: column;
  position: absolute;
  bottom: 15px;
  right: 0;
  left: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
}.left-bottom > *:not(:last-child) {
  margin-bottom: 12px; /* 设置垂直间距 */
}
  .navbar-icon {
    width: 1.5em !important;
    height: 1.5em;
    cursor: pointer;
  }
.navbarm-icon {
  width: 1.5em;
  height: 1.5em;
  cursor: pointer;
}
.sun-mode{
  color: #fff;
}
</style>
