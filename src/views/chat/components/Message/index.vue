<!--
  * @Author: lk
  * @LastEditTime: 2023-04-09 14:21:25
  * @FilePath: \wm-ai\src\views\chat\components\Message\index.vue
  * @Description: 移动端消息组件
 -->
<script setup lang='ts'>
import { nextTick, ref } from 'vue'
import { useMessage } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/index'
import { copyText } from '@/utils/format'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const ms = useMessage()
interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  modelName?: string
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>()

function handleDelete() {
  emit('delete')
}

// 拷贝按钮点击事件
function handleCopy() {
  copyText({ text: props.text ?? '' })
  ms.info('拷贝成功')
}
async function handleRegenerate() {
  await nextTick()
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}&nbsp;{{ modelName }}
      </p>
      <div
        class="flex items-end gap-1 mt-1"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :as-raw-text="asRawText"
          class="mb-n1"
        />
        <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-0.5 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <!-- 拷贝按钮移动到这里 -->
          <button
            class="mb-0.5 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleCopy"
          >
            <SvgIcon icon="ri:file-copy-2-line" />
          </button>
          <!-- 删除按钮移动到这里 -->
          <button
            class="mb-0.5 mt-0.1 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleDelete"
          >
            <SvgIcon icon="ri:delete-bin-line" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
