<!--
 * @Author: mjjh
 * @LastEditTime: 2023-04-16 19:55:29
 * @FilePath: \chagpt-shuowen\src\views\chat\index.vue
 * @Description: chat页面index.vue
-->
<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, onBeforeUnmount  } from 'vue'

import { NButton, NDivider, NImage, NInput, NPagination, NProgress, NTooltip, useDialog, useMessage, useThemeVars } from 'naive-ui'

import { useCopyCode } from '../chat/hooks/useCopyCode'
import HeaderComponent from './components/Header/index.vue'
import { runMjStore } from './types/apiTypes'
import api from './api'
import type { ImagineRequest, PageMidjourneyRequest, RoomMidjourneyMsgVO,  UpscaleRequest, VariationRequest, sendRequest } from './types/apiTypes'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
import { copyText } from '@/utils/format'

const baseURL = `${import.meta.env.VITE_RESOURCE_BASE_URL}`

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)

const controller = new AbortController()
const themeVars = useThemeVars()
const page = ref({
  pageNum: 1,
  pageSize: 6,
})
const total = ref<number>(0)
const pages = ref<number>(1)
const pageSizes= [6, 12, 24]

const ms = useMessage()
// const isRefreshing = ref(false)

useCopyCode()

const { isMobile } = useBasicLayout()

const inputRef = ref<Ref | null>(null)
// 翻译
const oldSendMessage = ref('')
const oldSendMessage2 = ref('')
const buttonItem = ref('翻译')
const buttonItem2 = ref('翻译')
const isTranslate = ref(false)
const isTranslate2 = ref(false)

const footerClass = computed(() => {
  let classes = ['p-4']

  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

const runMj = runMjStore()


const compMjList = ref(<RoomMidjourneyMsgVO>[])
const runMjList = ref(<RoomMidjourneyMsgVO>[])


onMounted(()=> {
  if(!needPermission.value){
    getComMjMessageList()
    getrunMJList()
  }
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
  window.onload = function () {
    document.body.style.backgroundImage = 'none'
  }
})
onUnmounted(() => {
  // 取消所有定时器
  stopTimer();

})


const sendData = ref('')
const isSend = ref(false)
const sendData2 = ref('')
const selectType = ref('imagine')


function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') { // && event.ctrlKey
    event.preventDefault()
    sendClick()
  }
}

