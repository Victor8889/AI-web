<!--
 * @Description: 侧边栏主体布局
-->
<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NLayoutSider } from 'naive-ui'
import List from './List.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { PromptStore } from '@/components/index'

const appStore = useAppStore()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()
const show = ref(false)

const collapsed = computed(() => appStore.siderCollapsed)

const selectedOption = ref<number | null>(null)

/**
 * @description: 根据pinia中的数据更新侧边栏
 * @return {*}
 */
function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

/**
 * @description: 移动端代码样式
 * @param {*} computed
 * @return {*}
 */
const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

/**
 * @description: 移动端代码样式
 * @param {*} computed
 * @return {*}
 */
const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

/**
 * @description: 监听移动端和pc端尺寸变化
 * @return {*}
 */
watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
  // {{ $t('common.noData') }}
)
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-3 ">
          <div class="flex-1 min-h-0 pb-4 overflow-hidden">
            <List />
          </div>
        </div>
      </main>
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
</template>

<style>
.option {
  display: inline-block;
  margin: 10px;
  cursor: pointer;
}

.option-image {
  width: 32px;
  height: 50px;
  border: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.option.selected .option-image {
  border-color: blue;
}
/* 设置日间模式下的边距和背景颜色 */
:root {
  --day-background-color: #currentColor;
}

/* 设置夜间模式下的边距和背景颜色 */
.dark {
  --night-background-color: #101010;
}

/* 应用日间或夜间模式下的样式 */
.p-3 {
  /* 使用 CSS 变量设置边距和背景颜色 */
  margin: var(--day-margin);
  background-color: var(--day-background-color);
}

/* 在夜间模式下应用夜间样式 */
.dark .p-3 {
  margin: var(--night-margin);
  background-color: var(--night-background-color);
}
</style>
