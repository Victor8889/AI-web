<!--
 * @Description: 弹出设置窗口
-->
<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput, NInputNumber, NModal, NSlider, NTooltip, useMessage } from 'naive-ui'
import api from './api'
import { SvgIcon } from '@/components/index'
import { useAuthStore, userParStore } from '@/store'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)
const paramStore = userParStore()
const loading = ref<boolean>(false)
const ms = useMessage()
// 创建一个缓存对象
const cachedParams = ref({
  id: 0,
  systemMessage: null,
  apikey: null,
  contextCount: 8,
  presencePenalty: 1,
  temperature: 0.2,
  chatModel: '',
})
// 从数据库获取参数信息并赋值给 cachedParams
onMounted(async () => {
  try {
    if (needPermission.value)
      return
    const res = await paramStore.getUserParam // 从服务器获取数据
    // 将获取的数据存储在缓存对象中
    cachedParams.value = {
      id: res.id,
      systemMessage: res.systemMessage,
      apikey: res.apikey,
      contextCount: res.contextCount,
      presencePenalty: res.presencePenalty,
      temperature: res.temperature,
      chatModel: res.chatModel,
    }
  }
  catch (error) {
    ms.error('获取参数异常。请刷新后重试')
  }
})

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const active = ref('Config')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const saveSettings = async () => {
  loading.value = true
  // 假设您的设置值保存在以下变量中
  const UserParam: Chat.UserParam = {
    id: cachedParams.value.id,
    systemMessage: cachedParams.value.systemMessage,
    apikey: cachedParams.value.apikey,
    presencePenalty: cachedParams.value.presencePenalty,
    temperature: cachedParams.value.temperature,
    contextCount: cachedParams.value.contextCount,
    chatModel: cachedParams.value.chatModel,
  }

  // 发送POST请求到后台保存设置
  try {
    await paramStore.addParam(UserParam)
    const mess = await api.updateUserPram(UserParam)
    // 假设您的设置值保存在以下变量中

    // 设置保存成功，您可以在此进行一些提示或其他操作
    ms.info(mess.message)
  }
  catch {
    ms.error('设置保存失败。请刷新后重试')
  }
  finally {
    loading.value = false
  }
}
const resetSettings = async () => {
  cachedParams.value.apikey = ''
  cachedParams.value.systemMessage = '你好,请用中文交流。'
  cachedParams.value.contextCount = 8
  cachedParams.value.presencePenalty = 0
  cachedParams.value.temperature = 0.2
  loading.value = true
  // 假设您的设置值保存在以下变量中
  /**
  const UserParam: Chat.UserParam = {
    id: cachedParams.value.id,
    systemMessage: cachedParams.value.systemMessage,
    apikey: '', // cachedParams.value.apikey,
    presencePenalty: cachedParams.value.presencePenalty,
    temperature: cachedParams.value.temperature,
    contextCount: cachedParams.value.contextCount,
  }
  */
  // 发送POST请求到后台保存设置
  try {
    // const mess = await api.updateUserPram(UserParam)
    // 假设您的设置值保存在以下变量中

    // await paramStore.addParam(UserParam)
    // 设置保存成功，您可以在此进行一些提示或其他操作
    ms.info('数据重置成功，请点击保存按钮')
  }
  catch {
    ms.error('设置保存失败。请刷新后重试')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal v-model:show="show" title="助手设置" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div>
      <div class="mb-4 flex items-center ">
        <span class="mr-2">您的私有key</span>

        <div class="flex items-center space-x-4 w-4/5">
          <NInput v-model:value="cachedParams.apikey" size="small" class="n-input" type="text" placeholder="sk- 开头的key" />
        </div>
        <NTooltip trigger="hover">
          <template #trigger>
            <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
          </template>
          严格的自用模式，仅属于您自己的key
        </NTooltip>
      </div>
      <div class="mb-4 flex items-center ">
        <span class="mr-2">系统消息</span>
        <div style="width: 4%;" />
        <div class="flex items-center space-x-4 w-4/5  mt-3">
          <NInput v-model:value="cachedParams.systemMessage" size="small" class="n-input" type="textarea" placeholder="系统消息" />
        </div>
      </div>
      <div class="mb-4 flex items-center ">
        <span class="mr-2">上下文数量</span>
        <div style="width: 2%;" />
        <div class="flex items-center space-x-4">
          <NSlider v-model:value="cachedParams.contextCount" class="w-3/5" :step="1" max="20" />
          <NInputNumber v-model:value="cachedParams.contextCount" class="inputNumber" min="0" max="20" size="small" />
        </div>
        <NTooltip trigger="hover">
          <template #trigger>
            <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
          </template>
          数值越大消耗的token越多，上下文联系更加紧密。
        </NTooltip>
      </div>
      <div class="mb-4 flex items-center ">
        <span class="mr-2">话题新鲜度</span>
        <div style="width: 2%;" />
        <div class="flex items-center space-x-4">
          <NSlider v-model:value="cachedParams.presencePenalty" class="w-3/5" :step="0.1" min="-2" max="2" />
          <NInputNumber v-model:value="cachedParams.presencePenalty" class="inputNumber" :step="0.1" min="-2" max="2" size="small" />
        </div>
        <NTooltip trigger="hover">
          <template #trigger>
            <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
          </template>
          正、负值分别表示对新出现的单词进行惩罚、奖励，
          从而增加机器人重复相同话题的可能性。
        </NTooltip>
      </div>
      <div class="mb-4 flex items-center ">
        <span class="mr-2">话题精准度</span>
        <div style="width: 2%;" />
        <div class="flex items-center space-x-4">
          <NSlider v-model:value="cachedParams.temperature" class="w-3/5" :step="0.1" max="+2" />
          <NInputNumber v-model:value="cachedParams.temperature" step="0.1" class="inputNumber" min="0" max="+2" size="small" />
        </div>

        <NTooltip trigger="hover">
          <template #trigger>
            <SvgIcon icon="ri-question-fill" class="float-right icon-large" />
          </template>
          较高的值（如 0.8）将使输出更加随机，而较低的值（如 0.2）将使其更加集中和确定。
        </NTooltip>
      </div>
    </div>
    <div class="btn-container">
      <NButton type="tertiary" @click="resetSettings">
        重置
      </NButton>
      <NButton :loading="loading" type="primary" class="ml-2" @click="saveSettings">
        保存
      </NButton>
    </div>
  </NModal>
</template>

<style>
/* 调整NInput的宽度 */

  .inputNumber{
    width: 65% !important;
  }
  /* 调整NGradientText的样式 */
  .gradient-text {
    font-size: 2px !important; /* 调整字体大小 */
    color: #b1b1b1 !important; /* 淡灰白色 */
    width: 100%; /* 让内容自动换行 */
    word-wrap: break-word !important; /* 自动换行 */
    white-space: normal !important; /* 强制换行 */
    max-width: 43% !important;
  }
  /* 按钮容器样式 */
  .btn-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    margin-top: 16px; /* 上边距 */
  }

  /* 保存按钮的左边距 */
  .ml-2 {
    margin-left: 8px !important;
  }
</style>
