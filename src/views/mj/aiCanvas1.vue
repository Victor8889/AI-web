<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NButton, NInput, NSlider, useMessage } from 'naive-ui'
import type { RoomMidjourneyMsgVO, modalImagineRequest } from './types/apiTypes'
import api from './api'
import { runMjStore } from './types/apiTypes'
import { SvgIcon } from '@/components/index'

// import { CavansDemo } from "@/views/aidutu";
// const pp = defineProps<{ chat?: RoomMidjourneyMsgVO;imgUrl: string }>()
const emits = defineEmits(['success'])
const lineWidth = ref(20)
const colorList = [
  '#fff700b1',
  '#f5487f',
  '#ffa822',
  '#134e6f',
  '#ff6150',
  '#1ac0c6',
  '#272643',
]
const history = ref([])
const futue = ref([])
const bgHistory = ref([])
const drawing = ref(false)
const selectedModel = ref('color')
const bgCanvas = ref<HTMLCanvasElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref(null)
const bgCtx = ref(null)
const selectedColor = ref('#fff700b1')
const propmtData = ref('')
const runMj = runMjStore()
const ms = useMessage()
const isSend = ref(false)
const bgFuture = ref([])
const future = ref([])

// 开始绘制
function startDrawing(event) {
  drawing.value = true
  draw(event)
}
const st = ref({ q: '' })
const ifdiv = ref<HTMLIFrameElement>()

// 收到iframe的消息
const messageFun = (e: MessageEvent) => {
  // console.log('我收到消息了', e.data );
  if (!e?.data)
    return
  const obj = JSON.parse(e.data)
  emits('success', obj)
}
onMounted(() => {
  ctx.value = canvas.value.getContext('2d')

  bgCtx.value = bgCanvas.value.getContext('2d')
  console.log(imgUrl)
  setImageFromUrl(imgUrl)
  initializeCanvas()
  // iframe.contentWindow && iframe.contentWindow.postMessage( JSON.stringify({act:'del',obj }), '*');
})
onUnmounted(() => {
  window.removeEventListener('message', messageFun)
})

function setImageFromUrl(imageUrl) {
  const img = new Image()
  img.onload = function () {
    // const canvas = document.getElementById('canvas')
    // const context = canvas.getContext('2d')
    // const bgCanvas = document.getElementById('bgCanvas')
    // const bgContext = bgCanvas.getContext('2d')

    const imgWidth = this.width
    const imgHeight = this.height

    // if (imgWidth > 500) {
    //   const scaleFactor = 500 / imgWidth // 计算缩放比例

    //   // 设置canvas宽高为图片等比例缩放后的宽高
    //   canvas.value.width = imgWidth * scaleFactor
    //   canvas.value.height = imgHeight * scaleFactor

    //   bgCanvas.value.width = imgWidth * scaleFactor
    //   bgCanvas.value.height = imgHeight * scaleFactor

    //   // 在canvas上绘制等比例缩放后的图片
    //   ctx.value.drawImage(this, 0, 0, imgWidth * scaleFactor * 1.2, imgHeight * scaleFactor)
    //   bgCtx.value.drawImage(0, 0, 0, imgWidth * scaleFactor, imgHeight * scaleFactor)
    // }
    // else {
    // 如果图片宽度不大于500px，直接在canvas上绘制图片
    canvas.value.width = imgWidth
    canvas.value.height = imgHeight

    bgCanvas.value.width = imgWidth
    bgCanvas.value.height = imgHeight

    ctx.value.drawImage(this, 0, 0, imgWidth * 1.2, imgHeight)
    bgCtx.value.drawImage(0, 0, 0, imgWidth, imgHeight)
    // ctx.value.globalAlpha = 1
    // }
  }
  img.src = imageUrl // 替换为你的图片URL
  ctx.value.globalAlpha = 1
}

// 选择橡皮擦
function selectErasure() {
  selectedModel.value = 'erasure'
}
// 选择画笔
function changeSelectColor(index) {
  selectedModel.value = 'color'
  selectedColor.value = index
  console.log('changeSelectColor end')
}
// 绘制
function draw(event) {
  console.log('draw start')
  if (!drawing.value)
    return
  if (selectedModel.value === 'color') {
    // ctx.value.globalCompositeOperation = 'source-over'
    // ctx.value.lineWidth = lineWidth.value
    // ctx.value.lineCap = 'round'
    // ctx.value.strokeStyle = selectedColor.value

    bgCtx.value.globalCompositeOperation = 'source-over'
    bgCtx.value.lineWidth = lineWidth.value
    bgCtx.value.lineCap = 'round'
    bgCtx.value.strokeStyle = selectedColor.value
  }
  else {
    // ctx.value.globalCompositeOperation = 'destination-out'
    // ctx.value.lineWidth = lineWidth.value

    bgCtx.value.globalCompositeOperation = 'destination-out'
    bgCtx.value.lineWidth = lineWidth.value
  }
  const x = event.offsetX
  const y = event.offsetY
  // ctx.value.lineTo(x, y)
  // ctx.value.stroke()
  // ctx.value.beginPath()
  // ctx.value.moveTo(x, y)

  bgCtx.value.lineTo(x, y)
  bgCtx.value.stroke()
  bgCtx.value.beginPath()
  bgCtx.value.moveTo(x, y)
}
// 停止绘制
function stopDrawing() {
  drawing.value = false
  // ctx.value.beginPath()

  bgCtx.value.beginPath()
  // 停止绘制记录状态
  saveState()
  saveBgState()
}
// 离开画板
function leaveDrawing() {
  console.log('leaveDrawing start')
  drawing.value = false
  // ctx.value.beginPath()

  bgCtx.value.beginPath()
}
function saveState() {
  // const dataURL = $refs.canvas.toDataURL()
  // history.value.push(dataURL)
  // const dataURL = canvas.value.toDataURL()
  // history.value.push(dataURL)
}
// 记录背景绘制状态
function saveBgState() {
  // const dataURL = $refs.bgCanvas.toDataURL()
  // bgHistory.value.push(dataURL)
  const dataURL = bgCanvas.value.toDataURL()
  bgHistory.value.push(dataURL)
  console.log('saveBgState start')
}
function initializeCanvas() {
  // 假设这是画布初始化的函数
  // 在此处保存初始画布状态到历史记录
  const initialState = bgCanvas.value.toDataURL() // 获取当前空白画布的DataURL
  bgHistory.value.push(initialState) // 将初始状态添加到历史记录中
}
function back() {
  if (bgHistory.value.length <= 0)
    return // 确保有足够的历史记录可撤销

  const cuentState = bgHistory.value.pop() // 移除并获取当前状态
  bgFuture.value.unshift(cuentState.value) // 将当前状态保存到未来数组中，以便“前进”操作

  const prevState = bgHistory.value[bgHistory.value.length - 1] // 获取上一个状态
  const img = new Image()
  img.onload = () => {
    bgCanvas.value.width = img.width
    bgCanvas.value.height = img.height
    bgCtx.value.clearRect(0, 0, bgCanvas.value.width, bgCanvas.value.height) // 清除当前画布
    bgCtx.value.drawImage(img, 0, 0, img.width, img.height) // 重绘到上一个状态
  }
  img.src = prevState
}

