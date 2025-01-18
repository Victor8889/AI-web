<!--
 * @Author: lk
 * @LastEditTime: 2023-04-15 22:10:36
 * @FilePath: \wm-ai\src\views\chat\layout\Layout.vue
 * @Description: 页面布局文件
-->
<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import DalleIndex from '../indexDall.vue'
import MjIndex from '../indexMj.vue'
import Sider from './sider/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import { userParStore } from '@/store/modules/chat/index'

const parStore = userParStore()
const appStore = useAppStore()
const authStore = useAuthStore()
const userStore = useUserStore()

// router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)
const isMj = computed(() => parStore.isMj)
const needPermission = computed(() => !authStore.token)

// 获取屏幕尺寸适配移动端
const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { 'pl-[260px]': !isMobile.value && !collapsed.value },
  ]
})

// 页面加载请求用户信息
if (!needPermission.value)
  userStore.getUserData()
</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all" :class="[isMobile ? 'p-0' : 'p-4 image-wrapper']">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
        <Sider />
        <NLayoutContent class="h-full">
          <MjIndex v-if="isMj" />
          <DalleIndex v-else />
        </NLayoutContent>
      </NLayout>
    </div>
  </div>
</template>

<style lang="css">
.image-wrapper {
  padding: 0 !important; /* 设置内边距为 0 */
  margin: 0 !important; /* 设置外边距为 0 */
}
</style>
