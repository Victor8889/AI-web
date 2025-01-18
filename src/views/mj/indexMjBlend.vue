<!--
 * @Author: mjjh
 * @LastEditTime: 2023-04-16 19:55:29
 * @FilePath: \chagpt-shuowen\src\views\chat\index.vue
 * @Description: chat页面index.vue
-->
<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, onBeforeUnmount ,watch } from 'vue'
import { changeColor } from 'seemly'
import {MessageReactive , NButton, NDivider, NImage,UploadCustomRequestOptions, NInput, UploadFileInfo,NPagination, NSelect,NUpload,NProgress, NTooltip, NModal, useMessage, useThemeVars } from 'naive-ui'
import aiCanvas from './aiCanvas.vue'
import { useCopyCode } from '../chat/hooks/useCopyCode'
import HeaderComponent from './components/Header/index.vue'
import { runMjStore,homeStore } from './types/apiTypes'
import api from './api'
import mjapi from './mjsave'
import {flechTask ,localGet,mlog, url2base64,mjImgUrl } from './api'
import type { ImagineRequest, PageMidjourneyRequest, modalImagineRequest,RoomMidjourneyMsgVO,ActionRequest,  UpscaleRequest, VariationRequest, sendRequest } from './types/apiTypes'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
import { copyText } from '@/utils/format'
const props = defineProps({
  myProp: {
    type: String,
    required: true,
  },
});

const baseURL = `${import.meta.env.VITE_RESOURCE_BASE_URL}`

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)

const isdisabled = ref(false)
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


async function getrunMJList() {
  const { data } = await api.getRoomMidjourneyList(props.myProp)

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
    mjType:props.myProp,
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
  isdisabled.value = true
  try{
  api.delMidjourneyItem(id)
  .then((data) => {
    console.info("data");
    ms.info("删除成功");
    getComMjMessageList();
  })  .catch((error) => {
    ms.error(error)
  });
}catch(e){

}finally {
  isdisabled.value = false
  }

}
function deleteRunMj(id) {
  isdisabled.value = true
  try{
  api.delMidjourneyItem(id)
  .then((data) => {
    console.info("data");
    ms.info("删除成功");
    getrunMJList();
  })  .catch((error) => {
    ms.error(error)
  });
}catch(e){

}finally {
  isdisabled.value = false
  }
}
const timer = ref();
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
// 继续生成图片--仿制
async function variationClick(msgId: number | undefined, index: number) {
  try{
    isdisabled.value=true
    const pushData: VariationRequest = {
    index,
    msgId: msgId ?? -1,
    roomId: 123,
    mjType:props.myProp,//普通速度
  }
  // const { data } = await api.getRoomMidjourneyItem(String(msgId))
  // for (const index in messageList.value) {
  //   if (messageList.value[index].id === msgId)
  //     messageList.value[index] = data
  // }
  // mjStore.setlocaMjList(messageList.value)
  await api.RoomMidjourneyVariation(pushData).then(() =>{
    
    ms.info('任务发送成功')
  })
  }catch(e){

  }finally{
    getrunMJList()
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
      mjType:props.myProp,//普通速度
    }
    // const { data } = await api.getRoomMidjourneyItem(String(msgId))
    // for (const index in compMjList.value) {
    //   if (compMjList.value[index].id === msgId)
    //   compMjList.value[index] = data
    // }
    // mjStore.setlocaMjList(messageList.value)
    await api.RoomMidjourneyUpscale(pushData).then(() =>{
     
    ms.info('任务发送成功')
    })
  }catch(e){

  }finally{
    getrunMJList()
    isdisabled.value=false
  }
  
}

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

const imgUrl = ref('')
const chat = ref<Chat.ChatMj>({
  dateTime: "",
  text: "",
  inversion: false,
  error: false,
  loading: false,
  conversationOptions: null,
  requestOptions: { prompt: "", options: null },
  model: "",
  mjID: "",
  opt: {
    progress: "",
    seed: 0,
    imageUrl: "",
    status: "",
    images: [],
    promptEn: "",
    buttons: [],
    action: "",
    duration: 0,
    lkey: "",
  },
  uuid: 0,
  index: 0,
  myid: "",
  logo: "",
})
const msgId = ref()
const action = ref('')
async  function maskOk(d:any){
    console.log(d.mask)
    console.log(d.prompt)
if(action.value === 'Inpaint'){
  const pushData: modalImagineRequest = {
    roomId: 123,
    mjType: props.myProp, // 普通速度
    prompt: d.prompt,
    maskBase64:d.mask,
    msgId: msgId.value,
    action: action.value,
    actionName:'局部重绘'+":"+d.prompt,
  }
  try {
    // const data = await api.RoomMidjourneyImagine(pushData)
    const mjVo = await api.RoomMidjourneyCzp(pushData)

    if (mjVo.code == 200) {
      // 处理堆栈
      const mjs: RoomMidjourneyMsgVO[] = []
      mjs[0] = mjVo.data

      runMj.addMj(mjVo.data as RoomMidjourneyMsgVO)

      ms.info('任务发送成功')
      st.value.isShow =false
    }
    else {
      ms.error(mjVo.message)
    }

    // paramsData.value.isUseCursor = true
    // paramsData.value.cursor = String(messageList.value[0].id)
  }
  catch (e) {
    
    ms.error(e.message)
  }finally {
    getrunMJList()
    isSend.value = false
  }
}else if(action.value === 'CustomZoom'){

}


  }
  
