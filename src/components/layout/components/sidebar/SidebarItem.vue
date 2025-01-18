<script>
import { getTabs, setTabs } from '../../../../utils/storages'
import { vuexStore } from '@/store'
export default {
  props: {
    item: Object,
    collapse: Boolean,
  },
  setup() {
    const store = vuexStore
    // 点击菜单回调
    const handleMenu = (obj) => {
      const { menuId, menuName } = obj
      const tabs = getTabs()
      let flag = true
      tabs.forEach((item) => {
        if (item.id === menuId)
          flag = false
      })
      if (flag) {
        tabs.push({
          id: menuId,
          name: menuName,
          active: true,
        })
      }
      store.commit('getActiveMenu', menuId)
      setTabs(tabs, menuId)
    }

    // 根据菜单ID获取自定义图标路径
    const getIconPath = (menuId) => {
      // 返回自定义图标路径
      if (menuId === 'pic')
        return '自定义图标路径'

      // 其他菜单的自定义图标路径
      // ...
    }

    // 根据菜单ID获取提示内容
    const getTooltip = (menuName) => {
      // 返回提示内容
    }

    return {
      handleMenu,
      getIconPath,
      getTooltip,
    }
  },
}
</script>

<template>
  <el-sub-menu v-if="item.children.length > 0" :index="item.menuId">
    <template #title>
      <i class="el-icon-location" />
      <span>{{ item.menuName }}</span>
    </template>
    <sidebar-item v-for="inner in item.children" :key="inner.menuId" :item="inner" />
  </el-sub-menu>
  <el-menu-item v-else :index="item.menuId" :class="{ active: item.menuId === 'gpt' }" @click="handleMenu(item)">
    <i v-if="item.menuId === 'Chat'">
      <img src="/img/duihua.png" alt="gpt-icon">
      <!-- <img src="../../../../assets/svg/chatgpt.svg" alt="gpt-icon"> -->
      <!-- <img class="icon-image" :src="nightMode ? chatgptDayIcon : chatgptNightIcon" alt="gpt-icon"> -->
      <!-- <span v-if="collapse">{{ item.menuName }}</span> -->
    </i>
    <i v-if="item.menuId === 'pic'">
      <img src="../../../../assets/svg/photo.svg" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'mj'">
      <img src="/img/huihua.png" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'pho'">
      <img src="../../../../assets/svg/photo-ps.svg" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'swd'">
      <img src="../../../../assets/svg/siwei.png" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'qr'">
      <img src="../../../../assets/svg/erweima.svg" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'home'">
      <img src="/img/home2.png" alt="gpt-icon">
    </i>
    <i v-if="item.menuId === 'video'">
      <img src="/img/shipin.png" alt="gpt-icon">
    </i>
    <template #title>
      {{ item.menuName }}
      <span class="icon-tooltip">{{ getTooltip(item.menuName) }}</span>
    </template>
  </el-menu-item>
</template>

<style>
.icon-tooltip {
  font-size: 12px;
  margin-left: 5px;
}

.sidebar-item i {
  display: inline-block;
  width: 20px !important;
  height: 20px !important;
}

.sidebar-item img {
  max-width:fit-content !important;
  width: 2px !important;
  height: 2px !important;
}
</style>
