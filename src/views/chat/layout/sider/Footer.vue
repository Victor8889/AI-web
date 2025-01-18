<script setup lang='ts'>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { NSelect, NTooltip, useMessage } from 'naive-ui'
import api from '../../../../components/Setting/api'
import { HoverButton, SvgIcon } from '@/components/index'
import { useAuthStore, userParStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)
const { isMobile } = useBasicLayout()

// 设置点击打开对应窗口
const Setting = defineAsyncComponent(() => import('@/components/Setting/index.vue'))
const message = useMessage()

const paramStore = userParStore()
const params = ref('3.5-turbo')
// 添加一个辅助函数用于异步获取 chatModel
const getChatModel = async () => {
  return await paramStore.fetchUserParamFromDatabase()
}
const options = ref([])
// const options = [
//   {
//     label: '3.5-turbo',
//     value: 'gpt-3.5-turbo-1106',
//   },
//   {
//     label: '3.5-16k',
//     value: 'gpt-3.5-turbo-16k',
//   },
//   {
//     label: '4.0-8K',
//     value: 'gpt-4',
//   },
//   {
//     label: '4.0-32K',
//     value: 'gpt-4-32k',
//   },
//   {
//     label: '4.0-128K',
//     value: 'gpt-4-1106-preview',
//   },
//   {
//     label: '4.0-多模态',
//     value: 'gpt-4-vision-preview',
//   },
//   {
//     label: '4.0-turbo-preview',
//     value: 'gpt-4-turbo-preview',
//   },
//   {
//     label: '4.0-ALL',
//     value: 'gpt-4-all',
//   },
//   {
//     label: 'gemini',
//     value: 'gemini-pro-vision',
//   },
//   {
//     label: 'claude-3-sonnet',
//     value: 'claude-3-sonnet-20240229',
//   },
//   {
//     label: 'claude-3-opus',
//     value: 'claude-3-opus-20240229',
//   },
//   {
//     label: 'StableDiffusion',
//     value: 'stable-diffusion',
//   }]

const parid = ref(0)

// 在 onMounted 钩子函数中调用 getChatModel 方法，并在异步操作完成后将值赋给 params
onMounted(async () => {
  options.value = (await api.getModelSelect()).data

  if (needPermission.value)
    return

  const param = await getChatModel()
  params.value = param.chatModel
  parid.value = param.id
})

const ms = useMessage()
const show = ref(false)

const handleUpdateValue = async (value: string, options: SelectOption) => {
  const UserParam = {
    id: parid.value,
    chatModel: value,
  }
  // 发送POST请求到后台保存设置
  try {
    // if (value === 'gpt-4-vision-preview') {
    //   message.warning('该模型正在紧急开发中，请先使用其他模型。')
    //   return
    // }
    await paramStore.addParam(UserParam)
    const mess = await api.updateUserPram(UserParam)
    // 假设您的设置值保存在以下变量中

    // 设置保存成功，您可以在此进行一些提示或其他操作
    if (value.includes('gpt'))
      message.info(`切换模型: AI对话${JSON.stringify(value).substring(5)} 成功。`)
    else if (value.includes('gemini'))
      message.info('切换模型: AI对话gemini 成功。')
    else
      message.info(`切换模型: ${value} 成功。`)
    // if (value === 'gpt-4')
    //   message.warning('系统暂无4.0key，您可以设置自己的可以使用。')
  // message.info(`options: ${JSON.stringify(options)}`)
  }

  catch (error) {
    ms.error('模型切换失败。请刷新后重试')
  }
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-container">
      <div class="label">
        模型：
      </div>
      <div class="flex-item">
        <!-- 将params.value绑定到NSelect的v-model，同时通过遍历options数组设置默认选中的值 -->
        <NSelect
          v-model:value="params"
          style="width: 99%; height: 100%;text-overflow: ellipsis"
          class="custom-select"
          size="small"

          :options="options"
          :consistent-menu-width="false"
          @update:value="handleUpdateValue"
        />
      </div>
    </div>
    <div class="hover-button-container">
      <HoverButton @click="show = true">
        <span class="text-xl text-[#4f555e] dark:text-white">
          <SvgIcon icon="ri:settings-4-line" />
        </span>
      </HoverButton>

      <Setting v-if="show" v-model:visible="show" />
    </div>
    <NTooltip
      trigger="hover" placement="top-start" :style="{
        'margin-left': isMobile ? '35%' : '-5px',
      }"
    >
      <template #trigger>
        <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
      </template>
      <span>
        模型名称 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  如何选择<br>
        3.5-turbo:&nbsp;&nbsp;&nbsp;    基础AI，可联系上下文4千字<br>
        3.5-16k: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;     基础AI，可联系上下文8千字<br>
        4.0-8K: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;     高级AI，可联系上下文4千字<br>
        4.0-32K: &nbsp;&nbsp;&nbsp;&nbsp;   高级AI，可联系上下文1.6万字<br>
        4.0-128K: &nbsp;&nbsp;&nbsp;    高级AI,可联系上下文6.4万字<br>
        4.0-多模态: &nbsp;&nbsp;  高级AI,可联系上下文4千字，可识图<br>
        4.0-ALL: &nbsp;&nbsp;  高级AI,可联系上下文6.4万字，可识/画图、联网、可看文档、数据分析<br>
        gemini: &nbsp;&nbsp;  Google高级人工智能模型，支持图像识别<br>
        stable-diffusion: &nbsp;&nbsp;  高级图像生成和处理模型，擅长创建逼真的视觉效果<br>
        注：高级AI逻辑性较强，如不知道如何选择，请选择3.5-turbo或4.0-8K

      </span>
    </NTooltip>
  </footer>
</template>

<style>
.custom-select {
  width: 100%;
  height: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
  .flex-container {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: space-between;
  }

  .label {
    margin-right: 0px; /* 调整边距以适应你的喜好 */
  }

  .flex-item {
    flex: 1;
    overflow: hidden;
  }
  .hover-button-container {
    display: flex;
    align-items: center;
  }
</style>
