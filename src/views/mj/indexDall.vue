<!--
  * @Description: open img展示界面.vue
 -->
<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { NAutoComplete, NAvatar, NButton, NEllipsis, NImage, NInput, useMessage } from 'naive-ui'
import type { RoomOpenAiImageListRequest, sendRequest } from './openaiImg/types/apiTypes'
import { useOpenImgStore } from './openaiImg/types/apiTypes'
import { useScroll } from './hooks/useScroll'
import HeaderComponent from './components/Header/index.vue'
import api from './openaiImg/api'
import mjapi from './api'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const controller = new AbortController()

// const dialog = useDialog()
const ms = useMessage()
// 翻译
const oldSendMessage = ref('')
const buttonItem = ref('翻译')
const isTranslate = ref(false)

const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
// const { usingContext, toggleUsingContext } = useUsingContext()

// const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
// const loading = ref<boolean>(false)

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})
const baseURL = import.meta.env.VITE_RESOURCE_BASE_URL

function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') { // && event.ctrlKey
    event.preventDefault()
    sendClick()
  }
}

const imgStore = useOpenImgStore()
const aiImgUrl = ref('22.png')

const paramsData = ref<RoomOpenAiImageListRequest>({
  cursor: '',
  isUseCursor: false,
  roomId: '12', // roomData.value.roomId,
  size: 10,
  isAsc: false,
})
const getMore = ref(false)
const showGetMoreBtn = ref(true)
const messageList = computed(() => imgStore.openImgListData)
const firstGetListType = ref(imgStore.openImgListData?.length === 0)

const sendData = ref('')
const sendReturnData = ref(null)
const isSend = ref(false)
const isSend2 = ref(false)

onMounted(() => {
  //  getRoomMessageList(toRaw(paramsData.value))
  getRoomMessageList()

  // 滚动到底部
  scrollToBottom()
  scrollToBottomIfAtBottom()
})

onUnmounted(() => {
  api.handleStop()
})

const more = ref(false)
async function loadingMore() {
  if (!firstGetListType.value) {
    more.value = true
    getRoomMessageList()
  }
}
async function getRoomMessageList() {
  const { data } = await api.getRoomOpenaiImgList(paramsData.value)

  scrollToBottom()
  if (data.length > 0) {
    // const oldList = toRaw(messageList.value)
    // imgStore.addlocalOpenImgList(data, more.value)

    paramsData.value.isUseCursor = true
    paramsData.value.cursor = data[data.length - 1].id
  }
  imgStore.addlocalOpenImgList(data, more.value)
  if (data.length === 10)
    getMore.value = true

  if (data.length < 10 && getMore.value) {
    ms.warning('没有更多数据了!!')
    getMore.value = false
  }
  if (!more.value)
  // 滚动到底部
    scrollToBottom()
  scrollToBottomIfAtBottom()
}

// watch(
//   () => sessionStorage.getItem('mjParams'),
//   (newVal, oldVal) => {
//     if (newVal !== oldVal)
//       ms.info('mjParams的值已经改变！')
//   },
// )

const timerUp = ref(null)
// 创建定时器，每隔 1 秒执行一次
const startTimer = () => {
  // 检查定时器是否已存在，避免重复创建
  if (timerUp.value)
    return

  // 创建定时器，每隔 1 秒执行一次
  timerUp.value = setInterval(() => {
    // 在定时器中调用其他方法
    getRoomMessageList()
  }, 1900)
}

const model = ref('dall-e-3')
const currentTime = ref(new Date().toLocaleString())

