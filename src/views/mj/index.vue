<!--
  * @Description: qr展示界面.vue
 -->
<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { NAutoComplete, NAvatar, NButton, NEllipsis, NIcon, NImage, NInput, NModal, NP, NText, NUpload, NUploadDragger, useMessage } from 'naive-ui'
import MdEditor from 'md-editor-v3'
import type { UploadFileInfo } from 'naive-ui'
import { useScroll } from './hooks/useScroll'
import HeaderComponent from './components/Header/index.vue'
import api from './api'
import type { ImagineRequest, RoomMidjourneyMsgVO, RoomMidjourneyRequest, UpscaleRequest, VariationRequest, sendRequest } from './types/apiTypes'
import { useMjStore } from './types/apiTypes'
import { HoverButton, SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'

// const dialog = useDialog()
const ms = useMessage()

const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom } = useScroll()
// const { usingContext, toggleUsingContext } = useUsingContext()

// const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
// const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
// 翻译
const oldSendMessage = ref('')
const buttonItem = ref('翻译')
const isTranslate = ref(false)

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})
const aiImgUrl = ref('img/bot1.png')

const baseURL = import.meta.env.VITE_RESOURCE_BASE_URL

const mjStore = useMjStore()

const paramsData = ref<RoomMidjourneyRequest>({
  cursor: '',
  isUseCursor: false,
  roomId: 123,
  size: 10,
  isAsc: false,
})
const getMore = ref(false)
const showGetMoreBtn = ref(true)
const messageList = computed<RoomMidjourneyMsgVO[]>(() => mjStore.mjListData)

// ref <RoomMidjourneyMsgVO[]>(mjStore.mjListData)

onMounted(() => {
  getRoomMessageList(toRaw(paramsData.value))
  // loadingMore()
  // getmsgNewData()
  // scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
  window.onload = function () {
    document.body.style.backgroundImage = 'none'
  }
})
onUnmounted(() => {
  // 取消所有定时器
  clearAllInterval()
})
const firstGetListType = ref(mjStore.mjListData?.length === 0)
const more = ref(false)
function loadingMore() {
  if (!firstGetListType.value) {
    more.value = true
    getRoomMessageList(toRaw(paramsData.value))
  }
}
// watch(messageList, (value, oldValue) => {
//  if (value.length > 0) {
//    // messageList不为空则存入本地数据中
//    mjStore.setlocaMjList(value)
//  }
// })

async function getRoomMessageList(params: RoomMidjourneyRequest) {
  const { data } = await api.getRoomMidjourneyList(params)

  if (data.length > 0) {
    const oldList = toRaw(messageList.value)
    // messageList.value = []
    // messageList.value.push(...data.reverse(), ...oldList)

    paramsData.value.isUseCursor = true
    paramsData.value.cursor = data[data.length - 1].id
  }
  mjStore.addlocalMjList(data, more.value)
  if (data.length === 10)
    getMore.value = true

  if (data.length < 10 && getMore.value) {
    ms.warning('没有更多数据了!!!')
    getMore.value = false
  }
  if (!more.value) {
    scrollToBottom()
    getmsgNewData()
  }
  // 以id为标识符,存到对应的浏览器缓存中
}

// 获取滚动到顶部部的事件
function getScrollData(e: any) {
  if (showGetMoreBtn.value)
    showGetMoreBtn.value = false

  // 滚动到顶部
  if (e.srcElement.scrollTop === 0 && getMore.value)
    loadingMore()
}

const sendData = ref('')
const isSend = ref(false)
const selectType = ref('imagine')
const showModal = ref(false)
const showModalUrl = ref('')

function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') { // && event.ctrlKey
    event.preventDefault()
    sendClick()
  }
}

