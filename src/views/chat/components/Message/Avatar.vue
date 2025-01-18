<!--
 * @Author: lk
 * @LastEditTime: 2023-04-09 14:22:04
 * @FilePath: \wm-ai\src\views\chat\components\Message\Avatar.vue
 * @Description: 用户头像组件
-->
<script lang="ts" setup>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'
import defaultAvatar from '@/assets/svg/me.jpg'

interface Props {
  image?: boolean
}
defineProps<Props>()

const userStore = useUserStore()

const avatar = computed(() => userStore.userInfo.avatar)
</script>

<template>
  <template v-if="image">
    <NAvatar v-if="isString(avatar) && avatar.length > 0" :src="avatar" :fallback-src="defaultAvatar" />
    <NAvatar v-else round :src="defaultAvatar" />
  </template>
  <span v-else class="text-[28px] dark:text-white">

    <img src="/22.png" alt="gpt-icon">
  </span>
</template>