async function sendClick() {
  if (sendData.value) {
    const pushData: sendRequest = {
      roomId: 12, // roomData.value.roomId ?? -1,
      prompt: sendData.value,
      runParams: '',
    }
    oldSendMessage.value = ''
    buttonItem.value = '翻译'
    isTranslate.value = false
    // 获取缓存信息
    const cachedParamsJSON = sessionStorage.getItem('mjParams')
    const isCarry = ref(false)
    // 解析缓存信息
    if (cachedParamsJSON) {
      const cachedParams = JSON.parse(cachedParamsJSON)
      const {
        raw,
        repeat,
        mjModel,
        dalle,
        nijiFeng,
        picPara,
        selectedBili,
        confusion,
        styliZe,
        carryParam,
        selectedTab, dalle_model, quality, dalleStyle,
      } = cachedParams
      isCarry.value = carryParam
      model.value = dalle_model
      if (isCarry.value) {
        if (dalle_model === 'dall-e-3') {
          pushData.runParams = `model:${dalle_model},size:${dalle},style:${dalleStyle},quality:`
          if (quality)
            pushData.runParams += 'hd'
        }
        else { pushData.runParams = `model:${dalle_model},size:${dalle}` }
      }
      // else { pushData.roomId = 13 }
      scrollToBottom()
      scrollToBottomIfAtBottom()
    }

    isSend2.value = true
    isSend.value = true
    try {
      const data = await api.RoomOpenaiImgSend(pushData, changData)
      // 此处的data只有错误的时候才会返回
      if (data && data.code !== 200) {
        ms.error(`请求失败!  ${data.message}`)
        // 重置数据
        sendData.value = ''
        sendReturnData.value = null
        isSend.value = false
        // 滚动到底部
        scrollToBottom()
      }

      // else { ms.error(data.message) }
    }
    catch (e) {
      isSend.value = false
      isSend2.value = false
      ms.error(data.message)
    }
    finally {
      scrollToBottom()
      scrollToBottomIfAtBottom()
    }
  }
  else { ms.warning('请先输入内容') }
}
// 流输入调用的函数
async function changData(taskData: any, done = false) {
  if (done) {
    getNewData()
    scrollToBottom()
    scrollToBottomIfAtBottom()

    // 重置数据
    sendData.value = null
    sendReturnData.value = null
    // isSend.value = false
  }
  else {
    const lastIndex = taskData.lastIndexOf('\n', taskData.length - 2)

    try {
      if (lastIndex !== -1)
        sendData.value = JSON.parse(taskData.substring(lastIndex)).data.content

      else if (taskData.indexOf('data') > 0)
        sendData.value = JSON.parse(taskData).data.content
    }
    catch (error) {
      // json转换错误 (我只要不打印就没人知道,,,,,)
      console.error('error', error)
    }
    finally {
      // 滚动到底部
      scrollToBottom()
      scrollToBottomIfAtBottom()
    }
  }
}
async function getNewData() {
  try {
  // 循环请求到最后一个数据 同步多个房间请求时产生的数据
    while (true) {
      const oldList = toRaw(messageList.value)

      // 输出完了的回调
      const pushData = {
        cursor: oldList.length === 0 ? '' : String(oldList[oldList.length - 1].id),
        isUseCursor: oldList.length !== 0,
        roomId: 12,
        size: 2,
        isAsc: true,
      }
      const { data } = await api.getRoomOpenaiImgList(pushData)

      if (data.length < 2)
        break

      isSend2.value = false
      isSend.value = false
      // 往栈存数据
      // messageList.value = []
      messageList.value.push(...oldList, ...data)
      paramsData.value.isUseCursor = true
      paramsData.value.cursor = String(messageList.value[0].id)
      // 滚动到底部
      scrollToBottom()
      scrollToBottomIfAtBottom()
    }
  }
  catch (e) {
    consloe.error(`getNewData${e}`)
  }
}

/**
   * 下面才是翻译，与上面无关
   */