// 对话点击
async function sendClick() {
  try {
    if (sendData.value) {
      oldSendMessage.value = ''
      buttonItem.value = '翻译'
      isTranslate.value = false
      // 获取缓存信息
      const cachedParamsJSON = sessionStorage.getItem('mjParams')
      const isCarry = ref(false)
      const pro = ref('')
      const isMj = ref(false)
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
          selectedTab,
        } = cachedParams
        isCarry.value = carryParam
        pro.value += ` --version ${mjModel}`
        pro.value += ` --aspect ${selectedBili}`
        isMj.value = true
        if (raw)
          pro.value += ' --style raw'
        if (repeat)
          pro.value += ' --tile'
        pro.value += ` --stylize ${styliZe}`
        pro.value += ` --chaos ${confusion}`
        pro.value += ` --quality ${picPara}`
      }

      isSend.value = true
      if (selectType.value === 'imagine') {
      // 文生图
        try {
          if (isCarry.value)
            await imagineClick(sendData.value + pro.value ?? '')
          else
            await imagineClick(sendData.value ?? '')
        }
        catch (e) {
        }
      }
      else {
        // 图生文
      }
      await getNewData()
      // isSend.value = false
      // 滚动到底部
      scrollToBottom()
    }
  }
  catch (error) {

  }
  finally {
    isSend.value = false
  }
}
// 获取新数据
async function getNewData() {
  // 循环请求到最后一个数据 同步多个房间请求时产生的数据
  while (true) {
    const oldList = toRaw(messageList.value)

    // 输出完了的回调
    const pushData = {
      cursor: oldList.length === 0 ? '' : String(oldList[oldList.length - 1].id),
      isUseCursor: oldList.length !== 0,
      roomId: 123,
      size: 2,
      isAsc: true,
    }
    const { data } = await api.getRoomMidjourneyList(pushData)

    if (data.length < 2)
      break

    // 往栈存数据
    messageList.value = []
    messageList.value.push(...oldList, ...data)
    paramsData.value.isUseCursor = true
    paramsData.value.cursor = String(messageList.value[0].id)
  }
  if (!more.value)
    scrollToBottom()
  getmsgNewData()
}

// 继续生成图片
async function variationClick(msgId: number | undefined, index: number) {
  const pushData: VariationRequest = {
    index,
    msgId: msgId ?? -1,
    roomId: 123,
  }
  const { data } = await api.getRoomMidjourneyItem(String(msgId))
  for (const index in messageList.value) {
    if (messageList.value[index].id === msgId)
      messageList.value[index] = data
  }
  mjStore.setlocaMjList(messageList.value)
  await api.RoomMidjourneyVariation(pushData)
  getNewData()
}

// 生成高质量图片
async function upscaleClick(msgId: number | undefined, index: number) {
  const pushData: UpscaleRequest = {
    index,
    msgId: msgId ?? -1,
    roomId: 123,
  }
  const { data } = await api.getRoomMidjourneyItem(String(msgId))
  for (const index in messageList.value) {
    if (messageList.value[index].id === msgId)
      messageList.value[index] = data
  }
  mjStore.setlocaMjList(messageList.value)
  await api.RoomMidjourneyUpscale(pushData)
  getNewData()
}
// 文生图
async function imagineClick(prompt: string) {
  let reset = true
  const pushData: ImagineRequest = {
    prompt,
    roomId: 123,
  }
  try {
    const data = await api.RoomMidjourneyImagine(pushData)
  }
  catch (e) {
    if (e.message.indexOf('正在处理的任务') > 0)
      reset = false
  }
  finally {
    // getNewData()

    console.log(reset)
    if (reset)
    // 重置数据
      sendData.value = null
  }
}
// 图生文
const isShowDescribeModal = ref(false)
const describeFileList = ref<UploadFileInfo[]>([])
const describeloading = ref(false)
// 限制文件类型
async function beforeUpload(data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) {
  if (data.file.file?.size && data.file.file?.size < 10 * 1024 * 1024 && (data.file.file?.type === 'image/png' || data.file.file?.type === 'image/jpeg'))
    return true
  else
    ms.error('只能上传不超过 10MB 的 png/jpeg 格式的图片文件，请重新上传')

  return false
}

