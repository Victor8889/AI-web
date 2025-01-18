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
      <span style="font-size: 25px;">聪明的你，欢迎使用WM-AI</span><br>
      <span />
    </div>
    <div>
      <span style="color:blue;">注册即赠送免费积分。</span>
    </div>
    <div v-if="!isMobile" style="margin-top: 20px;">
      <div>
        <img src="/jc/home.jpg" alt="">
      </div>
      <div style="margin-top: 10px;">
        <img src="/jc/swdt.jpg" alt="">
      </div>
    </div>
    <div v-else>
      <div>
        <img src="/jc/home1.jpg">
      </div>
      <div style="margin-top: 3px;">
        <img src="/jc/home2.jpg">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
