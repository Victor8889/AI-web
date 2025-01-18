<!--
 * @Description: 聊天主界面.vue
-->
<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Delete } from '@element-plus/icons-vue'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import api from './api'
import { HoverButton, SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore, useChatStore, usePromptStore, userParStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)

let controller = new AbortController()

const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()
const paramStore = userParStore()
const gptModel = computed(() => paramStore.userParam?.chatModel)
// watch(gptModel, (newValue, oldValue) => {
//   console.log('chatModel 变化:', newValue, oldValue)
// })
const chatModelMap = new Map([
  ['gpt-3.5-turbo-1106', 'WM-AI对话3.5_TURBO_1106'],
  ['gpt-3.5-turbo-16k', 'WM-AI对话3.5_TURBO_16K'],
  ['gpt-4', 'WM-AI对话4.0'],
  ['gpt-4-32k', 'WM-AI对话4.0_32K'],
  ['gpt-4-1106-preview', 'WM-AI对话4.0_128K'],
  ['gpt-4-vision-preview', 'WM-AI对话_4.0_多模态'],
  ['gpt-4-all', 'WM-AI对话_4.0_ALL'],
  ['gemini-pro-vision', 'WM-AI对话gemini'],
  ['stable-diffusion', 'WM-AI绘画StableDiffusion'],
  ['claude-3-sonnet-20240229', 'WM-AI聊天claude-3-sonnet'],
  ['claude-3-opus-20240229', 'WM-AI聊天claude-3-opus'],
  ['gpt-4-turbo-preview', 'WM-AI聊天4.0-turbo-preview'],
])
const selectedLabel = computed(() => {
  if (gptModel.value.includes('gpt-4'))
    return gptModel.value?.replace('gpt-4', 'WM-AI聊天4.0')
  else
    return chatModelMap.get(gptModel.value) || gptModel.value
})

useCopyCode()

const chatImgUrl = ref('')
const imageUrl = ref('')

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex, updatHistorySome } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

// const { roomId } = route.params as { uuid: string }

const roomId = ref(chatStore.active).value || 0
const dataSources = computed(() => chatStore.getChatByUuid(roomId))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

/** 新版本 */
const more = ref(false)
const getMore = ref(false)
const showGetMoreBtn = ref(true)
const firstGetListType = ref(dataSources.value.length === 0)
const paramsData = ref<Chat.RoomOpenaiChatListRequest>({
  cursor: '',
  isUseCursor: false,
  roomId,
  size: 15,
  isAsc: false,
})
// loadingMore()

function loadingMore() {
  if (!firstGetListType.value) {
    more.value = true
    getRoomMessageList(toRaw(paramsData.value))
  }

  // getNewData()
}
// 获取滚动到顶部部的事件
function getScrollData(e: any) {
  if (showGetMoreBtn.value)
    showGetMoreBtn.value = false

  // 滚动到顶部
  if (e.srcElement.scrollTop === 0 && getMore.value)
    loadingMore()
}
async function getRoomMessageList(params: Chat.RoomOpenaiChatListRequest) {
  if (roomId === 0)
    return
  const res: Chat.Chat[] = await api.getRoomOpenaiChatList(params)
  // const data: Chat.RoomOpenAiChatMsgVO[] = await api.getRoomOpenaiChatList(params)

  if (res.data.length > 0) {
    chatStore.addChatListByUuid(roomId, res.data, more.value)
    paramsData.value.isUseCursor = true
    paramsData.value.cursor = dataSources?.value[0]?.id
  }

  if (res.data.length === 15)
    getMore.value = true

  if (res.data.length < 15 && getMore.value) {
    ms.warning('没有更多数据了...')
    getMore.value = false
  }
  scrollToBottom()

  scrollToBottomIfAtBottom()
  // 以id为标识符,存到对应的浏览器缓存中
}

// 监听 roomId 变化

const content = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(roomId, index, { loading: false })
})

const AddModalForm = {

  name: 'New Room',
  color: '#fead0b',
  cellConfigCode: 'gpt-3.5',
}
/**
 * @description: 提交对话框中的内容
 * @return {*}
 *这里是发送对话按钮
 */
function handleSubmit() {
  onConversation()
}
/**
 * @description: 生成这句对话
 * @return {*}
 */
