<!--
  *
  * @Description:swd
 -->
<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NButton, NInput, NTooltip, useMessage } from 'naive-ui'
import api from '../../api'
import type { SwdVO, sendRequest } from '../../components/apiTypes'
import { useSwdStore } from '../../components/apiTypes'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const swdStore = useSwdStore()

const { isMobile } = useBasicLayout()
const ms = useMessage()
/**
 左侧条件ui
  */
const userInput = ref('')
const aiInput = ref('')
// 修改：将initValue定义为一个字符串，而不是一个ref对象
const initValue = `# WM-AI
## 功能介绍
- AI（人工智能）聊天
- MJ/DALLE文生图
- 智能思维导图
- 二维码生成
- 更多AI敬请期待... ...

## 后期计划
1. 接入SD/SD-XL。
2. AI照片处理。
3. 同时期待您的交流。
4. 更多AI等您探索。

## 注意事项：
- 期待您发挥AI的最大本领。
- 请合法合规使用本产品。
- 希望您使用愉快。
`
function test() {
  userInput.value = 'WM-AI'
  aiInput.value = initValue
  // startSwd()
}
const isSend = ref(false)
/**
 * 下面才是翻译，与上面无关
 */
async function startSwd() {
  if (userInput.value) {
    isSend.value = true
    const pushData: sendRequest = {
      roomId: 999,
      text: userInput.value,
    }
    const data = await api.RoomOpenaiChatSend(pushData, changDatas)
    if (data && data.code !== 200) {
      ms.error(`请求失败!  ${data.message}`)
      // 重置数据
      isSend.value = false
    }
  }
  else {
    ms.warning('请先输入内容')
  }
}
// 流输入调用的函数
async function changDatas(talkdata: any, done = false) {
  if (done) {
    // 重置数据
    isSend.value = false
  }
  else {
    const lastIndex = talkdata.lastIndexOf('\n', talkdata.length - 2)

    try {
      if (lastIndex !== -1)
        aiInput.value = JSON.parse(talkdata.substring(lastIndex)).data.content
    }
    catch (error) {
      // json转换错误 (我只要不打印就没人知道,,,,,)
      // console.error('error', error)
    }
  }
}
watch(aiInput, (newValue) => {
  const swdData: SwdVO = [{
    aiInput: newValue,

    isCompleted: 1,
  }]
  // swdData.aiInput = newValue
  swdStore.addlocaSwdVO(swdData)
})
</script>

<template>
  <div class="flex flex-col w-full h-full ">
    <HeaderComponent
      v-if="isMobile"
    />
    <main class="flex-1 overflow-hidden">
      <div class="mb-2">
        <span><b>思维导图内容</b></span>
        <NTooltip trigger="hover" class="custom-tooltip">
          <template #trigger>
            <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
          </template>
          第一个框输入内容然后点击“开始生成”即可
        </NTooltip>
      </div>

      <div class="mb-2">
        <div><b /></div>
        <NInput
          v-model:value="userInput"
          type="textarea"
          clearable
          placeholder="输入思维导图主题或者要问的内容。可以输入：番茄炒蛋。 试一下效果"
          style="min-height: 150px;"
          class="right-align"
        />
      </div>
      <div class="flex mb-2 text-sm justify-content: justify-center">
        <NButton type="primary" :loading="isSend" @click="startSwd">
          开始生成思维导图
        </NButton>
      </div>
      <div class="flex justify-between mb-2">
        <span><b>markdown格式内容</b></span>
        <NButton text @click="test">
          <span style="color:green;">试试示例</span>
        </NButton>
      </div>
      <div
        id="scrollRef"
        ref="scrollRef" class="h-full overflow-hidden overflow-y-auto "
      >
        <NInput
          v-model:value="aiInput"
          type="textarea"
          clearable
          placeholder="请输入markdown格式内容"
          style="min-height: 382px;"
          class="right-align"
        />
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
.right-align .n-base-clear {
  margin-right: 1px;
}
</style>