async function describeClick() {
  describeloading.value = true
  try {
    if (describeFileList.value.length) {
      const pushData = new FormData()
      pushData.append('file', describeFileList.value[0].file)
      pushData.append('roomId', 123)
      await api.RoomMidjourneyDescribe(pushData)
      ms.success('图片上传成功')
      describeFileList.value = []
      getNewData()
    }
    else {
      ms.warning('请上传图片')
      return false
    }
  }
  catch (error) {
  }
  finally {
    describeloading.value = false
  }
}

function describeItemClick(id: number, str: string | undefined) {
  if (str)
    imagineClick(str.split('\n\n')[id - 1].slice(4))
}

// 定时间请求模块

// mj 更新数据
// setp1 遍历消息数组
// 进入房间的时候遍历一次加载一次状态 发送消息后遍历一次加载一次状态

// 需要维护一个定时器对象数组
// 1: 属性值为 messageid, 定时器对象
// 2: 有两个方法, 开启定时器(开启时默认请求一次) 删除定时器, 传入值为messageId
// 3: 在加载对应消息的状态为上面三个加载中的状态时 定时器开启,并且根据预设值请求数据
// 4: 在手动点击刷新进度时, 需要删除旧的定时器, 然后重新开启新的定时器,并且此时将按钮置为不可点击(5s后恢复)

// setp2 根据状态 获取对应消息的最新数据

// setp3 根据 消息id 更新消息列表 并且更新本地存储(已经watch)

// 查看每个消息的状态
// 以下三个状态需要开启定时任务, 请求数据
// SYS_QUEUING 系统排队中 60s
// MJ_WAIT_RECEIVED 等待 MJ 接收消息 30s
// MJ_IN_PROGRESS MJ 执行中 10s
const mjState = [
  {
    value: false,
    text: 'MJ_FAILURE',
    label: 'MJ 加载失败',
  },
  {
    value: 10000,
    text: 'MJ_IN_PROGRESS',
    label: 'MJ 加载执行中',
  },
  {
    value: false,
    text: 'MJ_SUCCESS',
    label: 'MJ 加载成功',
  },
  {
    value: 20000,
    text: 'MJ_WAIT_RECEIVED',
    label: '等待 MJ 接受消息',
  },
  {
    value: false,
    text: 'SYS_FAILURE',
    label: '系统发送 MJ 请求失败',
  },
  {
    value: false,
    text: 'SYS_FINISH_MJ_IN_PROGRESS_FAILURE',
    label: '系统完成 MJ 执行中任务失败',
  },
  {
    value: false,
    text: 'SYS_MAX_QUEUE',
    label: '系统排队上限',
  },
  {
    value: 30000,
    text: 'SYS_QUEUING',
    label: '系统排队中',
  },
  {
    value: false,
    text: 'SYS_SEND_MJ_REQUEST_FAILURE',
    label: '系统等待 MJ 接收消息失败',
  },
  {
    value: false,
    text: 'SYS_SUCCESS',
    label: '系统成功',
  },
  {
    value: false,
    text: 'SYS_WAIT_MJ_RECEIVED_FAILURE',
    label: '系统发送 MJ 请求失败',
  },
]
interface MESSAGE_INTERVAL_TYPE {
  [key: string]: any // 字段扩展声明
}
const messageIntervalDatas = ref<MESSAGE_INTERVAL_TYPE> ({})

const messageBtnTimeOut = ref<MESSAGE_INTERVAL_TYPE> ({})

// 判断状态
function isState(state: string) {
  for (const item of mjState) {
    if (item.text === state)
      return item
  }
}

// 遍历列表 如果状态为加载中则 获取新数据
function getmsgNewData() {
  messageList.value.map(async (item) => {
    const isStateData = isState(String(item.status))
    if (isStateData && isStateData.value && item.id)
      newMessageInterval(String(item.id), Number(isStateData.value))

    return item
  })
}

