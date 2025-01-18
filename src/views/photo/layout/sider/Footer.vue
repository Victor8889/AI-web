<!--
 * @Author: lk
 * @LastEditTime: 2023-04-09 11:37:20
 * @FilePath: \wm-ai\src\views\chat\layout\sider\Footer.vue
 * @Description: 侧边栏底部内容
-->
<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'

// 设置点击打开对应窗口
const Setting = defineAsyncComponent(() => import('@/components/Setting/index.vue'))

const show = ref(false)
</script>

<template />
