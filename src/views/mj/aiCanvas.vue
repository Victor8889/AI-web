<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// import { CavansDemo } from "@/views/aidutu";
const pp = defineProps<{ chat?: Chat.ChatMj;base64: string }>()
const emits = defineEmits(['success'])
const st = ref({ q: '', imgUrl: '' })
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
  // iframe.contentWindow && iframe.contentWindow.postMessage( JSON.stringify({act:'del',obj }), '*');
  const data = {
    instance_id: '1', // 固定值
    custom_id: '2', // 固定值
    channel_id: '3', // 固定值
    guild_id: '4', // 固定值
    frame_id: '5', // 固定值
    platform: 'desktop', // 固定值
    prompt: pp.chat?.text, // pp.chat?.text, // 按实际传入
    img_type: 'png', // 按实际传入
    // ,img_info:''
    img_info: JSON.stringify({ image_url: '', prompt: 'sunglasses' }), // 按实际传入
  }
  st.value.q = Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&')
  window.addEventListener('message', messageFun)
})

onUnmounted(() => {
  window.removeEventListener('message', messageFun)
})

const loadOk = (e: Event) => {
  // console.log('loadOk','good news' );
  const iframe = e.target as HTMLIFrameElement
  iframe.contentWindow && iframe.contentWindow.postMessage(JSON.stringify({ act: 'go', img_info: { image_url: pp.base64 === '' ? pp.chat?.opt?.imageUrl : pp.base64, prompt: '' } }), '*')// pp.chat?.text
}
// const iframeSrc = `/draw/mitf/index.html?${st.value.q}`
// :src="iframeSrc"
</script>

<template>
  <iframe
    v-if="st.q" ref="ifdiv" :src="`https://static.aitutu.cc/res/mitf/index.html?${st.q}`"
    class=" h-[80vh] w-full" style="border-width: 0px; border-style: none; overflow: hidden;" @load="loadOk"
  />
</template>
