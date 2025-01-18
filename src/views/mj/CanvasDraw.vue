<script>
import ErrorInfo from './ErrorInfo.vue'
export default {
  components: { ErrorInfo },
  data() {
    return {
      ctx: null,
      drawing: false,
      selectedColor: '#ffffff',
      selectedModel: 'color',
      lineWidth: 1,
      show: false,
      message: '',
      timer: null,
      history: [],
      future: [],
      bgHistory: [],
      bgFuture: [],
      colorList: [
        '#ffffff',
        '#f5487f',
        '#ffa822',
        '#134e6f',
        '#ff6150',
        '#1ac0c6',
        '#272643',
      ],
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.bgCtx = this.$refs.bgCanvas.getContext('2d')
    // 初始化当前状态
    this.saveState()
    this.saveBgState()
  },
  methods: {
    // 上传图片作为绘制背景
    uploadImage(event) {
      const file = event.target.files[0]
      if (!this.checkImageType(file)) {
        this.show = true
        this.message = '请上传图片文件进行绘制'
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          this.$refs.canvas.width = img.width
          this.$refs.canvas.height = img.height
          this.$refs.bgCanvas.width = img.width
          this.$refs.bgCanvas.height = img.height
          this.bgCtx.drawImage(img, 0, 0, img.width, img.height)
          this.saveState()
          this.saveBgState()
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },
    // 下载绘制的图片
    uploadDrawImage() {
      if (this.timer)
        clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        // 创建新的canvas合并背景层&绘制层
        const newCanvas = document.createElement('canvas')
        newCanvas.width = this.$refs.canvas.width
        newCanvas.height = this.$refs.canvas.height
        const newCtx = newCanvas.getContext('2d')
        // 注：先绘制背景层，再绘制画布层
        newCtx.drawImage(this.$refs.bgCanvas, 0, 0)
        newCtx.drawImage(this.$refs.canvas, 0, 0)
        const dataUrl = newCanvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'draw_image.png'
        link.click()
      }, 500)
    },
    // 选择橡皮擦
    selectErasure() {
      this.selectedModel = 'erasure'
    },
    // 选择画笔
    changeSelectColor(index) {
      this.selectedModel = 'color'
      this.selectedColor = index
    },
    // 警告信息提示
    changeShow(value) {
      this.show = value
    },
    // 开始绘制
    startDrawing(event) {
      this.drawing = true
      this.draw(event)
    },
    // 绘制
    draw(event) {
      if (!this.drawing)
        return
      if (this.selectedModel === 'color') {
        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.lineWidth = this.lineWidth
        this.ctx.lineCap = 'round'
        this.ctx.strokeStyle = this.selectedColor
      }
      else {
        this.ctx.globalCompositeOperation = 'destination-out'
        this.ctx.lineWidth = 20
      }
      const x = event.offsetX
      const y = event.offsetY
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
    },
    // 停止绘制
    stopDrawing() {
      this.drawing = false
      this.ctx.beginPath()
      // 停止绘制记录状态
      this.saveState()
      this.saveBgState()
    },
    // 离开画板
    leaveDrawing() {
      this.drawing = false
      this.ctx.beginPath()
    },
    // 记录绘制状态
    saveState() {
      const dataURL = this.$refs.canvas.toDataURL()
      this.history.push(dataURL)
    },
    // 记录背景绘制状态
    saveBgState() {
      const dataURL = this.$refs.bgCanvas.toDataURL()
      this.bgHistory.push(dataURL)
    },
    // 上一步
    back() {
      // 重新绘制背景层&绘画层
      this.backCanvas(this.ctx, this.$refs.canvas, this.history, this.future)
      this.backCanvas(
        this.bgCtx,
        this.$refs.bgCanvas,
        this.bgHistory,
        this.bgFuture,
      )
    },
    backCanvas(ctx, canvas, history, future) {
      if (history.length <= 1)
        return
      const lastState = history[history.length - 1]
      history.pop()
      const prevState = history[history.length - 1]
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
      }
      img.src = prevState
      future.unshift(lastState)
    },
    // 下一步
    next() {
      this.nextCanvas(this.ctx, this.$refs.canvas, this.history, this.future)
      this.nextCanvas(
        this.bgCtx,
        this.$refs.bgCanvas,
        this.bgHistory,
        this.bgFuture,
      )
    },
    nextCanvas(ctx, canvas, history, future) {
      if (future.length === 0)
        return // 没有更多的状态可供重做
      const nextState = future[0] // 获取下一个状态
      future.shift() // 删除当前状态
      history.push(nextState) // 将下一个状态添加到历史记录中
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
      }
      img.src = nextState
    },
    // 清除画布
    clearCanvas() {
      this.$refs.file.value = ''
      this.ctx.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height,
      )
    },

    /**
     * 工具类
     */
    getDrawImage() {
      const dataUrl = this.$refs.canvas.toDataURL('image/png')
      const blob = this.dataURLToBlob(dataUrl)
      const file = new File([blob], 'draw.png')
      return file
    },
    dataURLToBlob(dataURL) {
      const parts = dataURL.split(';base64,')
      const contentType = parts[0].split(':')[1]
      const raw = window.atob(parts[1])
      const blob = new Blob([raw], { type: contentType })
      return blob
    },
    checkImageType(file) {
      if (!/\.(jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name))
        return false
      else
        return true
    },
  },
}
</script>

