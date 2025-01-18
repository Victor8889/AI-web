<!--
 * @Description: 聊天室加载,包含编辑聊天室名称功能
-->
<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput, NPopconfirm, NScrollbar, useMessage } from 'naive-ui'
import api from './api'
import { SvgIcon } from '@/components/index'
import { useAppStore, useAuthStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { debounce } from '@/utils/functions/debounce'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)

const ms = useMessage()

const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()

/** 重写聊天室加载、编辑、删除等 */
// 开启加载状态
// loading.value = true
// 发起请求
// 获取房间列表
// 函数1 获取列表数据函数
// 获取当前cell下的聊天室列表数据,然后加载
// 列表的分页数据
const pNum = ref(1)
const pSize = ref(15)
const total = ref<number>(0)

const dataSources = computed(() => chatStore.history)
const scrollContainer = ref<HTMLElement | null>(null)
async function getRoomList(name: undefined | string = undefined) {
  const pageNum: number = pNum.value
  const pageSize: number = pSize.value
  const res: Chat.RoomListResponse = await api.getRoomPage({ pageNum, pageSize, name })

  if (res.data?.total)
    total.value = res.data?.total
  if (res.data?.records?.length > 0) {
    if (pNum.value === 1)
      chatStore.addRoom(res.data.records)
    else
      chatStore.updateRoom(res.data.records)
  }
}
onMounted(() => {
  if (!needPermission.value) {
    getRoomList()
    getMoreData()
  }
})
// 获取更多数据
async function getMoreData() {
  if (pNum.value * pSize.value < total.value) {
    pNum.value++
    getRoomList()
  }
}
// 添加滚动鼠标轮加载更多的逻辑
function handleWheel(event: WheelEvent) {
  if (event.deltaY > 0 && isAtBottom())
    getMoreData()
}

function isAtBottom() {
  if (!scrollContainer.value)
    return false
  return (
    scrollContainer.value.scrollTop + scrollContainer.value.clientHeight
    >= scrollContainer.value.scrollHeight
  )
}
/**
 * @description: 选中对应的聊天室
 * @param {*} roomId
 * @return {*}
 */
async function handleSelect({ roomId }: Chat.RoomListVO) {
  if (isActive(roomId))

    return

  if (chatStore.active)
    chatStore.updateHistory(chatStore.active, { isEdit: false })
  await chatStore.setActive(roomId)

  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

const editModalForm: Chat.editRoomVo = {
  name: '',
  color: '#fead0b',
  roomId: 0,
}
/**
 * @description: 编辑聊天室名称
 * @param {*} roomId 聊天室id
 * @param {*} isEdit 是否编辑聊天室
 * @param {*} event 对应listItem的数据
 * @return {*}
 */
async function handleEdit({ roomId }: Chat.RoomListVO, name: string, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  editModalForm.name = name
  editModalForm.roomId = roomId
  const data = await api.updateRoom(editModalForm)
  if (data.code !== 200) {
    ms.error('修改失败，请重试。')
    return
  }
  chatStore.updateHistory(roomId, { isEdit })
}

/**
 * @description: 删除聊天室
 * @param {*} index
 * @param {*} event 对应listItem的数据
 * @return {*}
 */
async function handleDelete(index: number, roomId: number, event?: MouseEvent | TouchEvent) {
  if (roomId !== -999999) {
    const data = await api.deleteRoom(roomId)
    if (data.code !== 200) {
      ms.error('删除失败，请重试。')
      return
    }
  }
  event?.stopPropagation()
  chatStore.deleteHistory(index)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}
// 按钮防抖
const handleDeleteDebounce = debounce(handleDelete, 600)

/**
 * @description: 键盘Enter事件 逻辑同handleEdit
 * @param {*} roomId
 * @param {*} isEdit
 * @param {*} event
 * @return {*}
 */
async function handleEnter({ roomId }: Chat.RoomListVO, name: string, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter') {
    editModalForm.name = name
    editModalForm.roomId = roomId
    const data = await api.updateRoom(editModalForm)
    if (data.code !== 200) {
      ms.error('修改失败，请重试。')
      return
    }
    chatStore.updateHistory(roomId, { isEdit })
  }
}

/**
 * @description: 给active赋值当前选中的item的roomId
 * @param {*} roomId
 * @return {*}
 */
function isActive(roomId: number) {
  return chatStore.active === roomId
}
</script>

<template>
  <NScrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm">
      <template v-if="!dataSources?.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) of dataSources" :key="index">
          <a
            class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
            :class="isActive(item.roomId) && ['border-[#4b9e5f]', 'bg-neutral-100', 'text-[#4b9e5f]', 'dark:bg-[#24272e]', 'dark:border-[#4b9e5f]', 'pr-14']"
            @click="handleSelect(item)"
          >
            <span>
              <SvgIcon icon="ri:message-3-line" />
            </span>
            <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
              <NInput
                v-if="item.isEdit"
                v-model:value="item.name" size="tiny"
                @keypress="handleEnter(item, item.name, false, $event)"
              />
              <span v-else>{{ item.name }}</span>
            </div>
            <div v-if="isActive(item.roomId)" class="absolute z-10 flex visible right-1">
              <template v-if="item.isEdit">
                <button class="p-1" @click="handleEdit(item, item.name, false, $event)">
                  <SvgIcon icon="ri:save-line" />
                </button>
              </template>
              <template v-else>
                <button class="p-1">
                  <SvgIcon icon="ri:edit-line" @click="handleEdit(item, item.name, true, $event)" />
                </button>
                <NPopconfirm placement="bottom" @positive-click="handleDeleteDebounce(index, item.roomId, $event)">
                  <template #trigger>
                    <button class="p-1">
                      <SvgIcon icon="ri:delete-bin-line" />
                    </button>
                  </template>
                  {{ $t('chat.deleteHistoryConfirm') }}
                </NPopconfirm>
              </template>
            </div>
          </a>
        </div>
        <div ref="scrollContainer" class="scroll-container" @wheel="handleWheel">
          <NButton
            v-if="pNum * pSize < total"
            round
            type="primary"
            mt-10
            wh-full
            h-40
            class="custom-button"
            @click="getMoreData"
          >
            <SvgIcon icon="ri-more-line" size="20" />
            <div class="button-text">
              加载更多
            </div>
          </NButton>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>

.scroll-container {
  /* 添加其他样式，如之前的 .scroll-container 样式 */
  /* ... */
  /* 使用 Flex 布局使子元素水平居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}
<style>
/* 添加一个自定义类名，覆盖默认样式 */
.custom-button {
  border: none !important; /* 去掉边框 */
  background-color: transparent !important; /* 去掉背景色 */
  color: #9f9f9f !important; /* 将颜色设为灰色 */
  font-size: 10px !important; /* 设置字体大小为14px */
}

/* 去掉按钮内部的 padding 和 margin，使图标和文字紧密排列 */
.custom-button .n-base-button__content {
  padding: 0 !important;
  margin: 0 !important;
}

/* 去掉按钮激活时的阴影效果 */
.custom-button .n-base-button__ripple {
  display: none !important;
}
/* 去掉按钮边框样式 */
.custom-button {
  --n-border: none!important;
  --n-border-hover: none!important;
  --n-border-pressed: none!important;
  --n-border-focus: none!important;
  --n-border-disabled: none!important;
}
</style>