const st = ref( { isLoadImg:false, uri_base64:'', bts:[],isShow:false, isCustom:false ,customText:''})
async function subCustom(){//自定义变焦
  isdisabled.value = true
  const pushData: modalImagineRequest = {
    roomId: 123,
    mjType: props.myProp, // 普通速度
    prompt: st.value.customText,
    maskBase64:'',
    msgId: msgId.value,
    action: 'CustomZoom',
    actionName:'自定义变焦:'+st.value.customText,
  }
  try {
    // const data = await api.RoomMidjourneyImagine(pushData)
    const mjVo = await api.RoomMidjourneyCzp(pushData)

    if (mjVo.code == 200) {
      // 处理堆栈
      const mjs: RoomMidjourneyMsgVO[] = []
      mjs[0] = mjVo.data

      runMj.addMj(mjVo.data as RoomMidjourneyMsgVO)

      ms.info('任务发送成功')
      st.value.isCustom= false
    }
    else {
      ms.error(mjVo.message)
    }

    // paramsData.value.isUseCursor = true
    // paramsData.value.cursor = String(messageList.value[0].id)
  }
  catch (e) {
    
    ms.error(e.message)
  }finally {
    getrunMJList()
    isdisabled.value = false
  }
}

//重绘/变焦等
const cavasName = ref('局部重绘')
///item.id,'CustomZoom','','CustomZoom'
const subV2= (id:number|string,type:string,prompt:string,imgurl:string)=>{
     if(type === 'Inpaint'){
      action.value = 'Inpaint'
      msgId.value = id
      chat.value.opt.imageUrl = imgurl
      chat.value.text = prompt
      st.value.isShow =true

        return 
    }
    // }
    if(type ==='CustomZoom'){
      st.value.customText = ' --zoom 1.8'
      cavasName.value = '自定义变焦'
      action.value = 'CustomZoom'
      msgId.value = id
      st.value.isCustom= true
      return 
    }
     

}

// 生成高质量图片---放大
async function cpzClick(msgId: number | undefined, action: string, actionName: string) {
    try{
      isdisabled.value=true
    const pushData: ActionRequest = {
      action:action,
      msgId: msgId ?? -1,
      roomId: 123,
      mjType:props.myProp,//普通速度
      actionName:actionName,
    }
    await api.RoomMidjourneyCzp(pushData).then(() =>{
      
      ms.info('任务发送成功')
    })
  }catch(e){

  }finally{
    getrunMJList()
    isdisabled.value=false
  }
  
}

//混图
const fileList = ref([])//<UploadFileInfo[]>
const dimensions = ref('SQUARE')
const curPercentage = ref(0)

const timerUp = ref();
// 停止定时器
const stopTimer1 = () => {
  // 检查计时器是否存在，并清除计时器
  if (timerUp.value) {
    clearInterval(timerUp.value)
    timerUp.value = null
    curPercentage.value = 0
  }
}
const startTimer1 = () => {
  // 检查定时器是否已存在，避免重复创建
  if (timerUp.value)
    return

  // 创建定时器，每隔 1 秒执行一次
  timerUp.value = setInterval(() => {
    // 在定时器中调用其他方法
    curPercentage.value++
    if (curPercentage.value >= 99)
      stopTimer1()
  }, 500)
}
// 组件销毁前的清理操作
onBeforeUnmount(() => {
  stopTimer1()
})
const dimensionsOptions = [
  {
    label: '广场 SQUARE(1:1)',
    value: 'SQUARE',
  }, {
    label: '肖像 PORTRAIT(2:3)',
    value: 'PORTRAIT',
  }, {
    label: '景观 LANDSCAPE(3:2)',
    value: 'LANDSCAPE',
  }]
const isUploading = ref(false); // 上传状态
const upPercentage =ref(1)
function beforeUpload(item: UploadFileInfo){
  const isJPG = item.file.file.type === 'image/jpeg' || item.file.file.type === 'image/png'
    const isLt2M = item.file.file.size / 1024 / 1024 > 5
    if(isUploading.value){
      ms.error('请等待刚才的图片上传完成')
      return false
    }
    if (!isJPG){
      ms.error('上传图片只能是 JPG 或 PNG 格式!')
      return false
    }
    if (isLt2M){
      ms.error('上传图片大小不能超过 5MB!')
      return false
    }
    return true

}
const imageUrls = ref([])
const imageNames = ref([])