// 创建定时器
async function newMessageInterval(id: string, time = 10000) {
  // step 1 如果有定时器就先销毁
  if (messageIntervalDatas.value[id])
    clearMessageInterval(id)

  // step 2 第一次进来请求一次数据
  const { data } = await api.getRoomMidjourneyItem(id)
  for (const index in messageList.value) {
    if (String(messageList.value[index].id) === id)
      messageList.value[index] = data
  }
  mjStore.setlocaMjList(messageList.value)
  // step 3 维护messageIntervalDatas.value对象
  messageIntervalDatas.value[id] = setInterval(async () => {
    const { data } = await api.getRoomMidjourneyItem(id)
    for (const index in messageList.value) {
      if (String(messageList.value[index].id) === id)
        messageList.value[index] = data
    }
    mjStore.setlocaMjList(messageList.value)
    // step 4 如果状态更新则 清除定时器
    if (!['MJ_IN_PROGRESS', 'MJ_WAIT_RECEIVED', 'SYS_QUEUING'].includes(data.status)) {
      scrollToBottom()
      clearMessageInterval(id)
      clearBtnTimeOut(id)
    }
  }, time)
}

// 清除对应id的定时器
function clearMessageInterval(id: string) {
  clearInterval(messageIntervalDatas.value[id])
  delete messageIntervalDatas.value[id]
}

function clearBtnTimeOut(id: string) {
  clearTimeout(messageIntervalDatas.value[id])
  delete messageBtnTimeOut.value[id]
}

// 清除所有定时器
function clearAllInterval() {
  for (let i = 0; i < 10000; i++) {
    clearTimeout(i)
    clearInterval(i)
  }
}
// 获取哪个按钮可以刷新
function getrsBtnType(id: string, status: string) {
  if (['MJ_IN_PROGRESS', 'MJ_WAIT_RECEIVED', 'SYS_QUEUING'].includes(status)) {
    if (messageBtnTimeOut.value[id] === undefined)
      messageBtnTimeOut.value[id] = false

    return true
  }
  return false
}

// 刷新按钮点击
async function rsBtnClick(id: string, status: string) {
  clearBtnTimeOut(id)
  messageBtnTimeOut.value[id] = true

  const isStateData = isState(String(status))
  if (isStateData && isStateData.value && id) {
    await newMessageInterval(id, Number(isStateData.value))
    ms.success('进度更新成功!!!')
  }

  setTimeout(() => {
    clearBtnTimeOut(id)
    messageBtnTimeOut.value[id] = false
  }, 5000)
}

// 获取哪个按钮被点击了 不能再次点击
function selectBit(num: number, flag: number) {
  const strFlag = (num).toString(2)
  if (strFlag.charAt(flag - 1) === '1')
    return true

  return false
}

