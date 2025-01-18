<!--
  * @Description: qr展示.vue
 -->
<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, ref, toRaw } from 'vue'
import { NButton, NDivider, NImage, NSpace, useMessage } from 'naive-ui'
import HeaderComponent from './components/Header/index.vue'
import api from './api'
import { useQrStore } from './components/apiTypes'
import type { RoomQrRequest } from './components/apiTypes'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { SvgIcon } from '@/components/index'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)
const ms = useMessage()

const { isMobile } = useBasicLayout()

const inputRef = ref<Ref | null>(null)

const qrStore = useQrStore()
const getMore = ref(false)
const showGetMoreBtn = ref(true)
// const qrList = ref <RoomQrVO[]>(qrStore.qrListData)
const qrList = computed(() => qrStore.qrListData)
const firstGetListType = ref(qrStore.qrListData.length === 0)
const paramsData = ref<RoomQrRequest>({
  cursor: '',
  isUseCursor: false,
  size: 16,
  isAsc: false,
})
const more = ref(false)
function loadingMore() {
  if (!firstGetListType.value) {
    more.value = true
    getRoomQrList(toRaw(paramsData.value))
  }
}

// 第一次从数据库获取数据
async function getRoomQrList(params: RoomQrRequest) {
  const { data } = await api.getRoomQrList(params)

  if (data.length > 0) {
    // const oldList = toRaw(qrList.value)

    qrStore.addlocaQrList(data, more.value)
    // qrList.value.push(...data.reverse(), ...oldList)
    paramsData.value.isUseCursor = true
    paramsData.value.cursor = data[data.length - 1].id
  }
  if (data.length === 16)
    getMore.value = true

  if (data.length < 16 && getMore.value) {
    ms.warning('没有更多数据了')
    getMore.value = false
  }

  // 以id为标识符,存到对应的浏览器缓存中
}
const selectedYangshi = ref(null)

function handleClick(id) {
  selectedYangshi.value = id
}

function handleOutsideClick(event) {
  if (!event.target.closest('button'))
    selectedYangshi.value = null
}

onMounted(() => {
  if (!needPermission.value)
    getRoomQrList(toRaw(paramsData.value))
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
  window.onload = function () {
    document.body.style.backgroundImage = 'none'
  }
})
// 获取滚动到顶部部的事件
function getScrollData(e: any) {
  if (showGetMoreBtn.value)
    showGetMoreBtn.value = false

  // 滚动到顶部
  if (e.srcElement.scrollTop === 0 && getMore.value)
    loadingMore()
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      @scroll="getScrollData"
    />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <!-- 消息列表 -->
          <div class="mb-4">
            <span style="display: block; margin: 5px 0; font-size: 13px;font-size: 13px;">
              AI艺术二维码具有随机性，手机扫码的场景基本都可以，追求本机按住识别可以多尝试几次，有惊喜哦~<br>
              所有二维码都是AI生成，请耐心等待
            </span>
            <div />
            <NDivider title-placement="left">
              <span style="font-size: 13px;">以下是您的作品</span>
            </NDivider>

            <div v-if="qrList.length === 0" style="font-size:13px" class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="mdi:human-hello-variant" class="mr-2 text-3xl" />
              <span style="font-size: 13px;">
                您还没有制作作品<br>尝试制作一个自己的专属二维码吧
              </span>
            </div>

            <div v-else class="button-wrapper">
              <div v-for="item in qrList" :key="item.id" class="button-item" @click="handleOutsideClick">
                <NSpace vertical>
                  <NButton
                    :style="{
                      border: selectedYangshi === item.id ? '2px solid green' : 'none',
                      width: '276px',
                      height: '350px',
                      margin: '5px',
                      borderRadius: '5px',
                      padding: 0,
                      overflow: 'hidden',
                    }"
                    :show-icon="false"
                    @click="handleClick(item.id)"
                  >
                    <div style="max-height: 345px;margin: 0 auto;text-align: left; ">
                      <NSpace vertical>
                        <NImage
                          :src="item.imageUrl || 'img/jz.gif'"
                          style="margin: 1px; width: 100%; height: auto;
                           object-fit: contain;border-radius: 3px"
                        />
                        <div style="margin-top: 4px;padding-bottom: 10px;" class="flex flex-col mt-4">
                          <div class="mb-1">
                            <span style="font-size: 12px; text-align: left;">创建时间：{{ item.createTime }}</span>
                          </div>
                          <div class="mb-1">
                            <span style="font-size: 12px; text-align: left;">状态：{{ item.isCompleted }}</span>
                          </div>
                          <div class="mb-1">
                            <span style="font-size: 12px; text-align: left;">内容：{{ item.description }}</span>
                          </div>
                        </div>
                      </NSpace>
                    </div>
                  </NButton>
                </NSpace>
              </div>
            </div>
            <div v-if="getMore && showGetMoreBtn" absolute top-10 class="custom-get-more">
              <NButton class="custom-button" tertiary round size="small" @click="loadingMore">
                点击加载更多...
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

 <style>
 body {
   background-image: none !important;
 }

 .button-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.button-item {
  margin: 1px;
  justify-content: left;
}
.custom-get-more {
  display: flex;
  justify-content: center;
}
 </style>
