<!--
 * @Author: lk
 * @LastEditTime: 2023-04-09 14:23:52
 * @FilePath: \wm-ai\src\views\chat\components\Message\Text.vue
 * @Description: 消息组件
-->
<script lang="ts" setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { NImage } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  asRawText?: boolean
  isImg?: boolean
}

const props = defineProps<Props>()

const { isMobile } = useBasicLayout()

const textRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'px-3 py-2',
    props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
    props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
    props.inversion ? 'message-request' : 'message-reply',
    { 'text-red-500': props.error },
  ]
})

const text = computed(() => {
  let value = props.text ?? ''
  if (props.inversion)
    value = processImages(value)
  // value = processCharge(value)
  if (!props.asRawText)
    return mdi.render(value)
  return value
})
const imageRegex = /(https?:\/\/.*?\.(?:png|jpg|gif|image|jpeg))/gi
const isZoomed = ref(false)
const imageUrl = ref('')
const processText = ref(false)
// 处理图片链接的函数
function processImages(text: string) {
  // const textWithImages = text.replace(imageRegex, '$1<img src="$1" class="message-image" alt="" />')
  let textWithImages = text// .replace('<img ', '<NImage ')
  const matches = text.match(imageRegex)
  if (matches) {
    matches.forEach((url) => {
      processText.value = true
      textWithImages = textWithImages.replace(url, `${url}<img src="${url}" class="message-image" alt="" />`)
    })
  }
  return textWithImages
}
// 处理充值按钮
function processCharge(text: string) {
  const textWithImages = text.replace('积分不足，请先充值', '积分不足，请先<a href="#/login">充值</a>')
  return textWithImages
}
function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

defineExpose({ textRef })
// 检测内容中是否有图片链接
</script>

<template>
  <div class="text-black" :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words allImg">
      <div v-if="!inversion" class="flex items-end">
        <div v-if="!asRawText" class="w-full markdown-body" v-html="text" />
        <div v-else class="w-full whitespace-pre-wrap" v-text="text" />
        <span v-if="loading" class="dark:text-white w-[4px] h-[20px] block animate-blink" />
      </div>
      <div v-else>
        <div v-if="processText" class="whitespace-pre-wrap" v-html="text" />
        <div v-else class="whitespace-pre-wrap" v-text="text" />
      </div>
    </div>
  </div>
  <div v-if="isZoomed" class="zoomed-container">
    <NImage :src="imageUrl" class="zoomed-image" alt="Zoomed Image" />
  </div>

  <div class="image-url">
    {{ imageUrl }}
  </div>
</template>

<style lang="less">
@import url(./style.less);

.allImg img{
  width:300px;
}
</style>