<template>
  <div id="canvas-container">
    <div class="control">
      <a href="javascript:;" class="upload">
        <input
          id="selectImage"
          ref="file"
          type="file"
          accept="image/*"
          @change="uploadImage"
        >上传图片
      </a>
      <button @click="clearCanvas">
        清除画布
      </button>
      <button :disabled="history.length <= 1" @click="back">
        上一步
      </button>
      <button :disabled="future.length === 0" @click="next">
        下一步
      </button>
      <button @click="uploadDrawImage">
        绘制图片
      </button>
      <div class="control-row">
        <span>画笔颜色：</span>
        <div
          v-for="(item, key) of colorList"
          :key="key"
          class="color-item"
          :style="{ backgroundColor: item }"
          :class="
            selectedColor === item && selectedModel === 'color' ? 'active' : ''
          "
          @click="changeSelectColor(item)"
        />
      </div>
      <div class="control-row">
        <span>画笔粗细：</span>
        <NInput
          v-model:value="lineWidth"
          type="range"
          class="range"
          min="1"
          max="4"
          value="1"
        />
      </div>
      <div class="control-row">
        <span>橡皮擦：</span>
        <img
          src="../../assets/svg/erasure.svg"
          class="icon"
          @click="selectErasure"
        >
      </div>
    </div>
    <div class="box-row">
      <div class="draw-container">
        <canvas
          ref="bgCanvas"
          width="600px"
          height="300px"
          class="bg-canvas"
        />
        <canvas
          ref="canvas"
          width="600px"
          height="300px"
          :class="selectedModel === 'color' ? 'brush' : 'erasure'"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="leaveDrawing"
        />
      </div>
      <ErrorInfo :show="show" :message="message" @changeShow="changeShow" />
    </div>
  </div>
</template>

<style scoped>
#canvas-container {
  padding: 10px;
  font-size: 14px;
}

a {
  text-decoration: none;
}

canvas {
  border: 1px solid #ddd;
}

.brush {
  cursor: url("../../assets/svg/brush.svg") 0 16, default;
}

.erasure {
  cursor: url("../../assets/svg/erasure.svg"), default;
}

.icon {
  width: 16px;
  height: 16px;
}

.control {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.control > * {
  margin-right: 8px;
}

.upload {
  padding: 4px 10px;
  height: 20px;
  line-height: 20px;
  position: relative;
  cursor: pointer;
  color: #000;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: inline-block;
}
.upload input {
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  filter: alpha(opacity=0);
  cursor: pointer;
}

.bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}

.color {
  height: 30px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.color-item {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #ddd;
}

.active {
  border: 1px solid #0075ff;
}

button {
  box-sizing: content-box;
  padding: 4px 10px;
  height: 20px;
  line-height: 20px;
  color: #000;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

button[disabled] {
  color: #a8abb2;
}

.draw-container {
  position: relative;
}

.control-row {
  display: flex;
  align-items: center;
}

.box-row {
  margin-bottom: 8px;
}
</style>