async function onConversation() {
  const newRoomId = ref(roomId)
  if (roomId === 0) {
    chatStore.newHistory({ title: 'New Chat', name: 'New Chat', roomId: -999999, isEdit: false, createTime: '2023' })
    newRoomId.value = -999999
  }

  let message = content.value
  if (chatImgUrl.value !== null)
    message = `${chatImgUrl.value} ${message}`
  const lastRoomId = ref(-999999)
  if (newRoomId.value === -999999) {
    const chatModel = await paramStore.getUserParam
    AddModalForm.cellConfigCode = chatModel.chatModel
    /** 数据库创建房间 */
    // await
    const da = await api.addRoom(AddModalForm)
    lastRoomId.value = da.data.roomId

    // 修改标题
    const editModalForm: Chat.editRoomVo = {
      name: message.length > 10 ? message.substring(0, 15) : message,
      color: '#fead0b',
      roomId: lastRoomId.value,
    }
    updatHistorySome(-111, newRoomId.value, editModalForm)
  }
  else { lastRoomId.value = newRoomId.value }
  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  addChat(
    newRoomId.value,
    {
      createTime: new Date().toLocaleString(),
      content: message,
      inversion: false,
      id: -1,
      error: false,
      // modelName: selectedLabel.value,
      conversationOptions: null,
      requestOptions: { content: message, options: null },
    },
  )
  scrollToBottom()

  content.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    newRoomId.value,
    {
      createTime: new Date().toLocaleString(),
      content: '思考中...',
      loading: true,
      inversion: true,
      messageType: 'answer', // Chat.MessageType.Answer,
      error: false,
      id: -2,
      modelName: selectedLabel.value,
      conversationOptions: null,
      requestOptions: { content: message, options: { ...options } },
    },
  )
  loading.value = true
  scrollToBottom()

  try {
    const lastText = ''
    const fetchChatAPIOnce = async () => {
      controller = new AbortController()
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        text: message,
        roomId: String(lastRoomId.value),
        options,
        signal: controller.signal,
        onDownloadProgress: async ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          else
            chunk = responseText.substring(0, responseText.lastIndexOf('\n'))
          try {
            // chunk = chunk.replace('积分不足，请先充值', '积分不足，请先<a href=\'#/login\' >【充值】</a>')
            // console.log(chunk)
            // chunk = chunk.replace('积分不足', '积分不足【请充值】')
            chunk = chunk.replace(/"id":(\d+)/, '"id":"$1"')
            const data = JSON.parse(chunk)
            // console.log(data)
            updateChat(
              newRoomId.value,
              dataSources.value.length - 1,
              {
                createTime: new Date().toLocaleString(),
                content: lastText + (data?.data?.content ?? data?.data),
                inversion: true,
                messageType: 'answer', // Chat.MessageType.Answer,
                error: false,
                loading: true,
                modelName: selectedLabel.value,
                id: data.conversationId ?? data.data?.id, // data.conversationId ? data.conversationId :
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data?.data?.id },
                requestOptions: { content: message, options: { ...options } },
              },
            )

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
            // alert(`-=-=--=${error}`)
          }
          finally {
            scrollToBottom()
          }
        },
      })
      updateChatSome(newRoomId.value, dataSources.value.length - 1, { loading: false })
    }

    chatImgUrl.value = ''
    imageUrl.value = ''
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')
    ms.error(error?.message)
    if (error.message === 'canceled') {
      updateChatSome(
        newRoomId.value,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      scrollToBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(newRoomId.value, dataSources.value.length - 1)

    if (currentChat?.content && currentChat.content !== '') {
      updateChatSome(
        newRoomId.value,
        dataSources.value.length - 1,
        {
          content: `${curre - ntChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      newRoomId.value,
      dataSources.value.length - 1,
      {
        createTime: new Date().toLocaleString(),
        content: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        id: -1,
        // modelName: selectedLabel.value,
        conversationOptions: null,
        requestOptions: { content: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    if (newRoomId.value === -999999) {
      const editModalForm: Chat.editRoomVo = {
        name: message.length > 10 ? message.substring(0, 15) : message,
        color: '#fead0b',
        roomId: lastRoomId.value,
      }
      updatHistorySome(lastRoomId.value, newRoomId.value, editModalForm)
      await api.updateRoom(editModalForm)
    }
    scrollToBottom()
    loading.value = false
  }
}
/**
 * @description: 再次生成这句对话 刷新按钮
 * @param {*} index
 * @return {*}
 */
async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  // const { requestOptions } = dataSources.value[index]

  const message = dataSources.value[index - 1].content// requestOptions?.content ?? ''

  const options: Chat.ConversationRequest = {}

  // if (requestOptions.options)
  // options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    roomId,
    index,
    {
      createTime: new Date().toLocaleString(),
      content: '重新思考中...',
      inversion: true,
      messageType: 'answer',
      error: false,
      modelName: selectedLabel.value,
      loading: true,
      conversationOptions: null,
      //    requestOptions: { content: message, options: { ...options } },
    },
  )

  try {
    const lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        text: message,
        roomId: String(roomId),
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            chunk = chunk.replace(/"id":(\d+)/, '"id":"$1"')
            const data = JSON.parse(chunk)
            updateChat(
              roomId,
              index,
              {
                createTime: new Date().toLocaleString(),
                content: lastText + (data?.data?.content ?? data?.data),
                inversion: true,
                messageType: 'answer', // Chat.MessageType.Answer,
                error: false,
                loading: true,
                modelName: selectedLabel.value,
                id: data.conversationId ?? data.data?.id,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data?.data?.id },
                requestOptions: { content: message, options: { ...options } },
              },
            )
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(roomId, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        roomId,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      roomId,
      index,
      {
        createTime: new Date().toLocaleString(),
        content: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        // modelName: selectedLabel.value,
        conversationOptions: null,
        requestOptions: { content: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

/**
 * @description: 保存会话到图片
 * @return {*}
 */
function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

/**
 * @description: 删除当前消息
 * @param {*} index
 * @return {*}
 */
async function handleDelete(index: number, id: number | string) {
  if (loading.value)
    return
  if (!id) {
    ms.error('删除失败，请刷新后重试')
    return
  }

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    async onPositiveClick() {
      await deleteMessage(index, id)
    },
  })
}
async function deleteMessage(index: number, id: number) {
  try {
    const res = await api.deleteChat(id)
    if (!res.data) {
      ms.error('删除失败，请刷新后重试')
      return
    }
    chatStore.deleteChatByUuid(roomId, index)

    ms.info('删除成功')
  }
  catch (error) {
    // 处理错误
  }
}
/**
 * @description: 清除聊天记录
 * @return {*}
 */
function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(roomId)
    },
  })
}
/**
 * @description: 提交对话框中的内容
 * 这里是提交对话内容的
 * @return {*}
 */
function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}
/**
 * @description: 停止生成回答
 * @return {*}
 */
function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
/**
 * @description: TODO 提示词?
 * @param {*} computed
 * @return {*}
 */
const searchOptions = computed(() => {
  if (content.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(content.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !content.value || content.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

onMounted(() => {
  if (!needPermission.value)
    getRoomMessageList(toRaw(paramsData.value))
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
  window.onload = function () {
    document.body.style.backgroundImage = 'none'
  }
})

function insertText(text) {
  content.value = text
}
onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
// :inversion="item.inversion"
//                :error="item.error"
//               :loading="item.loading"

/** 上传 */

const curPercentage = ref(0)
const isShowJinDuTiao = ref(false)
const timerUp = ref(null)
// 创建定时器，每隔 1 秒执行一次
const startTimer = () => {
  // 检查定时器是否已存在，避免重复创建
  if (timerUp.value)
    return

  // 创建定时器，每隔 1 秒执行一次
  timerUp.value = setInterval(() => {
    // 在定时器中调用其他方法
    curPercentage.value++
  }, 500)
}
// 停止定时器
const stopTimer = () => {
  // 检查计时器是否存在，并清除计时器
  if (timerUp.value) {
    clearInterval(timerUp.value)
    timerUp.value = null
    curPercentage.value = 0
  }
}

// 组件销毁前的清理操作
onBeforeUnmount(() => {
  stopTimer()
})
// 上传图片
const isDisabled = ref(false)
const showButtons = ref(false)
const imgBaseUrl = `${import.meta.env.VITE_RESOURCE_BASE_URL}`
async function uploadImg(item) {
  try {
    if (gptModel.value === 'gemini-pro-vision') {
      ms.error('该模型暂不可上传文件，请等待更新')
      return
    }

    curPercentage.value = 0
    isShowJinDuTiao.value = true
    startTimer()
    if (gptModel.value === 'gpt-4-vision-preview' || gptModel.value === 'gpt-4-turbo-2024-04-09') {
      // 验证图片格式大小信息
      const isJPG = item.file.type === 'image/jpeg' || item.file.type === 'image/png'
      const isLt2M = item.file.size / 1024 / 1024 < 10
      if (!isJPG)
        ms.error('上传图片只能是 JPG 或 PNG 格式!')

      if (!isLt2M)
        ms.warning('文件有点大哦')

      // 图片格式大小信息没问题 执行上传图片的方法
      if (isJPG && isLt2M === true) {
        const formData = new FormData()
        formData.append('file', item.file)
        const result = await api.uploadImg(formData, 'img')

        if (result.code === 200) {
          const files = result.data.split(',')
          imageUrl.value = imgBaseUrl + files[0] // 缩略图
          chatImgUrl.value = imgBaseUrl + files[1] // 原图路径
          ms.success('上传成功')
        }
        else { ms.error('上传失败，请稍后重试') }
      }
    }
    else { // 文件上传
      const isLt2M = item.file.size / 1024 / 1024 < 10

      if (!isLt2M)
        ms.warning('文件有点大哦')
      const type = ref('file')
      const isJPG = item.file.type === 'image/jpeg' || item.file.type === 'image/png' || item.file.type === 'gif'
      if (isJPG)
        type.value = 'imgs'// 含gif
      // 图片格式大小信息没问题 执行上传图片的方法
      if (true) { // isLt2M ===
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('type', type.value)
        const result = await api.uploadImg(formData, '')

        if (result.code === 200) {
          if (isJPG) {
            const files = result.data.split(',')
            imageUrl.value = imgBaseUrl + files[0] // 缩略图
            chatImgUrl.value = imgBaseUrl + files[1] // 原图路径
          }
          else {
            // imageUrl.value = imgBaseUrl + result.data // 缩略图
            chatImgUrl.value = imgBaseUrl + result.data // 原图路径
            imageUrl.value = '/img/wpp1.png'
          }
          ms.success('上传成功')
        }
        else { ms.error('上传失败，请稍后重试') }
      }
    }
  }
  catch (e) {

  }
  finally {
    isShowJinDuTiao.value = false
    stopTimer()
  }
}
function handleRemove() {
  imageUrl.value = '' // 缩略图
  chatImgUrl.value = ''
  isDisabled.value = true
  showButtons.value = false
}
function showButton() {
  showButtons.value = true
  isDisabled.value = true
}
function hideButtons() {
  showButtons.value = false
  isDisabled.value = false
}
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @clear="handleClear"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
      @scroll="getScrollData"
    />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <div v-if="getMore && showGetMoreBtn" absolute top-10 class="custom-get-more">
            <NButton class="custom-button" tertiary round size="small" @click="loadingMore">
              点击加载更多...
            </NButton>
          </div>
          <!-- 背景提示框 -->
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <div class="text-gray-800 md:max-w-2xl lg:max-w-3xl md:h-full md:flex md:flex-col dark:text-gray-100">
                <h1 class="text-4xl font-semibold text-center mt-6 sm:mt-[10vh] ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center">
                  WM-AI 人工智能
                </h1>
                <div class="md:flex items-start text-center gap-5">
                  <div class="flex flex-col mb-8 md:mb-auto gap-5 flex-1">
                    <h2 class="flex gap-4 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
                      <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg> 示例
                    </h2>
                    <ul class="flex flex-col gap-5 w-full sm:max-w-md m-auto">
                      <button class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900" @click="insertText('帮我制定一个北京3日游计划。')">
                        帮我制定一个北京3日游计划。
                      </button>
                      <button class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900" @click="insertText('写一份软件工程师简历模板')">
                        写一份软件工程师简历模板
                      </button>
                      <button class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900" @click="insertText('写一份软件开发工程师的周报')">
                        写一份软件开发工程师的周报
                      </button>
                    </ul>
                  </div>
                  <div class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                    <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg> 能力
                    </h2>
                    <ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        具备记忆功能，能够持续对话
                      </li>
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        允许用户提供后续更正
                      </li>
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        训练有素，拒绝不当请求
                      </li>
                    </ul>
                  </div>
                  <div v-if="!isMobile" class="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1">
                    <h2 class="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
                      <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg> 限制
                    </h2>
                    <ul class="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        偶尔可能产生错误的信息
                      </li>
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        偶尔可能产生错误的指令
                      </li>
                      <li class="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
                        AI生成的内容需自己判，AI只是一个程序缺乏真正的智能和意识
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 消息列表 -->
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :id="item.id"
                :key="index"
                :date-time="item.createTime"
                :text="item.content"
                :model-name="item.modelName"
                :inversion="!item.inversion"
                :error="item.error"
                :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index, item.id)"
              >
                <!-- 打印 item.content -->
              </Message>
              <!-- 停止生成 -->
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  停止生成
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton v-if="!isMobile" tooltip="删除记录" @click="handleClear">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:delete-bin-line" />
            </span>
          </HoverButton>
          <HoverButton v-if="!isMobile" tooltip="保存会话到图片" @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>
          <!-- <NUpload
            action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f"
            :headers="{
              'naive-info': 'hello!',
            }"
            :show-file-list="false"
          >
            <HoverButton v-if=" gptModel === 'gpt-4-vision-preview'" tooltip="上传图片">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="ri:upload-2-line" />
              </span>
            </HoverButton>
          </NUpload> -->
          <el-upload
            v-if=" gptModel === 'gpt-4-vision-preview' || gptModel === 'gpt-4-all' || gptModel === 'gemini-pro-vision'
              || gptModel === 'claude-3-opus-20240229' || gptModel === 'claude-3-sonnet-20240229'
              || gptModel === 'gpt-4-turbo-2024-04-09'"
            :ref="imageUrl"

            action=""
            :model="imageUrl"
            class="avatar-uploader"
            :show-file-list="false"
            :http-request="uploadImg"
            :max="1"
            :disabled="isDisabled"
          >
            <div class="file-item">
              <img v-if="imageUrl" w-full :src="imageUrl" class="avatarImg" alt="" @mouseover="showButton()" @mouseleave="hideButtons()">
              <!-- <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon> -->
              <HoverButton v-else tooltip="上传图片，不要上传重要文件">
                <span class="text-xl text-[#4f555e] dark:text-white">
                  <SvgIcon icon="ri:upload-2-line" />
                </span>
              </HoverButton>

              <div v-show="showButtons" class="buttons" @mouseover="showButton()" @mouseleave="hideButtons()">
                <el-icon class="delete-button avatar-delete-icon" @click="handleRemove()">
                  <Delete />
                </el-icon>
              </div>

              <div v-if="isShowJinDuTiao" class="jindu">
                <el-progress
                  type="circle" :percentage="curPercentage" :width="36"
                  class="avatarImg" color="#5cb87a"
                />
              </div>
            </div>
          </el-upload>
          <HoverButton v-if="!isMobile && gptModel !== 'stable-diffusion'" tooltip="切换是否联系上下文" @click="toggleUsingContext">
            <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>
          <NAutoComplete v-model:value="content" :options="searchOptions" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="content"
                :clearable="true"
                overflow-y="scroll"
                type="textarea"
                show-count
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
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
/* 去掉按钮边框样式 */
.custom-get-more .n-base-button {
  border: none;
}

/* 设置按钮文字大小 */
.custom-get-more .n-base-button {
  font-size: 8px !important;
}

/* 使用 Flex 布局使按钮水平居中 */
.custom-get-more {
  display: flex;
  justify-content: center;
}
/**上传图片 */
.avatar-uploader .avatarImg {
  width: 42px;
  height: 34px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 0.1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #6a7079;
  width: 88px;
  height: 88px;
  text-align: center;
}
.el-icon.avatar-delete-icon {
  font-size: 18px;
  color: #ffffff;
  width: 18px;
  height: 18px;
  text-align: center;
}
.el-icon {
    right: 0px;
}
.buttons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(147, 145, 145, 0.738); /* 设置遮罩层的颜色和透明度 */
  padding: 2px;
  transition: opacity 0.3s;
}
.jindu{
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(147, 145, 145, 0.738); /* 设置遮罩层的颜色和透明度 */
}

.file-item {
  position: relative;
  display: inline-block;
}

.delete-button {
  position: absolute;
  top: 50%;
  left: 50%;
  size:13px;
  color:aliceblue;
  transform: translate(-50%, -50%);
}
</style>
