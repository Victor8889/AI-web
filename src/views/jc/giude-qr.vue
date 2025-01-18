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
      <span style="font-size: 25px;">AI艺术二维码</span>
    </div>
    <div v-if="!isMobile">
      <img src="/jc/qr.jpg" alt="">
    </div>
    <div v-else>
      <img src="/jc/qr1.jpg" alt="">
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