let messageReactive: MessageReactive | null = null
function removeMessage () {
    messageReactive.destroy()
    messageReactive = null
}
function createMessage()  {
    messageReactive = ms.loading('正在上传', {
      duration: 0
    })
}

watch(isUploading, (newValue, oldValue) => {
  console.log("-=-=-="+newValue)
  if(newValue)
  createMessage()
else
removeMessage()
})

async function uploadImgBlend(options: UploadCustomRequestOptions) {
    const item = options.file
  try {
    if(checkIfUploaded(item)){
      const index = fileList.value.findIndex((f) => f.id === undefined);
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }
      options.onFinish()
      return;
    }
    startTimer1()
      isUploading.value = true
    // 图片格式大小信息没问题 执行上传图片的方法
      const formData = new FormData()
      formData.append('file', item.file)
      const result = await api.uploadImg(formData, 'blend')
      if (result.code === 200) {
        const files = result.data.split(',') // 原图路径
        imageUrls.value.push(baseURL + files[0]);
        imageNames.value.push(item.file.name);
        ms.success('上传成功')
        
      }
      else { 
       const index = fileList.value.findIndex((f) => f.id === item.id)
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }
        ms.error('上传失败，请稍后重试') }
  }
  catch (e) {

    console.error(e.message);
    // fileList.value = fileList.value.filter(file => file.uid !== item.file.uid);// 删除预览图
    const index = fileList.value.findIndex((f) => f.id === item.id)
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }
    ms.error('上传失败，请稍后重试，换成小一点的图更易上传成功');
  }
  finally {
    isUploading.value = false
    const index = fileList.value.findIndex((f) => f.id === undefined);
      if (index !== -1) {
        fileList.value.splice(index, 1)
      }
    stopTimer1()
  }
}

