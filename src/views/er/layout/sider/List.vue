<!--
  *
  * @Description: QR参数栏
 -->
<script setup lang='ts'>
import { computed, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { NButton, NIcon, NImage, NInput, NInputNumber, NRadioButton, NRadioGroup, NSlider, NSpace, NTabPane, NTabs, NText, NUpload, NUploadDragger, useMessage } from 'naive-ui'
import dayjs from 'dayjs'
import api from '../../api'
import { useQrStore } from '../../components/apiTypes'
import type { RoomQrVO } from '../../components/apiTypes'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const qrStore = useQrStore()
const { isMobile } = useBasicLayout()
const ms = useMessage()
const description = ref()
const prompt = ref()
const selectedQrDesc = ref('isQr')
const selectedModUser = ref('isModel')
/**
 左侧条件ui
  */
const selectedYangshi = ref(null)
const itemsYangshi = [

  {
    id: 3,
    imageUrl: 'qr/meiman.png',
    label: '钢铁侠',
  },
  {
    id: 6,
    imageUrl: 'qr/guofeng.png',
    label: '国风写实',
  },
  {
    id: 5,
    imageUrl: 'qr/meigui.png',
    label: '玫瑰礼服',
  }, {
    id: 10,
    imageUrl: 'qr/dangao.png',
    label: '蛋糕',
  },
  {
    id: 9,
    imageUrl: 'qr/hudie.png',
    label: '蝴蝶仙子',
  },
  {
    id: 2,
    imageUrl: 'qr/huayuan.png',
    label: '花绘',
  },
  {
    id: 4,
    imageUrl: 'qr/chitang.png',
    label: '池塘',
  }, {
    id: 1,
    imageUrl: 'qr/xuejing.png',
    label: '雪景',
  },
  {
    id: 7,
    imageUrl: 'qr/chengbao.png',
    label: '迷雾城堡',
  },
  {
    id: 8,
    imageUrl: 'qr/huajia.png',
    label: '花嫁',
  },

]
const selectedFengge = ref(null)
const itemsFengge = [
  {
    id: 70,
    imageUrl: 'qr/70_meiman.jpg',
    label: '美漫',
  },
  {
    id: 2,
    imageUrl: 'qr/qingchun.jpg',
    label: '清新少女',
  },
  {
    id: 67,
    imageUrl: 'qr/67_katongchahua.jpg',
    label: '卡通插画',
  },
  {
    id: 69,
    imageUrl: 'qr/69_shuimohua.jpg',
    label: '水墨画',
  },
  {
    id: 51,
    imageUrl: 'qr/51_tangguotouxiang.jpg',
    label: '糖果头像',
  },
]

const selectedBili = ref(null)
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

function handleClickBili(id) {
  selectedBili.value = id
}

function handleOutsideClickBili(event) {
  if (!event.target.closest('button'))
    selectedBili.value = null
}
const selectedMayan = ref(null)
const itemsMayan = [
  {
    id: 'random',
    imageUrl: 'qr/1.png',
  },
  {
    id: 'square',
    imageUrl: 'qr/2.png',
  },
  {
    id: 'circle',
    imageUrl: 'qr/3.png',
  },
  {
    id: 'plus',
    imageUrl: 'qr/4.png',
  },
  {
    id: 'box',
    imageUrl: 'qr/5.png',
  },
  {
    id: 'octagon',
    imageUrl: 'qr/6.png',
  },
  {
    id: 'tiny-plus',
    imageUrl: 'qr/7.png',
  },
]
function handleClick(id) {
  selectedYangshi.value = id
}

function handleOutsideClick(event) {
  if (!event.target.closest('button'))
    selectedYangshi.value = null
}

function handleClickFengge(id) {
  selectedFengge.value = id
}

function handleOutsideClickFengge(event) {
  if (!event.target.closest('button'))
    selectedFengge.value = null
}

const manyanTips = ref(null)
function handleClickMayan(id) {
  selectedMayan.value = id
  if (id === 7)
    manyanTips.value = '此码眼艺术程度较高，微信长按识别率相对较低适用于相机扫码的场景'
  else
    manyanTips.value = ''
}

function handleOutsideClickMayan(event) {
  if (!event.target.closest('button'))
    selectedMayan.value = null
}

const checkStrategy = ref('V1')
const selectedValue = computed(() => {
  if (checkStrategy.value === 'V1')
    return '初代模型，生成效果一般'

  else if (checkStrategy.value === 'V1.1')
    return '中级模型，生成效果较好'

  else if (checkStrategy.value === 'V2')
    return '高级模型，生成效果最好'
  else
    return ''
})

// 滑块
const sbvalue = ref(0.4)
const valueDy = ref(0.4)
const describeFileList = ref<UploadFileInfo[]>([])
// 限制文件类型
async function beforeUpload(data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) {
  if (data.file.file?.size && data.file.file?.size < 10 * 1024 * 1024 && (data.file.file?.type === 'image/png' || data.file.file?.type === 'image/jpeg'))
    return true
  else
    ms.error('只能上传不超过 10MB 的图片文件，请重新上传')

  return false
}

// const qrList = ref <RoomQrVO[]>(qrStore.qrListData)

async function startQr() {
  // 先获取什么方式，什么模式，在判断传值
  ms.warning('功能维护中，请联系管理员')
  return
  const RoomQrVORequests = {
    description: selectedQrDesc.value === 'isDesc' ? description.value : '', // 描述
    artNumber: selectedModUser.value === 'isModel' ? sbvalue.value : valueDy.value, // 艺术识别率
    qrFormat: selectedModUser.value === 'isModel' ? selectedYangshi.value : '', // 二维码样式
    version: selectedModUser.value !== 'isModel' ? checkStrategy.value : '', // 版本
    prompt: selectedModUser.value !== 'isModel' ? prompt.value : '', // 提示,
    barcode: selectedModUser.value !== 'isModel' ? selectedMayan.value : '', // 码眼
    proportion: selectedModUser.value !== 'isModel' ? selectedBili.value : '', // 比例
    model: selectedModUser.value !== 'isModel' ? selectedFengge.value : '', // 风格

  }

  if (selectedModUser.value !== 'isModel') {
    if (checkStrategy.value === null || prompt.value === null || selectedBili.value === null || selectedFengge.value === null)
      ms.error('请选择参数信息')
    return
  }
  else {
    if (selectedYangshi.value === null) {
      ms.error('请选择二维码样式')
      return
    }
  }

  await api.addQr(RoomQrVORequests)
  addQrStore()
}
function addQrStore() {
  const data: RoomQrVO = [{
    id: -999,

    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),

    description: selectedQrDesc.value === 'isDesc' ? description.value : '',

    isCompleted: '等待',
  }]
  qrStore.addlocaQrList(data, true)
}
</script>