function dataURLToBlob(dataURL) {
  const parts = dataURL.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const blob = new Blob([raw], { type: contentType })
  return blob
}
function dataURL2(dataURL) {
  const parts = dataURL.split(';base64,')
  return parts[1]
}
async function sendPropmt() {
  isSend.value = true
  const maskBase64 = dataURL2(bgCanvas.value.toDataURL())
  const pushData: modalImagineRequest = {

    roomId: 123,
    mjType: 2, // 普通速度
    prompt: propmtData.value,
    maskBase64,
    msgId: '1764297520825397249',
    action: 'Inpaint',
  }
  try {
    // const data = await api.RoomMidjourneyImagine(pushData)
    const mjVo = await api.RoomMidjourneyCzp(pushData)

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
    isSend.value = false
    // 重置数据
    sendData.value = null
    sendData2.value = null
  }
}
</script>

<template>
  <!-- <iframe
    v-if="st.q" ref="ifdiv" :src="`https://mj.aibear.com.cn/draw/mitf/index.html?${st.q}`"
    class=" h-[80vh] w-full" style="border-width: 0px; border-style: none; overflow: hidden;" @load="loadOk"
  /> -->
  <div class="draw-container canvas-box">
    <div class="canvas-background">
      <!-- <span>矩形选框：</span>
      <NButton
        :style="{ border: '1px solid green', width: '20px', height: '25px', margin: '2px', padding: 0 }"
        :show-icon="false"
        @click="handleClickBili(item.id, item.label)"
      />
      <span>选择笔：</span>
      <div

        class="color-item"
        :style="{ backgroundColor: '#ffa822' }"
        :class="
          selectedColor === item && selectedModel === 'color' ? 'active' : ''
        "
        @click="changeSelectColor('#ffa822')"
      /> -->
      <span>选择笔粗细：</span>
      <NSlider
        v-model:value="lineWidth"
        :min="1"
        :max="50"
        :step="1"
        style="width:60px"
      />
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;撤回：</span>

      <NButton :disabled="bgHistory.length <= 1" @click="back">
        <template #icon>
          <img
            src="../../assets/svg/chehui.svg"
            class="icon"
          >
        </template>
      </NButton>
    </div>
    <div class="canvas-background">
      <!-- <img
        src="'https://cdn.xxx.top/mjfile/1764297520825397249'"
        alt=""
        width="500px"
        height="500px"
      > -->
      <canvas
        id="canvas"
        ref="canvas"
        width="5"
        height="5"
        class="bg-canvas"
      />
      <canvas
        id="bgCanvas"
        ref="bgCanvas"
        width="500"
        height="500"
        :class="selectedModel === 'color' ? 'brush' : 'erasure'"
        class="canvas-first"
        style="opacity: 0.5;"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="leaveDrawing"
      />
    </div>
    <div>
      <NInput
        v-model:value="propmtData"
        type="textarea"
        :disabled="isSend"
        show-count
        round clearable
        placeholder="针对选中的区域，描述要重绘的提示词"
      />
      <NButton type="primary" :loading="isSend" @click="sendPropmt">
        <template #icon>
          <SvgIcon icon="ri-play-circle-line" />
        </template>
        开始重绘
      </NButton>
    </div>
  </div>
</template>

<style scoped>
canvas {
  border: 1px solid #ddd;
}
.canvas-background{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
}
.bg-canvas {
  position: absolute;
  z-index: 0;
}

.canvas-first {
  z-index: 10;
}
.color {
  height: 30px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.active {
  border: 1px solid #0075ff;
}
.brush {
  cursor: url("../../assets/svg/gg.svg") 0 16, default;
}

.erasure {
  cursor: url("../../assets/svg/erasure.svg"), default;
}
.color-item {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #fff700b1;
}
.icon {
  width: 20px;
  height: 20px;
}
</style>