async function translate() {
  if (isTranslate.value) {
    sendData.value = oldSendMessage.value
    buttonItem.value = '翻译'
    isTranslate.value = false
    return
  }
  if (sendData.value) {
    isSend.value = true
    const pushData: sendRequest = {
      roomId: 777,
      text: sendData.value,
    }

    oldSendMessage.value = sendData.value
    try {
      // sendData.value = ''
      const data = await mjapi.RoomOpenaiChatSend(pushData, changDatas)
      if (data && data.code !== 200) {
        ms.error(`请求失败!  ${data.message}`)
        // 重置数据
        sendReturnData.value = null
        isSend.value = false
      }
    }
    catch (e) {
      ms.error('翻译失败')
    }
  }
  else { ms.warning('请先输入内容!') }
}
// 流输入调用的函数
async function changDatas(talkdata: any, done = false) {
  if (done) {
    // 重置数据
    isTranslate.value = true // 变为还原
    buttonItem.value = '还原'

    isSend.value = false
  }
  else {
    const lastIndex = talkdata.lastIndexOf('\n', talkdata.length - 2)

    try {
      if (lastIndex !== -1)
        sendData.value = JSON.parse(talkdata.substring(lastIndex)).data.content

      else if (talkdata.indexOf('data') > 0)
        sendData.value = JSON.parse(talkdata).data.content
    }
    catch (error) {
      // json转换错误 (我只要不打印就没人知道,,,,,)
      // console.error('error', error)
    }
  }
}
// 停止定时器
const stopTimer = () => {
  // 检查计时器是否存在，并清除计时器
  if (timerUp.value) {
    clearInterval(timerUp.value)
    timerUp.value = null
  }
}
// 组件销毁前的清理操作
onBeforeUnmount(() => {
  stopTimer()
})
onUnmounted(() => {
  // 取消所有定时器
  stopTimer()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    <div class=" flex-1 overflow-hidden text-[#3a3a3a] dark:text-[#fff]" flex flex-col>
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div v-if="getMore && showGetMoreBtn" absolute top-10 class="custom-get-more">
          <NButton class="custom-button" tertiary round size="small" @click="loadingMore">
            点击加载更多...
          </NButton>
        </div>
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <!-- 背景提示框 -->
          <template v-if="messageList?.length === 0">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="mdi:human-hello-variant" class="mr-2 text-3xl" />
              <span>输入你想象的东西，我帮你画出来~</span>
            </div>
          </template>
          <!-- 消息列表 -->
          <div v-for="(item, index) of messageList" v-else :key="index" class="overflow-y-auto " style="font-size: 13px;">
            <div v-if="item.messageType === 'answer'" class="answerChat">
              <div class="navatarPic">
                <NAvatar
                  round
                  :src="aiImgUrl"
                />
              </div>
              <div>
                <NEllipsis class="nelli">
                  {{ item.createTime }}&nbsp;{{ item.model }}
                </NEllipsis>
                <div style="display: flex; justify-content: flex-start ">
                  <div style="padding: 10px; border-radius: 10px; display: inline-block; word-break: break-all;" class="bg-[#f4f6f8] dark:bg-[#1e1e20]">
                    <div style="margin-bottom: 5px;">
                      <span>创作内容：</span>{{ item.prompt }}
                    </div>
                    <div>
                      <NImage
                        style="margin-top: 5px; border-radius: 10px;"
                        lazy
                        :width="Number(item.size?.split('x')[0]) > 312 ? 312 : 312"
                        :src="`${baseURL}${item.imageUrl}`"
                        fallback-src="21.png"
                      />
                    </div>
                  </div>
                </div>
                <!-- :width="item.size?.split('x')[0]"
                    :height="item.size?.split('x')[1]" -->
              </div>
            </div>
            <div v-else class="questionChat">
              <div>
                <div style="width: 100%;display: flex; justify-content: flex-end;">
                  <NEllipsis style="min-width: 140px;">
                    {{ item.createTime }}
                  </NEllipsis>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                  <div style="padding: 10px; border-radius: 10px; display: inline-block; word-break: break-all;background-color: #a1dc95;  color: #3a3a3a;">
                    {{ item.prompt }}
                  </div>
                </div>
              </div>
              <div style="min-width: 50px; display: flex; justify-content: flex-end;">
                <NAvatar
                  round
                  src="img/me.jpg"
                  fallback-src="22.png"
                />
              </div>
            </div>
          </div>
          <!-- 用户的提问 -->
          <div v-if="isSend && isSend2" class="questionChat">
            <div>
              <div style="width: 100%;display: flex; justify-content: flex-end;">
                <NEllipsis style="min-width: 140px;">
                  {{ currentTime }}
                </NEllipsis>
              </div>
              <div style="display: flex; justify-content: flex-end;">
                <div style="padding: 10px; border-radius: 10px; display: inline-block; word-break: break-all;background-color: #a1dc95;  color: #3a3a3a;">
                  {{ sendData }}
                </div>
              </div>
            </div>
            <div style="min-width: 50px; display: flex; justify-content: flex-end;">
              <NAvatar
                round
                src="img/me.jpg"
                fallback-src="22.png"
              />
            </div>
          </div>
          <!--  -->
          <div v-if="isSend && isSend2" class="answerChat">
            <div class="navatarPic">
              <NAvatar
                round
                :src="aiImgUrl"
              />
            </div>
            <div>
              <NEllipsis class="nelli">
                {{ currentTime }}&nbsp;{{ model }}
              </NEllipsis>
              <div style="display: flex; justify-content: flex-start ">
                <div style="padding: 10px; border-radius: 10px; display: inline-block; word-break: break-all;" class="bg-[#f4f6f8] dark:bg-[#1e1e20]">
                  <div style="margin-bottom: 5px;">
                    <span>创作内容：</span>{{ sendData }}
                  </div>
                  <div>
                    <span class="loading-dots">创作中</span>
                  </div>
                </div>
              </div>
              <!-- :width="item.size?.split('x')[0]"
                    :height="item.size?.split('x')[1]" -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <NAutoComplete v-model:value="prompt" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                v-model:value="sendData"
                type="textarea"
                :disabled="isSend"
                show-count size="large"

                :autosize="{ minRows: 1, maxRows: 8 }"
                placeholder="说点你想象中的东西..... ( Enter = 发送 ) "
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :loading="isSend" @click="translate">
            <template #icon>
              <span class="dark:text-black" style="font-size: 13.5px;">
                {{ buttonItem }}
              </span>
            </template>
          </NButton>
          <NButton type="primary" :loading="isSend" @click="sendClick">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>

   <style>
   body {
     background-image: none !important;
   }
   .loading-dots:after {
  content: "";
  animation: loading 1s infinite;
}

@keyframes loading {
  0% { content: "."; }
  33% { content: ".."; }
  66% { content: "..."; }
  100% { content: "."; }
}
   .answerChat{
    display: flex ;
    justify-content: flex-start ;
    align-items: flex-start ;
    margin-bottom: 20px ;
   }
   .questionChat{
      display: flex ;
      justify-content: flex-end ;
      align-items: flex-start ;
      margin-bottom: 20px ;
   }

   .navatarPic{
    min-width: 40px;
   }
   .nelli{
    min-width: 140px;
    font-size: 0.80rem;
   }
   .flxstart{
    display: flex;
    justify-content: flex-start;
   }
   .answerTime,
  .questionTime {
    font-size: 0.75rem; /* 调整时间字号 */
  }

  .custom-get-more {
    display: flex;
    justify-content: center;
  }
  .answerContent,
  .questionContent {
    /* 使用 computed property 中的 messageStyle 变量来应用字号样式 */
    font-size: var(--messageStyle);
  }
   </style>