<template>
  <div class="flex flex-col w-full h-full ">
    <HeaderComponent
      v-if="isMobile"
    />
    <main class="flex-1 overflow-hidden">
      <div class="mb-2">
        <span><b>内容配置</b></span>
        <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
      </div>
      <NTabs v-model:value="selectedQrDesc" type="segment">
        <NTabPane name="isQr" tab="二维码">
          <NUpload
            v-model:file-list="describeFileList"
            multiple
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
              <NText depth="3" style="font-size: 12px">
                点击或者拖动文件到该区域来上传二维码<br>
                请不要上传敏感数据
              </NText>
            </NUploadDragger>
            <NModal
              v-model:show="showModal"
              preset="card"
              style="width: 600px"
              title="一张很酷的图片"
            >
              <img :src="previewImageUrl" style="width: 100%">
            </NModal>
          </NUpload>
        </NTabPane>
        <NTabPane name="isDesc" tab="纯文本">
          <NInput
            v-model:value="description"
            style="height: 189px;"
            type="textarea"
            class="custom-input"
            placeholder="输入内容，扫面二维码后用来展示的,可以是链接，内容越简洁效果越好，"
            maxlength="150" show-count round
            clearable
          />
        </NTabPane>
      </NTabs>

      <div class="mb-2">
        <div><b /></div>
        <span style="display: block; margin: 10px 0;"><b>模型配置</b></span>
      </div>

      <NTabs v-model:value="selectedModUser" type="segment" animated>
        <NTabPane name="isModel" tab="使用模板" bar-width="10">
          <div class="mb-4 ">
            <span class="inline-flex items-center">艺术<SvgIcon icon="ri-arrow-left-line" /><SvgIcon icon="ri-arrow-right-line" />识别率</span><SvgIcon icon="ri-question-fill" class="float-right icon-large" />
            <div class="flex items-center space-x-4">
              <NSlider v-model:value="sbvalue" class="w-2/5" :step="0.01" max="1" />
              <NInputNumber v-model:value="sbvalue" class="w-4/5" min="0" max="1" :step="0.01" size="small" />
            </div>
          </div>
          <!--
          <div class="mb-4">
            <span style=" margin: 1px 0;">seed(选填)</span><SvgIcon icon="ri-question-fill" class="float-right icon-large" />
            <NInput />
          </div>
        -->
          <div class="mb-4">
            <span style="display: block; margin: 2px 0;">二维码样式</span>
            <div />
            <div class="button-wrapper">
              <div v-for="item in itemsYangshi" :key="item.id" class="button-item" @click="handleOutsideClick">
                <NSpace vertical>
                  <NButton
                    :style="{
                      border: selectedYangshi === item.id ? '2px solid green' : 'none',
                      width: '105px',
                      height: '130px',
                      margin: '2px',
                      borderRadius: '5px',
                      padding: 0,
                      overflow: 'hidden',
                    }"
                    :show-icon="false"
                    @click="handleClick(item.id)"
                  >
                    <div style=" max-height: 100px;margin-top: -30px;text-align: center; ">
                      <NSpace vertical>
                        <NImage
                          :src="item.imageUrl"
                          style=" margin: 1px;width: 100%; height: 100%;  object-fit: cover;border-radius: 3px"
                        />
                        <div style="margin-top: -5px;padding-bottom: 10px;">
                          <span style="font-size: 12px;">{{ item.label }}</span>
                        </div>
                      </NSpace>
                    </div>
                  </NButton>
                </NSpace>
              </div>
            </div>
          </div>
        </NTabPane>
        <NTabPane name="isUser" tab="自己定义">
          <div class="flex flex-wrap">
            <div class="mb-4 inline-flex items-center space-x-2">
              <span>模型版本：</span>
              <NSpace align="center">
                <NRadioGroup v-model:value="checkStrategy">
                  <NRadioButton value="V1">
                    V1
                  </NRadioButton>
                  <NRadioButton value="V1.1">
                    V1.1
                  </NRadioButton>
                  <NRadioButton value="V2">
                    V2
                  </NRadioButton>
                </NRadioGroup>
              </NSpace>
            </div>
            <div class="mb-4" style="margin-top: -16px;text-align: right;">
              <span style="font-size: 12px;">{{ selectedValue }}</span>
            </div>
          </div>
          <div class="mb-4 ">
            <span class="inline-flex items-center">艺术<SvgIcon icon="ri-arrow-left-line" /><SvgIcon icon="ri-arrow-right-line" />识别率</span><SvgIcon icon="ri-question-fill" class="float-right icon-large" />
            <div class="flex items-center space-x-4">
              <NSlider v-model:value="valueDy" class="w-2/5" :step="0.01" max="1" />
              <NInputNumber v-model:value="valueDy" class="w-4/5" min="0" max="1" :step="0.01" size="small" />
            </div>
          </div>
          <div class="mb-4">
            <span>图像提示词</span>
            <NInput
              v-model:value="prompt"
              style="height: 170px;"
              type="textarea"
              class="custom-input"
              placeholder="示例：杰作，质量最好，粉红色头发的女孩拿着向日葵，脸颊红润，笑容灿烂。当她凝视远方时，相机聚焦在她的上半身，她的红眼病因喜悦而闪闪发光。场景以纯白色为背景，让人想起梦幻般的童话世界。灯光柔和温暖，给女孩和她的向日葵投下柔和的光芒。调色板是柔和的，粉色和黄色的色调主导着场景"
              maxlength="1000"
              show-count
              round
              clearable
            />
          </div>
          <span />
          <div class="mb-4">
            <span>图像风格</span>
            <div class="button-wrapper">
              <div v-for="item in itemsFengge" :key="item.id" class="button-item" @click="handleOutsideClickFengge">
                <NSpace vertical>
                  <NButton
                    :style="{
                      border: selectedFengge === item.id ? '2px solid green' : 'none',
                      width: '105px',
                      height: '130px',
                      margin: '2px',
                      borderRadius: '5px',
                      padding: 0,
                    }"
                    :show-icon="false"
                    @click="handleClickFengge(item.id)"
                  >
                    <div style="width:100%;height: 100%;margin: 0 auto;text-align: center; ">
                      <NSpace vertical>
                        <NImage
                          :src="item.imageUrl"

                          style="margin: 1px; width: 99%; height: 100%;
                           object-fit: cover;border-radius: 3px"
                        />
                        <div style="margin-top: -5px;padding-bottom: 10px;">
                          <span style="font-size: 12px;">{{ item.label }}</span>
                        </div>
                      </NSpace>
                    </div>
                  </NButton>
                </NSpace>
              </div>
            </div>
          </div>
          <span />
          <div class="mb-4">
            <span>图像比例</span>
            <div class="button-wrapper">
              <div v-for="item in itemsBili" :key="item.id" class="button-item" @click="handleOutsideClickBili">
                <NSpace vertical>
                  <NButton
                    :style="{ border: selectedBili === item.id ? '1px solid green' : 'none', width: '40px', height: '30px', margin: '2px', padding: 0 }"
                    :show-icon="false"
                    @click="handleClickBili(item.id)"
                  >
                    <div style="width:100%;height: 100%;margin: 0 auto;  text-align: center; ">
                      <span style="font-size: 4px; margin: 1px 0;">{{ item.label }}</span>
                    </div>
                  </NButton>
                </NSpace>
              </div>
            </div>
          </div>
          <span />
          <div class="mb-4">
            <span>码眼选择</span>
            <div class="button-wrapper">
              <div v-for="item in itemsMayan" :key="item.id" class="button-item" @click="handleOutsideClickMayan">
                <NSpace vertical>
                  <NButton
                    :style="{
                      border: selectedMayan === item.id ? '2px solid green' : 'none',
                      width: '45px',
                      height: '45px',
                      margin: '3px',
                      padding: 0,
                    }"
                    :show-icon="false"
                    @click="handleClickMayan(item.id)"
                  >
                    <div style="width:100%;height: 100%;margin: 0 auto;  text-align: center; ">
                      <img
                        :src="item.imageUrl"
                        style=" width:100%;height: 100%;margin: 0 auto;  text-align: center; "
                      >
                    </div>
                  </NButton>
                </NSpace>
              </div>

              <div>
                <span style="font-size: 12px;">{{ manyanTips }}</span>
              </div>
            </div>
          </div>
        </NTabPane>
      </NTabs>

      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto ">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl mx-auto bg-white dark:bg-[#101014] rounded-lg p-4 image-wrapper  "
        >
          <div class="mb-2 text-sm">
            任务失败会退还额度（15分钟内）
          </div>
          <div class="flex mb-2 text-sm justify-content: justify-center">
            <NButton type="primary" @click="startQr">
              开始生成
            </NButton>
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
 .button-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
}

.button-item {
  margin: 1px;
}
.custom-input::placeholder {
  font-size: 12px; /* 自定义字体大小 */
}
</style>