// 点击---开始生成
async function sendClick() {
  try {
    if (sendData.value) {
      oldSendMessage.value = ''
      oldSendMessage2.value = ''
      buttonItem.value = '翻译'
      buttonItem2.value = '翻译'
      isTranslate.value = false
      isTranslate2.value = false
      // 获取缓存信息
      const cachedParamsJSON = sessionStorage.getItem('mjParams')
      const isCarry = ref(false)
      const pro = ref('')
      const baseImg = ref('')
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
          seed,
          niji,
          nijiModel,
          iw,
          imgUrl,
        } = cachedParams
        isCarry.value = carryParam
        if(imgUrl){
          // pro.value += ' '+ imgUrl
          pro.value += ' --iw ' +iw
          baseImg.value = imgUrl
        }
        
        if(niji){
          pro.value += ` --niji ${nijiModel}`
          // pro.value += ` --version ${nijiModel}`
        }else
          pro.value += ` --version ${mjModel}`
        pro.value += ` --ar ${selectedBili}`//aspect
        isMj.value = true
        if (raw)
          pro.value += ' --style raw'
        if (repeat)
          pro.value += ' --tile'
        pro.value += ` --stylize ${styliZe}`
        pro.value += ` --chaos ${confusion}`
        pro.value += ` --q ${picPara}`//quality
        if(seed !== '0')
          pro.value += ` --seed ${seed}`
      }
      let sendPrompt = sendData.value
      if (sendData2.value)
      sendPrompt  = `${sendData.value} --no ${sendData2.value}`
      isSend.value = true
      if (selectType.value === 'imagine') {
      // 文生图
        try {
          if (isCarry.value)
            await imagineClick(sendPrompt ,baseImg.value,pro.value)
          else
            await imagineClick(sendPrompt ?? baseImg.value,'',"")
        }
        catch (e) {
        }
      }
      else {
        // 图生文
      }
      // await getNewData()
      // isSend.value = false
      // 滚动到底部
      // scrollToBottom()
    }else{
      ms.error("请先填写提示词")
    }
  }
  catch (error) {

  }
  finally {
    isSend.value = false
  }
}
// 文生图
async function imagineClick(prompt: string,baseImg: string,params: string) {
  let reset = true
  const pushData: ImagineRequest = {
    prompt,
    roomId: 123,
    baseImg,
    params,
    mjType:1,//快速
  }
  try {
    // const data = await api.RoomMidjourneyImagine(pushData)
    const mjVo = await api.AddMidjourneyImagine(pushData)
    
    if (mjVo.code == 200) {
      // 处理堆栈
      // const oldList = toRaw(runList.value)
      const mjs: RoomMidjourneyMsgVO[] = []
      mjs[0] = mjVo.data

      runMj.addMj(mjVo.data as RoomMidjourneyMsgVO)

      ms.info('任务发送成功')
      // runList.value = []
      // runList.value.push(...mjs)
    }
    else {
      ms.error(mjVo.message)
    }

    // paramsData.value.isUseCursor = true
    // paramsData.value.cursor = String(messageList.value[0].id)
  }
  catch (e) {
    if (e.message.indexOf('正在处理的任务') > 0)
    reset = false
    reset = false
  }
  finally {
    // getNewData()
    getrunMJList()
    if (reset){
    // 重置数据
      sendData.value = null
      sendData2.value = null
    }
  }
}
async function getrunMJList() {
  const { data } = await api.getRoomMidjourneyList(1)

  if (data.length > 0) {
    runMjList.value = data
    startTimer()
  }else{
    runMjList.value = []
    stopTimer();
  }
} 
function refushRunMj(){
    const iconElement = document.querySelector(".refresh-run-icon");

if (iconElement) {
  iconElement.classList.add("rotate-animation");

  // 延迟一段时间后移除类名，确保动画能够正常触发
  setTimeout(() => {
    iconElement.classList.remove("rotate-animation");
  }, 1000);
}
getrunMJList()
  }
function handleSizeChange(newSize) {
    page.value.pageSize = newSize;
    pages.value = Math.ceil(total.value / page.value.pageSize)
    getComMjMessageList();
  }
  function refushComMj(){
    const iconElement = document.querySelector(".refresh-icon");

if (iconElement) {
  iconElement.classList.add("rotate-animation");

  // 延迟一段时间后移除类名，确保动画能够正常触发
  setTimeout(() => {
    iconElement.classList.remove("rotate-animation");
  }, 1000);
}
    getComMjMessageList()
  }
async function getComMjMessageList() {
  const params:PageMidjourneyRequest={
    pageSize: page.value.pageSize,
    pageNum: page.value.pageNum,
    roomId: 123,
    mjType:1,
  }
  const { data } = await api.getRoomMidjourneyPage(params)

  if (data.total > 0) {
    compMjList.value = data.records
    page.value.pageNum = data.current
    page.value.pageSize = data.size
    total.value = data.total
    pages.value = data.pages
  }else{
    compMjList.value = []
    page.value.pageNum = 1
    page.value.pageSize = 6
    total.value = 0
    pages.value = 0
  }
  
}
/**
 * 删除
 * @param e 
 */
function deleteMj(id) {
  api.delMidjourneyItem(id)
  .then((data) => {
    console.info("data");
    ms.info("删除成功");
    getComMjMessageList();
  })  .catch((error) => {
    ms.error(error)
  });

}
function deleteRunMj(id) {
  api.delMidjourneyItem(id)
  .then((data) => {
    console.info("data");
    ms.info("删除成功");
    getrunMJList();
  })  .catch((error) => {
    ms.error(error)
  });

}
const timer = ref(null);
// 创建定时器，每隔 1 秒执行一次
const startTimer = () => {
      // 检查定时器是否已存在，避免重复创建
      if (timer.value) {
        return;
      }

      // 创建定时器，每隔 1 秒执行一次
      timer.value = setInterval(() => {
        // 在定时器中调用其他方法
        getrunMJList()
        
      }, 2500);
    };