// 计算日期时间差距
function getTimeDate(newDate: string, oldDate: string) {
  const new_date = new Date(newDate).valueOf()
  const old_date = new Date(oldDate).valueOf()
  return (new_date - old_date) / 1000
}
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
      roomId: 888,
      text: sendData.value,
    }

    oldSendMessage.value = sendData.value

    sendData.value = ''
    const data = await api.RoomOpenaiChatSend(pushData, changData)
    if (data && data.code !== 200) {
      ms.error(`请求失败!  ${data.message}`)
      // 重置数据
      isSend.value = false
    }
  }
}
// 流输入调用的函数
async function changData(talkdata: any, done = false) {
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
    }
    catch (error) {
      // json转换错误 (我只要不打印就没人知道,,,,,)
      // console.error('error', error)
    }
  }
}
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
              <span>欢迎~</span>
            </div>
          </template>
          <!-- 消息列表 -->
          <div v-for="(item, index) of messageList" v-else :key="index" class="overflow-y-auto " style="font-size: 13px;">
            <div v-if="item.type === 'answer'" class="answerChat">
              <div class="navatarPic">
                <NAvatar
                  round
                  :src="aiImgUrl"
                />
              </div>
              <div>
                <NEllipsis class="nelli">
                  {{ item.createTime }}
                </NEllipsis>
                <div class="flxstart">
                  <div style="padding: 12px; border-radius: 10px; display: inline-block; word-break: break-all;" class="bg-[#f4f6f8] dark:bg-[#1e1e20]">
                    <div style="max-width: 600px;">
                      <span style="font-weight: bold; min-width: 70px;">
                        画图描述:
                      </span>
                      {{ `/${item.action}${item.uvIndex ? `: ${item.uvIndex}` : ''} ${item.prompt ?? ''}` }}
                    </div>
                    <div style="width: 500px; display: flex; align-items: center;">
                      <span style="font-weight: bold; min-width: 70px;">
                        任务状态:
                      </span>
                      {{ `${isState(String(item.status))?.label} ${item.waitQueueLength ?? ''}` }}
                      <NButton v-if="getrsBtnType(String(item.id), String(item.status))" type="success" ml-10 text :disabled="messageBtnTimeOut[String(item.id)]" size="tiny" strong w-60 @click="rsBtnClick(String(item.id), String(item.status))">
                        <NIcon size="20">
                          <icon-material-symbols:autorenew />
                        </NIcon>
                        更新进度
                      </NButton>
                    </div>
                    <div v-if="item.discordFinishTime" w-500>
                      <span style="font-weight: bold; min-width: 70px;">
                        任务耗时:
                      </span>
                      <span style="font-weight: bold;">
                        {{ item.discordFinishTime ? ` ${getTimeDate(String(item.discordFinishTime), String(item.createTime))}秒` : '' }}
                      </span>
                      {{ item.createTime }}{{ item.discordFinishTime ? `-${item.discordFinishTime}` : '' }}
                    </div>
                    <div v-if="item.responseContent" flex>
                      <span style="font-weight: bold; min-width: 70px;">
                        响应内容：
                      </span>
                      <MdEditor v-model="item.responseContent" preview-only />
                    </div>
                    <div v-if="item.compressedImageUrl && item.originalImageUrl && !['MJ_IN_PROGRESS', 'MJ_WAIT_RECEIVED', 'SYS_QUEUING'].includes(String(item.status))" relative w-200 flex items-end>
                      <NImage
                        lazy
                        mt-10
                        b-rd-4
                        :show-toolbar="false"
                        :width="200"
                        :height="200"
                        :src="`${baseURL}${item.compressedImageUrl}`"
                        fallback-src="../src/assets/img/22.png"
                      />
                      <NButton style="position: absolute; bottom: 0; right: 0;" type="primary" size="tiny" color="#767c82" @click="showModal = true; showModalUrl = `${baseURL}${item.originalImageUrl}`">
                        查看原图
                      </NButton>
                    </div>
                    <div v-if="item.status === 'MJ_SUCCESS' && (item.action === 'IMAGINE' || item.action === 'VARIATION')" mt-10 w-500 flex>
                      <div style="width: 400px;">
                        <div style="display: flex; justify-content: space-between;">
                          <NButton style="width: 80px;" size="large" :type="selectBit(item.uuseBit ?? 0, 1) ? 'primary' : ''" :disabled="selectBit(item.uuseBit ?? 0, 1)" strong @click="upscaleClick(item.id, 1)">
                            U1
                          </NButton>
                          <NButton style="width: 80px;" size="large" :type="selectBit(item.uuseBit ?? 0, 2) ? 'primary' : ''" :disabled="selectBit(item.uuseBit ?? 0, 2)" strong @click="upscaleClick(item.id, 2)">
                            U2
                          </NButton>
                          <NButton style="width: 80px;" size="large" :type="selectBit(item.uuseBit ?? 0, 3) ? 'primary' : ''" :disabled="selectBit(item.uuseBit ?? 0, 3)" strong @click="upscaleClick(item.id, 3)">
                            U3
                          </NButton>
                          <NButton style="width: 80px;" size="large" :type="selectBit(item.uuseBit ?? 0, 4) ? 'primary' : ''" :disabled="selectBit(item.uuseBit ?? 0, 4)" strong @click="upscaleClick(item.id, 4)">
                            U4
                          </NButton>
                        </div>
                        <div style="margin-top: 5px; display: flex; justify-content: space-between;">
                          <NButton style="width: 80px;" size="large" strong @click="variationClick(item.id, 1)">
                            V1
                          </NButton>
                          <NButton style="width: 80px;" size="large" strong @click="variationClick(item.id, 2)">
                            V2
                          </NButton>
                          <NButton style="width: 80px;" size="large" strong @click="variationClick(item.id, 3)">
                            V3
                          </NButton>
                          <NButton style="width: 80px;" size="large" strong @click="variationClick(item.id, 4)">
                            V4
                          </NButton>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="item.status === 'MJ_SUCCESS' && item.action === 'DESCRIBE'" mt-10 w-400>
                      <div style="display: flex; justify-content: space-between;">
                        <NButton style="width: 80px;" size="large" @click="describeItemClick(1, item.responseContent)">
                          1
                        </NButton>
                        <NButton style="width: 80px;" size="large" @click="describeItemClick(2, item.responseContent)">
                          2
                        </NButton>
                        <NButton style="width: 80px;" size="large" @click="describeItemClick(3, item.responseContent)">
                          3
                        </NButton>
                        <NButton style="width: 80px;" size="large" @click="describeItemClick(4, item.responseContent)">
                          4
                        </NButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="questionChat">
              <div>
                <div style="width: 100%;" flex justify-end>
                  <NEllipsis style="min-width: 140px;">
                    {{ item.createTime }}
                  </NEllipsis>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                  <div style="padding: 10px; border-radius: 10px; display: inline-block; word-break: break-all;background-color: #a1dc95;  color: #3a3a3a;">
                    {{ `/${item.action}${item.uvIndex ? `: ${item.uvIndex}` : ''} ${item.prompt ?? ''}` }}
                  </div>
                </div>
              </div>
              <div style="min-width: 40px; display: flex; justify-content: flex-end;">
                <NAvatar
                  round
                  src="img/me.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton tooltip="图转文" type="primary" @click="isShowDescribeModal = true">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:image-2-line" />
            </span>
          </HoverButton>

          <NAutoComplete v-model:value="prompt" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                v-model:value="sendData"
                type="textarea"
                :disabled="isSend"
                show-count size="large"
                :maxlength="1000"
                :autosize="{ minRows: 1, maxRows: 7 }"
                placeholder="写点你想象中的图片描述..... ( Enter = 发送 ) "
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <!-- :disabled="buttonDisabled" :options="searchOptions"  -->
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
    <NModal
      v-model:show="isShowDescribeModal"
      preset="dialog"
      title="图生文"
      :style="{ width: 600 }"
      :show-icon="false"
      :loading="describeloading"
      positive-text="确认"
      negative-text="取消"
      @positive-click="describeClick"
      @negative-click="isShowDescribeModal = false, describeFileList = []"
      @mask-click="isShowDescribeModal = false, describeFileList = []"
    >
      <NUpload
        v-model:file-list="describeFileList"
        directory-dnd
        :max="1"
        @before-upload="beforeUpload"
      >
        <NUploadDragger>
          <div style="margin-bottom: 12px">
            <NIcon size="48" :depth="3">
              <SvgIcon icon="ri-upload-cloud-2-line" />
            </NIcon>
          </div>
          <NText style="font-size: 16px">
            点击或者拖动图片到该区域来上传
          </NText>
          <NP depth="3" style="margin: 8px 0 0 0">
            仅支持 PNG 和 JPEG 格式图片
          </NP>
        </NUploadDragger>
      </NUpload>
    </NModal>
  </div>
</template>

 <style>
 body {
   background-image: none !important;
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

.answerContent,
.questionContent {
  /* 使用 computed property 中的 messageStyle 变量来应用字号样式 */
  font-size: var(--messageStyle);
}
 </style>
