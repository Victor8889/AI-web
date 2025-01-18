<!--
 * @Author: ll
 * @Description: mj参数栏
-->
<script setup lang='ts'>
import { onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { NButton, NInput, NInputNumber, NSelect, NSlider, NSpace, NSwitch, NTabPane, NTabs, NTooltip, useMessage } from 'naive-ui'
import { Delete, Plus } from '@element-plus/icons-vue'
import api from '../../api.ts'
import { SvgIcon } from '@/components/index'
import { userParStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const parStore = userParStore()
const { isMobile } = useBasicLayout()

const raw = ref(false)
const repeat = ref(false)
const mjModel = ref('6')
const nijiModel = ref('6')
const nijiFeng = ref('默认')
const picPara = ref('1')
const selectedTab = ref('MJ')
const seed = ref(0)
const niji = ref(false)
const dalle3 = ref(false)
const dalle_model = ref('dall-e-3')
const iw = ref(1)

const message = useMessage()

// const dalle = ref(dalle_model.value === '3' ? '1024x1024' : '256x256')
// const dalle = computed(() => {
//   return dalle_model.value === 'dall-e-3' ? '1024x1024' : '256x256'
// })
const dalle = ref('1024x1024')

watchEffect(() => {
  dalle.value = dalle_model.value === 'dall-e-3' ? '1024x1024' : '256x256'
})

const optionMj = [
  {
    label: '6.0',
    value: '6',
  },
  {
    label: '5.2',
    value: '5.2',
  }, {
    label: '5.1',
    value: '5.1',
  }, {
    label: '5.0',
    value: '5',
  }]
const optionNiji = [

  {
    label: '6.0',
    value: '6',
  },
  {
    label: '5.0',
    value: '5',
  }, {
    label: '4.0',
    value: '4',
  }]
const quality = ref(false)
const dalleModel = [
//   {
//   label: '2',
//   value: 'dall-e-2',
// },
  {
    label: '3',
    value: 'dall-e-3',
  }]
const optionDalle = [{
  label: '256x256',
  value: '256x256',
}, {
  label: '512x512',
  value: '512x512',
}, {
  label: '1024x1024',
  value: '1024x1024',
}]

const dalle3Pix = [{
  label: '1024x1024',
  value: '1024x1024',
}, {
  label: '1024x1792',
  value: '1024x1792',
}, {
  label: '1792x1024',
  value: '1792x1024',
}]
const dalleStyle = ref('natural')
const dallStyle = [
  {
    label: 'vivid',
    value: 'vivid',
  }, {
    label: 'natural',
    value: 'natural',
  }]
const confusion = ref(0) // 混乱
const styliZe = ref(100) // 风格化
const carryParam = ref(true)
const picture = [
  {
    label: '一般',
    value: '0.5',
  }, {
    label: '清晰',
    value: '0.75',
  }, {
    label: '高清',
    value: '1',
  }, {
    label: '超高清',
    value: '2',
  }]

const selectedBili = ref('1:1')
const selectedBiliLabel = ref('1:1')
const itemsBili = [
  {
    id: '1:1',
    label: '1:1',
  },
  {
    id: '3:4',
    label: '3:4',
  },
  {
    id: '4:3',
    label: '4:3',
  },
  {
    id: '9:16',
    label: '9:16',
  },
  {
    id: '16:9',
    label: '16:9',
  },
]
function getBoxStyle(bili) {
  const styles = {
    '1:1': { width: '18px', height: '18px' },
    '3:4': { width: '13.5px', height: '18px' },
    '4:3': { width: '18px', height: '13.5px' },
    '9:16': { width: '10.125px', height: '18px' },
    '16:9': { width: '18px', height: '10.125px' },
  }
  return styles[bili]
}
function handleClickBili(id, label) {
  selectedBili.value = id
  selectedBiliLabel.value = label
}

function handleOutsideClickBili(event) {
  if (!event.target.closest('button'))
    selectedBili.value = null
}
onMounted(() => {
  handleModel('MJ')
})
const imageUrl = ref('')
const isMj = ref(true)
function handleModel(model) {
  parStore.updateModel(model === 'MJ')
  if (model === 'DALLE')
    isMj.value = false
  else
    isMj.value = true
}
const savedParams = ref(null)
const isDisabled = ref(false)
const showButtons = ref(false)
const imgUrl = ref('')
// 重置参数
const resetParams = () => {
  raw.value = false
  repeat.value = false
  mjModel.value = '6.0'
  // dalle.value = '256x256'
  nijiFeng.value = '默认'
  picPara.value = '高清'
  confusion.value = 0
  styliZe.value = 100
  carryParam.value = true
  selectedBili.value = '1:1'
  seed.value = 0
  niji.value = false

  dalle_model.value = 'dall-e-3'
  quality.value = false
  dalleStyle.value = 'natural'
  dalle.value = '1024x1024'
  iw.value = 1
  imgUrl.value = ''
  imageUrl.value = ''
  isDisabled.value = false
  showButtons.value = false
}

// 调用重置方法
const resetPara = () => {
  resetParams()
  // 在这里可以进行其他操作，比如重新加载页面等
}
watch(
  [raw, repeat, mjModel, dalle, nijiFeng, picPara, selectedBili, confusion, styliZe, carryParam, selectedTab, seed, niji, nijiModel,
    dalle_model, quality, dalleStyle, iw,
    imgUrl],
  ([
    newRaw,
    newRepeat,
    newMjModel,
    newDalle,
    newNijiFeng,
    newPicPara,
    newSelectedBili,
    newConfusion,
    newStyliZe,
    newCarryParam,
    newSelectedTab,
    newSeed,
    newNiji,
    newNijiModel,
    newDalle_model, newQuality, newDalleStyle,

    newIw,
    newImgUrl,
  ]) => {
    const mjParams = {
      raw: newRaw,
      repeat: newRepeat,
      mjModel: newMjModel,
      dalle: newDalle,
      nijiFeng: newNijiFeng,
      picPara: newPicPara,
      selectedBili: newSelectedBili,
      confusion: newConfusion,
      styliZe: newStyliZe,
      carryParam: newCarryParam,
      selectedTab: newSelectedTab,
      seed: newSeed,
      niji: newNiji,
      nijiModel: newNijiModel,
      dalle_model: newDalle_model,
      quality: newQuality,
      dalleStyle: newDalleStyle,
      iw: newIw,
      imgUrl: newImgUrl,
    }
    sessionStorage.setItem('mjParams', JSON.stringify(mjParams))
  },
)
function generateRandomNumber() {
  // 生成随机数字，最大值为4294967295
  seed.value = Math.floor(Math.random() * 4294967295) + 1
}

const curPercentage = ref(0)
const isShowJinDuTiao = ref(false)
const timerUp = ref(null)

// 停止定时器
const stopTimer = () => {
  // 检查计时器是否存在，并清除计时器
  if (timerUp.value) {
    clearInterval(timerUp.value)
    timerUp.value = null
    curPercentage.value = 0
  }
}
// 创建定时器，每隔 1 秒执行一次
const startTimer = () => {
  // 检查定时器是否已存在，避免重复创建
  if (timerUp.value)
    return

  // 创建定时器，每隔 1 秒执行一次
  timerUp.value = setInterval(() => {
    // 在定时器中调用其他方法
    curPercentage.value++
    if (curPercentage.value >= 99)
      stopTimer()
  }, 500)
}

// 组件销毁前的清理操作
onBeforeUnmount(() => {
  stopTimer()
})
// 上传图片
function handleChange(file, fileList) {
  const tempUrl = URL.createObjectURL(file.raw)
}

const imgBaseUrl = `${import.meta.env.VITE_RESOURCE_BASE_URL}`
async function uploadImg(item) {
  try {
    curPercentage.value = 0
    isShowJinDuTiao.value = true
    startTimer()

    // 验证图片格式大小信息
    const isJPG = item.file.type === 'image/jpeg' || item.file.type === 'image/png'
    const isLt2M = item.file.size / 1024 / 1024 < 10
    if (!isJPG)
      message.error('上传图片只能是 JPG 或 PNG 格式!')

    if (!isLt2M)
      message.error('上传图片大小不能超过 10MB!')

    // 图片格式大小信息没问题 执行上传图片的方法
    if (isJPG && isLt2M === true) {
      const formData = new FormData()
      formData.append('file', item.file)
      const result = await api.uploadImg(formData, 'mj')

      if (result.code === 200) {
        const files = result.data.split(',')
        imageUrl.value = imgBaseUrl + files[0] // 缩略图
        imgUrl.value = imgBaseUrl + files[1] // 原图路径
        message.success('上传成功')
      }
      else { message.error('上传失败，请稍后重试') }
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
  imgUrl.value = ''
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
    />
    <main class="flex-1 overflow-hidden h-full">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto ">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl mx-auto bg-white dark:bg-[#101014] rounded-lg p-4 image-wrapper  "
        >
          <div class="mb-4 " style="margin-bottom: 3px;">
            <span class="mr-2">模型选择</span>

            <NTooltip trigger="hover" class="custom-tooltip">
              <template #trigger>
                <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
              </template>
              MJ:通用模型<br>
              DALL-E:惊人、有趣、甚至荒诞
            </NTooltip>
          </div>
          <NTabs v-model:value="selectedTab" type="segment" class="custom-tabs" active-color="#ff2638">
            <NTabPane name="MJ" style="padding: 0;">
              <template #tab>
                <div class="custom-tab" @click="handleModel('MJ')">
                  <img src="../../../../assets/mj/mj.jpg" style="width: 125px; height: 60px;margin: 1px;">
                  <span class="custom-text">MJ</span>
                </div>
              </template>
              <div class="mb-4 custom-wrapper " style="margin-top: 6px;">
                <span>NIJI</span>
                <NSwitch v-model:value="niji" />
                <!-- @update:value="nijiChange"  -->
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  动漫风格
                </NTooltip>
              </div>

              <div class="mb-4 flex items-center " style="margin-top: 6px;">
                <span class="mr-9">版本</span>
                <NSelect
                  v-if="!niji"
                  v-model:value="mjModel"
                  class="float-right"
                  style="width: 60%;"
                  placeholder="5.1"
                  :options="optionMj"
                />
                <NSelect
                  v-else
                  v-model:value="nijiModel"
                  class="float-right"
                  style="width: 60%;"
                  placeholder="5.1"
                  :options="optionNiji"
                />
              </div>
              <div class="mb-2">
                <span>图片比例</span>
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  生成图片的尺寸比例
                </NTooltip>
              </div>
              <div class="button-wrapper" style=" margin-bottom: 10px;margin-top: -4px;">
                <div v-for="item in itemsBili" :key="item.id" class="button-item" @click="handleOutsideClickBili">
                  <NSpace vertical>
                    <NButton
                      :style="{ border: selectedBili === item.id ? '1px solid green' : 'none', width: '40px', height: '55px', margin: '2px', padding: 0 }"
                      :show-icon="false"
                      @click="handleClickBili(item.id, item.label)"
                    >
                      <div>
                        <div style="width:25px;height:25px;display: flex; justify-content: center; align-items: center; ">
                          <div :style="getBoxStyle(item.id)" style=" border:1px solid rgba(157, 157, 157, 0.612)">
                          &nbsp;
                          </div>
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;margin-top: 1px;">
                          <span style=" font-size: 13px; margin: 1px 0;">{{ item.label }}</span>
                        </div>
                      </div>
                    </NButton>
                  </NSpace>
                </div>
              </div>
              <div class="mb-4 custom-wrapper ">
                <span>RAW</span>
                <NSwitch v-model:value="raw" />

                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  呈现的人物写实感更加逼真<br>
                  人物细节、光源、流畅度也更加接近原始作品
                </NTooltip>
              </div>

              <div class="mb-4 custom-wrapper ">
                <span>重 复</span><NSwitch v-model:value="repeat " />

                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  生成可用作重复平铺的图像，以创建无缝图案。
                </NTooltip>
              </div>
              <span style="font-weight: bold">参数：</span>
              <div class="mb-4 flex items-center " style="margin-top: 1px;">
                <span class="mr-9">画质</span>
                <NSelect
                  v-model:value="picPara"
                  class="float-right"
                  style="width: 60%;"
                  placeholder="高清"
                  :options="picture"
                />
              </div>

              <div class="mb-4">
                <span>多样化</span>
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  数值越低，生成的结果在风格、构图上较相似；<br>数值越高，风格、构图的差异会越大，会有让人意象不到的结果
                </NTooltip>

                <div class="flex items-center space-x-4">
                  <NSlider v-model:value="confusion" class="w-2/5" :step="1" :max="100" />
                  <NInputNumber v-model:value="confusion" class="w-4/5" :min="0" :max="100" size="small" />
                </div>
              </div>

              <div class="mb-4">
                <span>风格化</span>

                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  数值较低时，生成的图像与提示词匹配较高，但艺术性较差。<br>值较高时，生成的图像非常具有艺术性，但与提示词的联系较少
                </NTooltip>
                <div class="flex items-center space-x-4">
                  <NSlider v-model:value="styliZe " :step="1" :max="1000" />
                  <NInputNumber v-model:value="styliZe " :min="0" :max="1000" size="small" />
                </div>
              </div>
              <div class="mb-4">
                <span>种子</span>

                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  使用相同的种子编号和提示词生成相似的图片，<br>利用这点我们可以生成连贯一致的人物形象或者场景
                </NTooltip>
                <div class="flex items-center space-x-4">
                  <NInput v-model:value="seed " />
                  <NButton style="height: 28px;" @click="generateRandomNumber">
                    随机
                  </NButton>
                </div>
              </div>
            </NTabPane>
            <NTabPane name="DALLE">
              <template #tab>
                <div class="custom-tab" @click="handleModel('DALLE')">
                  <img src="../../../../assets/mj/niji.jpg" style="width: 120px; height: 60px;">
                  <span class="custom-text">DALL-E</span>
                </div>
              </template>

              <div class="mb-4 custom-wrapper" style="margin-top: 1px;">
                <span class="mr-9">版本</span>
                <NSelect
                  v-model:value="dalle_model"
                  class="float-right"
                  style="width: 60%;"
                  placeholder="3"
                  :options="dalleModel"
                />
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  模型版本，3为最新版本，效果更好
                </NTooltip>
              </div>
              <div class="mb-4 custom-wrapper" style="margin-top: 1px;">
                <span class="mr-9">尺寸</span>
                <NSelect
                  v-if="dalle_model === 'dall-e-2'"
                  v-model:value="dalle"
                  class="float-left"
                  style="width: 60%;"
                  placeholder="5.0"
                  :options="optionDalle"
                />
                <NSelect
                  v-else
                  v-model:value="dalle"
                  class="float-left"
                  style="width: 60%;"
                  placeholder="5.0"
                  :options="dalle3Pix"
                />
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  图片的尺寸
                </NTooltip>
              </div>
              <div v-if="dalle_model === 'dall-e-3'" class="mb-4 custom-wrapper " style="margin-top: 1px;">
                <span class="mr-9">风格</span>
                <NSelect
                  v-model:value="dalleStyle"
                  style="width: 60%;"
                  placeholder="5.0"
                  class="float-left"
                  :options="dallStyle"
                />
                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  Vivid：生成超现实和戏剧化的图像。Natural：生成更自然的图像
                </NTooltip>
              </div>
              <div v-if="dalle_model === 'dall-e-3'" class="mb-4 custom-wrapper " style="margin-top: 1px;">
                <span class="mr-9">开启HD</span>
                <NSwitch v-model:value="quality" style="margin-right: 30px;" />

                <NTooltip trigger="hover" class="custom-tooltip">
                  <template #trigger>
                    <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
                  </template>
                  开启后生成具有更精细,细节和整体一致性的图像
                </NTooltip>
              </div>
            </NTabPane>
          </NTabs>

          <div class="mb-4 custom-wrapper ">
            <span>携带参数</span>
            <NSwitch v-model:value="carryParam" />

            <NTooltip trigger="hover" class="custom-tooltip">
              <template #trigger>
                <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
              </template>
              是否使用上面设置的参数
            </NTooltip>
          </div>

          <div class="mb-4 custom-wrapper">
            <span>重置参数</span>
            <NButton class="float-center" @click="resetPara">
              重置
            </NButton>
            <SvgIcon class="float-right icon-large" />
          </div>
          <div v-if="selectedTab === 'MJ'" class="mb-4">
            <span>参考图</span>
            <div style="display: flex;">
              <el-upload
                :ref="imageUrl"
                :on-change="handleChange"
                action=""
                :model="imageUrl"
                class="avatar-uploader"
                :show-file-list="false"
                :http-request="uploadImg"
                :max="1"
                :disabled="isDisabled"
              >
                <div class="file-item">
                  <img v-if="imageUrl" w-full :src="imageUrl" class="avatar" alt="" @mouseover="showButton()" @mouseleave="hideButtons()">
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>

                  <div v-show="showButtons" class="buttons" @mouseover="showButton()" @mouseleave="hideButtons()">
                    <el-icon class="delete-button avatar-delete-icon" @click="handleRemove()">
                      <Delete />
                    </el-icon>
                  </div>
                  <div v-if="isShowJinDuTiao" class="imgProcess">
                    <el-progress
                      type="circle" :percentage="curPercentage" :width="80"
                      class="progressCircle" color="#5cb87a"
                    />
                  </div>
                </div>
              </el-upload>
              <div class="urlInput">
                <NInput
                  v-model:value="imgUrl"
                  type="textarea"
                  round clearable
                  placeholder="参考图地址，也可直接上传图片,以地址为主"
                  class="input-custom"
                />
              </div>
            </div>
          </div>

          <div v-if="selectedTab === 'MJ'" class="mb-4">
            <span>参考图片权重</span>

            <NTooltip trigger="hover" class="custom-tooltip">
              <template #trigger>
                <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
              </template>
              数值越高，参考图对生成的结果影响越大
            </NTooltip>
            <div class="flex items-center space-x-4">
              <NSlider v-model:value="iw " :step="0.1" :min="0.5" :max="2" />
              <NInputNumber v-model:value="iw " :step="0.1" :min="0.5" :max="2" size="small" />
            </div>
          </div>
          <div class="mb-2 text-sm">
            任务失败会退还额度（5分钟内）
            <span v-if="isMj" style="font-size: small; color: #b4b4b4;">注：出图后V为仿制，U为放大</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.image-wrapper {
  padding: 0 !important; /* 设置内边距为 0 */
  margin: 0 !important; /* 设置外边距为 0 */
}
.icon-large {
  color: #ABABAB;
  font-size: 16px;
}
/* 设置子 div 之间的上下行间距为 10px */
/* 在父容器中定义行间距变量 */
.my-container {
  --row-spacing: 10px;
}
.my-container > div {
  margin: var(--row-spacing) 0;
}
.my-container > div {
  margin: 10px;
}
.custom-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  justify-content: space-between;
}

.custom-wrapper span {
  margin-left: 0.1rem;
}
 .button-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
}

.button-item {
  margin: 1px;
}
.custom-tab {
  position: relative;
  width: 100px; /* 调整宽度为你需要的值 */
  /* 添加其他自定义样式 */
}
.custom-text {
  position: absolute;
  bottom: 21%;
  left: 50%;
  font-size: 20px;
  transform: translateX(-50%);
  color: rgb(255, 255, 255);
  font-weight: bold;
  /* 添加其他自定义样式 */
}
.custom-tabs.n-tabs .n-tabs-rail .n-tabs-tab-wrapper .n-tabs-tab.n-tabs-tab--active  {
  background-color:#f88534 !important;
}

.custom-tooltip .n-tooltip-content {
  word-wrap: break-word; /* 使用 word-wrap 属性进行自动换行 */
  white-space: normal; /* 使用 white-space 属性设置空白符处理方式 */
  float: right;
}
/**上传图片 */
.avatar-uploader .avatar {
  width: 88px;
  height: 88px;
  display: block;flex: 1;
}
.avatar-uploader .el-upload {
  border: 1.5px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  color:#5cb87a;
  transition: var(--el-transition-duration-fast);
}
.urlInput{
  width: 78px;
  height: 68px;
  display: block;flex: 1;
}
.urlInput .n-input-wrapper{
  height:90px;
}
.input-custom .n-input__textarea n-scrollbar {
  font-size: 10px; /* 调整字体大小 */
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
.imgProcess {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(190, 190, 190, 0.732); /* 设置遮罩层的颜色和透明度 */
  padding: 2px;
  transition: opacity 0.3s;
}

.file-item {
  display: flex;
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