function checkIfUploaded(item: UploadFileInfo): boolean {
  // 检查文件是否已经上传过
  const index = imageNames.value.indexOf(item.file.name);
  return index !== -1;
}
function finished(response){
// 处理上传成功的逻辑
const newImage = {
        id: response.id,
        name: response.name,
        url: response.url
      }
      fileList.value.push(newImage);
}
function handleRemove(item: UploadFileInfo){
const index = fileList.value.findIndex((f) => f.id === item.file.id)
      
if(index > -1){
  imageNames.value.splice(index,1)
  imageUrls.value.splice(index,1)
}
}
// 点击---开始合成
async function sendClick() {
  isSend.value = true
  console.info(imageUrls.value.length)
    try{
        if(imageUrls.value.length < 2){
          ms.error("请最少上传两张图片")
          return
        }
        if(isUploading.value){
          ms.error('请等待图片上传完成')
          return false
        }

        
      isdisabled.value=true
      const pushData: modalImagineRequest = {
          action:'blend',
          msgId: -1,
          roomId: 123,
          mjType:props.myProp,//普通速度
          actionName:'混图：'+imageUrls .value.join(';'),
          maskBase64:imageUrls .value.join(';'),
          prompt:dimensions.value,
      }
    await api.RoomMidjourneyCzp(pushData).then(() =>{
      fileList.value = []
      imageUrls.value = []
        imageNames.value = []
      ms.info('任务发送成功')
    })

  }catch(e){

  }finally{
    getrunMJList()
    isdisabled.value=false
    isSend.value = false
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
            <span style="font-weight: bold; font-size: 16px;float: left;" class="">上传要合成的图片：</span>
          </div>
          <div  >
          <NUpload  
          :default-file-list="fileList"
              v-model:file-list="fileList"
              list-type="image-card"
              :on-finish="finished"
              :max="6"
              @before-upload="beforeUpload"
              :custom-request="uploadImgBlend"
              :disabled = "isUploading"
              :on-remove="handleRemove"
            >
            <NProgress v-if="isUploading"
              
              type="circle"
              :percentage="curPercentage"
              :color="themeVars.successColor"
              :rail-color="changeColor(themeVars.successColor, { alpha: 0.2 })"
              :indicator-text-color="themeVars.successColor"
            />
              <span v-else>点击上传</span>
                
              </NUpload> 
              <div style="margin-top:0.5%">
              <span style="color: grey;">说明：<br>
                                                      1 合成至少2张图片；2 最多可传6张图；3 图片越小上传越快
                                                      
                                                    </span></div></div>
          <div style=" margin-top:1%; " >
           <span >图片尺寸：</span>
           <div style=" margin-top:0.3%; height: 35px; ">
          <NSelect
                  v-model:value="dimensions"
                  style="width:185px;"
                  class="float-left"
                  placeholder="广场 SQUARE(1:1)"
                  :options="dimensionsOptions"
                />
                </div>
              </div>
              
          <div style="margin-top:1%;">
            <NButton type="primary" :loading="isSend" @click="sendClick">
              <template #icon>
                <SvgIcon icon="ri-play-circle-line" />
              </template>
              开始合成
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
                    <NButton :disabled="isdisabled" round size="tiny"  @click="deleteRunMj(item.id)">
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

                    <NButton :disabled="isdisabled" style="margin-left: 3px;"  round size="tiny" @click="deleteMj(item.id)">
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
                    :src='(item.compressedImageUrl !== undefined && item.compressedImageUrl !== null) ? baseURL + item.compressedImageUrl : item.discordImageUrl'
                    style="width: 95%;margin-bottom: 0.5%;"
                  />
                </div>
                <div v-if="item.status !== 'SYS_FAILURE' && item.action !=='UPSCALE' && item.action !=='upscale'  && item.action !=='face'" style="float: right;margin-left: 2%;">
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
                <div v-if="item.status !== 'SYS_FAILURE'  && item.action !=='UPSCALE' && item.action !=='upscale'  && item.action !=='face'" style="float: right;margin-left: 2%;margin-top: 1%;margin-bottom: 1%;">
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
                <div v-if="item.status !== 'SYS_FAILURE' && (item.action ==='UPSCALE' || item.action ==='upscale')" style="margin-top: 1%;float: right;margin-left: 2%;">
                  <span>变化：</span>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'high_variation','强变化')" size="small" style="width: 19%;margin-left: 1%;">
                    强变化
                  </NButton>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'low_variation','弱变化')" size="small" style="width: 19%;margin-left: 1%;">
                    弱变化
                  </NButton>
                  <NButton :disabled="isdisabled" @click="subV2(item.id,'Inpaint',item.prompt,(item.compressedImageUrl !== undefined && item.compressedImageUrl !== null) ? baseURL + item.compressedImageUrl : item.discordImageUrl)" size="small" style="width: 21%;margin-left: 1%;">
                    局部重绘
                  </NButton>
                </div>
                <div v-if="item.status !== 'SYS_FAILURE' &&  (item.action ==='UPSCALE' || item.action ==='upscale')" style="float: right;margin-top: 1%;margin-left: 2%;">
                  <span>变焦：</span>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'Outpaint::75','变焦1.5倍')" size="small" style="width: 25%;margin-left: 1%;">
                    变焦1.5倍
                  </NButton>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'Outpaint::50','变焦2倍')" size="small" style="width: 25%;margin-left: 1%;">
                    变焦2倍
                  </NButton>
                  <NButton :disabled="isdisabled" @click="subV2(item.id,'CustomZoom','','CustomZoom')" size="small" style="width: 25%;margin-left: 1%;">
                    自定义变焦
                  </NButton>
                </div>
                <div v-if="item.status !== 'SYS_FAILURE'  &&  (item.action ==='UPSCALE' || item.action ==='upscale')" style="float: right;margin-left: 2%;margin-top: 1%;margin-bottom: 1%;">
                  <span>扩展：</span>
                  <NButton  :disabled="isdisabled" @click="cpzClick(item.id,'pan_left','向左')" size="small" style="width: 19%;margin-left: 1%;">
                    向左
                  </NButton>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'pan_right','向右')" size="small" style="width: 19%;margin-left: 1%;">
                    向右
                  </NButton>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'pan_up','向上')" size="small" style="width: 19%;margin-left: 1%;">
                   向上
                  </NButton>
                  <NButton :disabled="isdisabled" @click="cpzClick(item.id,'pan_down','向下')" size="small" style="width: 19%;margin-left: 1%;">
                    向下
                  </NButton>
                </div>
                
              </div>
              
              <NModal v-model:show="st.isShow"   preset="card"  :title="cavasName" style="max-width: 700px;" @close="st.isShow=false" >
                  <aiCanvas :chat="chat" :base64="st.uri_base64" v-if="st.isShow" @success="maskOk" />
                </NModal>
                <NModal v-model:show="st.isCustom"   preset="card"  title="自定义变焦" style="max-width: 600px;" @close="st.isCustom=false" >
                    <NInput    type="textarea"  v-model:value="st.customText"    round   maxlength="2000" show-count 
                  :autosize="{   minRows:3, maxRows:8 }" />
                      <div class="pt-2 flex justify-between items-center">  
                            <div class="text-neutral-500">修改zoom值,范围在 1.0~2.0 默认设置为1.8</div>   
                            <NButton type="primary"  :disabled="isdisabled"  size="small" @click="subCustom">提交</NButton> 
                      </div>
                </NModal>
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