// 停止定时器
    const stopTimer = () => {
  // 检查计时器是否存在，并清除计时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
          getComMjMessageList();
  }
};
// 组件销毁前的清理操作
onBeforeUnmount(() => {
  stopTimer();
});
const isdisabled = ref(false)
// 继续生成图片--仿制
async function variationClick(msgId: number | undefined, index: number) {
  try{
    isdisabled.value=true
    const pushData: VariationRequest = {
    index,
    msgId: msgId ?? -1,
    roomId: 123,
    mjType:1,//普通速度
  }
  // const { data } = await api.getRoomMidjourneyItem(String(msgId))
  // for (const index in messageList.value) {
  //   if (messageList.value[index].id === msgId)
  //     messageList.value[index] = data
  // }
  // mjStore.setlocaMjList(messageList.value)
  await api.RoomMidjourneyVariation(pushData).then(() =>{
    getrunMJList();
    ms.info('任务发送成功')
  })
  }catch(e){

  }finally{
    isdisabled.value=false
  }
}

// 生成高质量图片---放大
async function upscaleClick(msgId: number | undefined, index: number) {
    try{
      isdisabled.value=true
    const pushData: UpscaleRequest = {
      index,
      msgId: msgId ?? -1,
      roomId: 123,
      mjType:1,//普通速度
    }
    // const { data } = await api.getRoomMidjourneyItem(String(msgId))
    // for (const index in compMjList.value) {
    //   if (compMjList.value[index].id === msgId)
    //   compMjList.value[index] = data
    // }
    // mjStore.setlocaMjList(messageList.value)
    await api.RoomMidjourneyUpscale(pushData).then(() =>{
      getrunMJList();
    ms.info('任务发送成功')
    })
  }catch(e){

  }finally{
    isdisabled.value=false
  }
  
}

// // 图生文
// const isShowDescribeModal = ref(false)
// const describeFileList = ref<UploadFileInfo[]>([])
// const describeloading = ref(false)
// // 限制文件类型
// async function beforeUpload(data: {
//   file: UploadFileInfo
//   fileList: UploadFileInfo[]
// }) {
//   if (data.file.file?.size && data.file.file?.size < 10 * 1024 * 1024 && (data.file.file?.type === 'image/png' || data.file.file?.type === 'image/jpeg'))
//     return true
//   else
//     ms.error('只能上传不超过 10MB 的 png/jpeg 格式的图片文件，请重新上传')

//   return false
// }

// async function describeClick() {
//   describeloading.value = true
//   try {
//     if (describeFileList.value.length) {
//       const pushData = new FormData()
//       pushData.append('file', describeFileList.value[0].file)
//       pushData.append('roomId', 123)
//       await api.RoomMidjourneyDescribe(pushData)
//       ms.success('图片上传成功')
//       describeFileList.value = []
//       getNewData()
//     }
//     else {
//       ms.warning('请上传图片')
//       return false
//     }
//   }
//   catch (error) {
//   }
//   finally {
//     describeloading.value = false
//   }
// }

// function describeItemClick(id: number, str: string | undefined, baseImg: string ) {
//   if (str)
//     imagineClick(str.split('\n\n')[id - 1].slice(4),baseImg,params)
// }

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
    label: 'MJ失败',
  },
  {
    value: 10000,
    text: 'MJ_IN_PROGRESS',
    label: '执行中',
  },
  {
    value: false,
    text: 'MJ_SUCCESS',
    label: 'MJ加载成功',
  },
  {
    value: 20000,
    text: 'MJ_WAIT_RECEIVED',
    label: '等待 MJ 接受消息',
  },
  {
    value: false,
    text: 'SYS_FAILURE',
    label: '任务失败',
  },
  {
    value: false,
    text: 'SYS_FINISH_MJ_IN_PROGRESS_FAILURE',
    label: 'MJ 执行中任务失败',
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
    label: 'MJ 接收消息失败',
  },
  {
    value: false,
    text: 'SYS_SUCCESS',
    label: '成功',
  },
  {
    value: false,
    text: 'SYS_WAIT_MJ_RECEIVED_FAILURE',
    label: 'MJ 请求失败',
  },
  {
    value: false,
    text: 'SYS_WAIT',
    label: '等待',
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


// 清除所有定时器
function clearAllInterval() {
  stopTimer();
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

    const data = await api.RoomOpenaiChatSend(pushData, changData)
    if (data && data.code !== 200) {
      ms.error(`请求失败!  ${data.message}`)
      // 重置数据
      isSend.value = false
    }
  }else{
      ms.error('请先输入内容')
    }
}

