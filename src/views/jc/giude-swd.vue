<script lang="ts" setup>
import 'element-plus/theme-chalk/index.css'
import { useBasicLayout } from '@/hooks/useBasicLayout'

// 移动端自适应相关
const { isMobile } = useBasicLayout()
</script>

<template>
  <div>
    <div style="display: flex; justify-content: center; align-items: center;margin-bottom: 3%;">
      <span />
      <span style="font-size: 25px;">AI思维导图</span>
    </div>
    <div v-if="!isMobile">
      <img src="/jc/swd.jpg" alt="">
    </div>
    <div v-else>
      <img src="/jc/swd12.jpg" alt="">
      <img src="/jc/swd1.jpg" alt="" style="margin-top: 3%;">
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
