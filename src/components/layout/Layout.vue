<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useMessage } from 'naive-ui'
// import login from '../../views/login/login.vue'
import { getNight } from '../../utils/storages.js'
import { Sidebar } from './layout'
import { useAuthStore, vuexStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

export default {

  name: 'Layout',
  components: {
    Sidebar,
    Fold,
    Expand,
  },
  setup() {
    const message = useMessage()
    const router = useRouter()
    const route = useRoute()
    const store = vuexStore// useStore()

    const authStore = useAuthStore()
    const needPermission = computed(() => !authStore.token)

    const { isMobile } = useBasicLayout()
    // 点击跳转
    const routerView = (view) => {
      // sessionStorage.setItem('activeMobileMenu', view)
      // if (view === 'person' && needPermission.value) {
      //   router.push('/login')
      //   return
      // }

      store.commit('setActiveMenu', view)
      router.push({ name: view })
    }

    const activeMenu = computed(() => {
      return store.state.activeMenu.toString()
    })
    const mobileMenu = ref('')

    onMounted(() => {
      let active = sessionStorage.getItem('activeMobileMenu')
      if (active.startsWith('/'))
        active = active.substring(1)
      if (active === 'chat')
        active = 'Chat'
      mobileMenu.value = active
    })
    watch(
      isMobile,
      (val) => {
        if (val)
          store.state.isCollapse = true
        else
          store.state.isCollapse = false
      },
    )

    // 获取屏幕尺寸适配移动端
    const getMobileClass = computed(() => {
      if (isMobile.value)
        return ['rounded-none', 'shadow-none']
      return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
    })

    const getContainerClass = computed(() => {
      return [
        'h-full',
        { 'pl-[260px]': !isMobile.value },
      ]
    })

    const isShow = ref(true)
    if (isMobile.value) {
      store.state.isCollapse = true
      isShow.value = false
    }

    const themes = ref(getNight())

    const nightMode = computed(() => themes.value.nightMode)// computed(() => themes.value.nightMode)

    // 监听 nightMode 的变化，如果使用外部函数的方式，就可以避免代码重复

    // 获取当前路径
    const currentPath = computed(() => {
      return route.path
    })

    // 导航栏类型
    const navbarType = computed(() => {
      return store.state.navbarType
    })

    // 是否折叠菜单
    const isCollapse = computed(() => {
      return store.state.isCollapse
    })

    // 侧边栏宽度
    const sidebarWidth = computed(() => {
      if (isMobile.value)
        return store.state.isCollapse ? '0px' : '64px'

      else return store.state.isCollapse ? '0px' : '64px' // You can set the default width when not mobile
    })
    const toggleSidebarWidth = () => {
      store.state.isCollapse = !store.state.isCollapse
    }

    return {
      nightMode,
      currentPath,
      navbarType,
      isCollapse,
      sidebarWidth,
      Sidebar,
      toggleSidebarWidth,
      Expand,
      isMobile,
      getMobileClass,
      getContainerClass,
      Fold,
      isShow,
      textContext: '欢迎体验AI，希望能帮助您减轻压力，提供更多灵感，减少工作负担。请文明使用，杜绝滥用；如有违法行为，将立即封禁账号。我们将不定期进行AI限免活动，同时我们进行长期维护，随时更新新的功能，请及时关注。更多AI敬请期待',
      routerView,
      activeMenu,
      mobileMenu,
      active1: sessionStorage.getItem('activeMobileMenu'),
    }
  },
  methods: {

  },
}
</script>

<template>
  <el-container :class="getMobileClass">
    <el-aside :width="sidebarWidth">
      <SvgIcon icon="ri-menu-fold-fill" class="floating-button" />
      <Fold v-if="!isCollapse" :class="dark ? 'sun-mode' : 'night-mode'" class="floating-button" @click="toggleSidebarWidth" />
      <Expand v-else-if="!isMobile" :class="dark ? 'sun-mode' : 'night-mode'" class="floating-left-button" @click="toggleSidebarWidth" />
      <Sidebar :show-logo="true" :collapse="true" />
    </el-aside>

    <el-container>
      <el-header v-if="!isMobile">
        <div class="flex-container">
          <div class="flex-img">
            <img src="../../../src/assets/svg/gg.png" class="img-svg" alt="公告">
          </div>
          <div class="scrolling-text-container">
            <div class="scrolling-text-wrapper">
              <div class="scrolling-text">
                {{ textContext }}
              </div>
            </div>
          </div>
        </div>
        <!-- <Navbar /> -->
      </el-header>
      <!-- <Tabs /> -->
      <el-main :class="getContainerClass">
        <router-view />
        <!-- <slot name="chatLayout" /> -->
      </el-main>
      <!-- <NModal v-model:show="needPermission" style="width: 100%; max-width: 640px" preset="card">
        <div class=" bg-white rounded dark:bg-slate-800">
          <div class="space-y-4">
            <NTabs default-value="login" size="large">
              <NTabPane name="login" tab="登录">
                <Login />
              </NTabPane>
              <NTabPane name="register" tab="注册">
                <Register />
              </NTabPane>
            </NTabs>
          </div>
        </div>

          active-text-color="#0b94ea"
      </NModal> -->
      <el-footer v-if="isMobile">
        <el-menu
          class="bottom-nav" mode="horizontal" ellipsis="false"
          background-color="#f8f8f8"
          text-color="#666"
          :default-active="activeMenu ? activeMenu : mobileMenu"
        >
          <el-menu-item index="home" @click="routerView('home')">
            <i class="el-icon-user">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM13 19H18V9.15745L12 3.7029L6 9.15745V19H11V13H13V19Z" /></svg></i>
            <span class="menu-text">主页</span>
          </el-menu-item>
          <el-menu-item index="Chat" @click="routerView('Chat')">
            <i class="el-icon-user">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19"><path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM11 10H13V12H11V10ZM7 10H9V12H7V10ZM15 10H17V12H15V10Z" fill="currentColor" /></svg></i>

            <span class="menu-text">聊天</span>
          </el-menu-item>
          <el-menu-item index="mj" @click="routerView('mj')">
            <i class="el-icon-user">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19"><path d="M15.4565 9.67503L15.3144 9.53297C14.6661 8.90796 13.8549 8.43369 12.9235 8.18412C10.0168 7.40527 7.22541 9.05273 6.43185 12.0143C6.38901 12.1742 6.36574 12.3537 6.3285 12.8051C6.17423 14.6752 5.73449 16.0697 4.5286 17.4842C6.78847 18.3727 9.46572 18.9986 11.5016 18.9986C13.9702 18.9986 16.1644 17.3394 16.8126 14.9202C17.3306 12.9869 16.7513 11.0181 15.4565 9.67503ZM13.2886 6.21301L18.2278 2.37142C18.6259 2.0618 19.1922 2.09706 19.5488 2.45367L22.543 5.44787C22.8997 5.80448 22.9349 6.37082 22.6253 6.76891L18.7847 11.7068C19.0778 12.8951 19.0836 14.1721 18.7444 15.4379C17.8463 18.7897 14.8142 20.9986 11.5016 20.9986C8 20.9986 3.5 19.4967 1 17.9967C4.97978 14.9967 4.04722 13.1865 4.5 11.4967C5.55843 7.54658 9.34224 5.23935 13.2886 6.21301ZM16.7015 8.09161C16.7673 8.15506 16.8319 8.21964 16.8952 8.28533L18.0297 9.41984L20.5046 6.23786L18.7589 4.4921L15.5769 6.96698L16.7015 8.09161Z" fill="currentColor" /></svg></i>

            <span class="menu-text">绘画</span>
          </el-menu-item>
          <el-menu-item index="swd" @click="routerView('swd')">
            <i class="el-icon-user">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15C13.6941 9 12.5831 8.16562 12.171 7.0009L11 7C9.9 7 9 7.9 9 9L9.0009 9.17102C10.1656 9.58312 11 10.6941 11 12C11 13.3059 10.1656 14.4169 9.0009 14.829L9 15C9 16.1 9.9 17 11 17L12.1707 17.0001C12.5825 15.8349 13.6937 15 15 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21H15C13.6941 21 12.5831 20.1656 12.171 19.0009L11 19C8.79 19 7 17.21 7 15H5C3.34315 15 2 13.6569 2 12C2 10.3431 3.34315 9 5 9H7C7 6.79086 8.79086 5 11 5L12.1707 5.00009C12.5825 3.83485 13.6937 3 15 3H18ZM18 17H15C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19H18C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17ZM8 11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H8C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11ZM18 5H15C14.4477 5 14 5.44772 14 6C14 6.55228 14.4477 7 15 7H18C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" /></svg></i>
            <span class="menu-text">思维图</span>
          </el-menu-item>
          <el-menu-item index="person" @click="routerView('person')">
            <i class="el-icon-user">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" /></svg></i>
            <span class="menu-text">我的</span>
          </el-menu-item>
        </el-menu>
      </el-footer>
    </el-container>
  </el-container>
</template>

<style>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.el-menu--horizontal {
  justify-content: space-around;
}

.el-menu-item {
display: flex !important;
align-items: center !important;
justify-content: center !important;
  flex-direction: column !important;
  margin-top:13px !important;
}
.menu-text{
  margin-top:-16px;
  margin-left: -8px;
}
.el-icon-house,
.el-icon-menu,
.el-icon-message,
.el-icon-user {
font-size: 20px; /* adjust icon size as needed */
}

/* Override Element UI styles if needed */
.el-menu-item:hover {
background-color: inherit !important;
}

 /* 一级菜单选中的样式 */
.el-menu-item.is-active{
    color: #fefeff !important;
    border-bottom-color: transparent !important;
}
.el-menu .el-menu-item.is-active {
    color: #ffffff;
    background-color: transparent !important;
}
.el-menu {
  background-color: none !important;
}
.el-menu-item a:hover {
  background: none;
}
.el-menu--horizontal .el-menu {
  background: none;
}
.el-menu .el-menu-item {
    color: #494949 !important;
  background-color: none !important;
}

.floating-button {
  position: absolute;
  bottom: 43%;
  width: 24px; /* Adjust the width to control the size of the Sunny icon */
  left: 45px; /* Adjust the height to control the size of the Sunny icon */
  cursor: pointer;
  z-index: 1;
  color: rgb(247, 132, 50);
}
.floating-left-button {
  position: absolute;
  bottom: 43%;
  width: 24px; /* Adjust the width to control the size of the Sunny icon */
  left: 0; /* Adjust the height to control the size of the Sunny icon */
  cursor: pointer;
  color: rgb(247, 132, 50);
  z-index: 2;
}
.el-main{
  padding:0% !important
}
.scrolling-text-container {
  overflow: hidden;
  position: absolute;
  height: 100%;
  right: 10%;
  left:15%;
  flex: 1;
}

.scrolling-text-wrapper {
  animation: scroll-left 25s linear infinite;
  white-space: nowrap;
  position: absolute;
  top: 22%;
}

.scrolling-text {
  display: inline-block;
  font-size: 13px;
  color: rgb(255, 90, 1);
}

@keyframes scroll-left {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.flex-img{
  position: absolute;
  left:13%;
}
.img-svg{

  float: left;
  width: 10%;
}
.flex-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;
}
.flex-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