async function translate2() {
  if (isTranslate2.value) {
    sendData2.value = oldSendMessage2.value
    buttonItem2.value = '翻译'
    isTranslate2.value = false
    return
  }
  if (sendData2.value) {
    isSend.value = true
    const pushData: sendRequest = {
      roomId: 888,
      text: sendData2.value,
    }

    oldSendMessage2.value = sendData2.value

    const data = await api.RoomOpenaiChatSend(pushData, changData2)
    if (data && data.code !== 200) {
      ms.error(`请求失败!  ${data.message}`)
      // 重置数据
      isSend.value = false
    }
  }else{
      ms.error('请先输入内容')
    }
}

// 流输入调用的函数
async function changData2(talkdata: any, done = false) {
  if (done) {
    // 重置数据
    isTranslate2.value = true // 变为还原
    buttonItem2.value = '还原'
    isSend.value = false
  }
  else {
    // if()
    const lastIndex = talkdata.lastIndexOf('\n', talkdata.length - 2) // , talkdata.length - 2

    try {
      if (lastIndex !== -1)
        sendData2.value = JSON.parse(talkdata.substring(lastIndex)).data.content

      else if (talkdata.indexOf('data') > 0)
        sendData2.value = JSON.parse(talkdata).data.content
    }
    catch (error) {
      // json转换错误 (我只要不打印就没人知道,,,,,)
      // console.error('error', error)
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
    // if()
    const lastIndex = talkdata.lastIndexOf('\n', talkdata.length - 2) // , talkdata.length - 2

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
function copyPropmt(text:string){
  copyText({ text: text ?? '' })
  ms.info('拷贝成功')
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
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xxl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <!-- AI绘画
          上传参考图：生成类似风格或类型图像；图生文：上传一张图片生成相似的提示词
          生成提示词 (提示词带有自定义参数，将不使用默认设定参数) -->
          <div style=" margin-top:-1%; height: 35px;">
            <span style="font-weight: bold; font-size: 16px;float: left;" class="">描述你想生成的图片：</span>
            <NButton style="float: right;width: 70px;height: 30px;margin-bottom: 0.5%;" type="primary" :loading="isSend" @click="translate">
              <template #icon>
                <span class="dark:text-black" style="font-size: 13.5px; display: flex; align-items: center;">
                  <SvgIcon icon="ri-translate" />&nbsp;
                  {{ buttonItem }}
                </span>
              </template>
            </NButton>
          </div>
          <NInput
            v-model:value="sendData"
            type="textarea"
            :disabled="isSend"
            show-count 
            round clearable
            placeholder="例：one red car (建议使用英文)"
          /><!-- @keypress="handleEnter" -->
          <div style=" margin-top:1%;height: 35px; ">
            <span style="float: left;margin-top:1.2%;">忽略元素（可选）</span>

            <NButton style="float: right;width: 70px;height: 30px;margin-bottom: 0.5%;" type="primary" :loading="isSend" @click="translate2">
              <template #icon>
                <span class="dark:text-black" style="font-size: 13.5px; display: flex; align-items: center;">
                  <SvgIcon icon="ri-translate" />&nbsp;
                  {{ buttonItem2 }}
                </span>
              </template>
            </NButton>
          </div>
          <NInput
            v-model:value="sendData2"
            type="text"

            :disabled="isSend"
            placeholder="例：上面输入框输入“one red car” 但不想要“在马路上的汽车” 可以填写“马路或者road” " clearable
          />
          <div style=" margin-top:1%; margin-bottom: 1%;">
            <NButton type="primary" :loading="isSend" @click="sendClick">
              <template #icon>
                <SvgIcon icon="ri-play-circle-line" />
              </template>
              开始生成
            </NButton>
          </div>
          <NDivider title-placement="left">
            当前任务&nbsp;&nbsp;&nbsp;&nbsp;
            <NButton round size="tiny" @click="refushRunMj">
              <template #icon>
                <span class="refresh-run-icon">
                    <SvgIcon  icon="ri-loop-left-line" />
                  </span>
              </template>
              刷新
            </NButton>
          </NDivider><!-- <div>
                <SvgIcon icon="ri-infinity-fill" style="color: gray;" />
              </div> -->
          <div>
            <div v-if="runMjList.length === 0" style="height:100px ;display: flex; justify-content: center; align-items: center;">
              <div>
                <span style="color: gray;">暂无任务</span>
              </div>
            </div>
            <div v-else class="container">
              <div v-for="item in runMjList" :key="item.id" class="box" >
                <div style="margin-top: 1%; margin-bottom: 1%;width:380px">
                  <div style="float: left; margin-left: 2%;">
                    任务:{{ item.id }} ({{ isState(item.status)?.label }})（{{ item.progressing }}%）
                  </div>
                  <div style="float: right;margin-right: 2%;">
                    <NButton round size="tiny"  @click="deleteRunMj(item.id)">
                      <template #icon>
                        <SvgIcon icon="ri-delete-bin-2-line" />
                      </template>
                      删除
                    </NButton>
                  </div>
                </div>
                <div v-if="item.discordImageUrl === null || item.discordImageUrl === ''"  style="display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: 1px;margin-top: 3%;">
                  <NProgress
                    style="margin: 0 8px 12px 0"
                    type="circle"
                    :percentage="item.progressing"
                    :color="themeVars.successColor"
                    :indicator-text-color="themeVars.successColor"
                  />
                  <span>正在生成图片，请稍后...</span>
                  <!-- <img style="width: 99%;margin-bottom: 0.5%;" src="/img/111.png" alt="图片"> -->
                </div>
                <!-- "/img/111.png"${baseURL} -->
                <div v-else  class="mjCenter">
                  <NImage 
                    lazy
                    :src="`${item.discordImageUrl}`"
                    style="width: 80%;margin-bottom: 0.5%;"
                  />
                </div>
              </div>
              <!-- <div class="box">
                <div style="margin-top: 1%; margin-bottom: 1%;">
                  <div style="float: left; margin-left: 2%;">
                    任务id：123 （2%）
                  </div>
                  <div style="float: right;margin-right: 2%;">
                    <NButton round size="tiny">
                      <template #icon>
                        <SvgIcon icon="ri-delete-bin-2-line" />
                      </template>
                      删除
                    </NButton>
                  </div>
                </div>
                <div class="center">
                  <img style="width: 99%;margin-bottom: 0.5%;" src="/img/111.png" alt="图片">
                </div>
              </div> -->
            </div>
            <NDivider title-placement="left">
              任务列表-{{total}}条&nbsp;&nbsp;&nbsp;&nbsp;
              <NButton round size="tiny" @click="refushComMj">
                <template #icon>
                  <span class="refresh-icon">
                    <SvgIcon  icon="ri-loop-left-line" />
                  </span>
                </template>
                刷新
              </NButton>
            </NDivider>
            <div v-if="compMjList.length === 0" style="height:100px ;display: flex; justify-content: center; align-items: center;">
              <div>
                <span style="color: gray;">暂无任务</span>
              </div>
            </div>
            <div v-else class="container" style="margin-bottom: 2%;">
              <div v-for="item in compMjList" :key="item.id" :class="[isMobile ? 'task-box' : 'pc-box']">
                <div style="margin-top: 1%; ">
                  <div style="float: left; margin-left: 2%;">
                    任务:{{ item.id }}
                  </div>
                  <div style="float: right;margin-right: 2%;">
                    <NTooltip
                    :show-arrow="isMobile ? false:true"
                    :style="{
        'margin-left': isMobile ? '18%' : '-5px',
      }"
                    >
                      
                      <template #trigger>
                        <NButton round size="tiny" @click="copyPropmt(item.prompt)">
                          <template #icon>
                            <SvgIcon icon="ri-file-text-line" />
                          </template>
                          描述
                        </NButton>
                      </template>
                      {{ item.prompt }}
                    </NTooltip>

                    <NButton style="margin-left: 3px;" round size="tiny" @click="deleteMj(item.id)">
                      <template #icon>
                        <SvgIcon icon="ri-delete-bin-2-line" />
                      </template>
                      删除
                    </NButton>
                  </div>
                </div>
                <div style="margin-top: 1%; margin-bottom: 1%;">
                  <div style="float: left; margin-left: 2%;">
                    状态:{{ isState(item.status)?.label }}（{{ item.progressing }}%）
                  </div>
                  <div style="float: right;margin-right: 2%;">
                    <span>时间:{{ item.createTime }}</span>
                  </div>
                </div>
                <div v-if="item.status === 'SYS_FAILURE'" class="mjCenter">
                  <span style="margin-top:10%">{{item.failureReason}}</span>
                </div>
                <div v-if="item.status !== 'SYS_FAILURE'" class="mjCenter">
                
                  <NImage 
                    lazy
                    :src="(item.compressedImageUrl !== undefined && item.compressedImageUrl !== null) ? baseURL + item.compressedImageUrl : item.discordImageUrl"
                    style="width: 95%;margin-bottom: 0.5%;"
                  />
                </div>
                <div v-if="item.status !== 'SYS_FAILURE' && item.action !=='UPSCALE'" style="float: right;margin-left: 2%;">
                  <span>放大：</span>
                  <NButton :disabled="isdisabled" @click="upscaleClick(item.id,1)" size="small" style="width: 19%;margin-left: 1%;">
                    U1
                  </NButton>
                  <NButton :disabled="isdisabled" @click="upscaleClick(item.id,2)" size="small" style="width: 19%;margin-left: 1%;">
                    U2
                  </NButton>
                  <NButton :disabled="isdisabled" @click="upscaleClick(item.id,3)" size="small" style="width: 19%;margin-left: 1%;">
                    U3
                  </NButton>
                  <NButton :disabled="isdisabled" @click="upscaleClick(item.id,4)" size="small" style="width: 19%;margin-left: 1%;">
                    U4
                  </NButton>
                </div>
                <div v-if="item.status !== 'SYS_FAILURE'  && item.action !=='UPSCALE'" style="float: right;margin-left: 2%;margin-top: 1%;margin-bottom: 1%;">
                  <span>仿制：</span>
                  <NButton  :disabled="isdisabled" @click="variationClick(item.id,1)" size="small" style="width: 19%;margin-left: 1%;">
                    V1
                  </NButton>
                  <NButton :disabled="isdisabled" @click="variationClick(item.id,2)" size="small" style="width: 19%;margin-left: 1%;">
                    V2
                  </NButton>
                  <NButton :disabled="isdisabled" @click="variationClick(item.id,3)" size="small" style="width: 19%;margin-left: 1%;">
                    V3
                  </NButton>
                  <NButton :disabled="isdisabled" @click="variationClick(item.id,4)" size="small" style="width: 19%;margin-left: 1%;">
                    V4
                  </NButton>
                </div>
              </div>
              
            </div>
            <div class="container">
              <NPagination
                v-model:page="page.pageNum"
                :page-count="pages"
                show-size-picker
                :page-sizes="pageSizes"
                v-model:page-size="page.pageSize"
                @update:page-size="handleSizeChange"
                @update:page="getComMjMessageList"
              />

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
.image-wrapper {
  padding: 0 !important; /* 设置内边距为 0 */
  margin: 0 !important; /* 设置外边距为 0 */
}
.light-green {
  height: 308px;
  width: 100%;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 308px;
  background-color: rgba(0, 128, 0, 0.24);
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0px;
}
.box {
  min-width: 225PX;
  /* min-height: 200px; */
  max-width: 390px;
  /* max-height: 450px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}
/* //425 */
.task-box {
  min-width: 360px;
  min-height: 200px;
  max-width: 420px;
  /* max-height: 500px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}
.pc-box{
  align-self: flex-start;
  min-width: 345px;
  min-height: 200px;
  max-width: 345px;
  /* max-height: 500px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}

.mjCenter {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
}

button {
  padding: 5px 10px;
}

.pic-button{
  width: 35%;
  margin-left: 6px;
}
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.rotate-animation {
  animation-name: rotate;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
}
.n-tooltip {
  width: 300px; /* 设置固定宽度 */
}
</style>
