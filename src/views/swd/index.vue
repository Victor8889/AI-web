<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import html2canvas from 'html2canvas'
import HeaderComponent from './components/Header/index.vue'
import { useSwdStore } from './components/apiTypes'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { HoverButton, SvgIcon } from '@/components/index'

const swdStore = useSwdStore()
const dialog = useDialog()

const swdData = computed(() => swdStore.swdData)
const ms = useMessage()

const { isMobile } = useBasicLayout()

const transformer = new Transformer()

const mm = ref()
const value = ref('')
// 修改：添加ref属性来绑定svgRef变量到SVG元素上
const svgRef = ref()
const update = () => {
  const { root } = transformer.transform(value.value)
  mm.value.setData(root)
  mm.value.fit()
}
const viewBox = ref('-60 -55 1380 750')
const viewBoxPhone = ref('0 25 350 530')

watch(() => value.value, (n) => {
  // 监听输入变化更新思维导图
  update()
})
onMounted(() => {
  // 初始化markmap思维导图
  // 修改：使用svgRef.value来获取SVG元素的引用，而不是svgRef本身
  mm.value = Markmap.create(svgRef.value)
  if (isMobile.value)
    value.value = '请先在左上角“三个杠”，输入内容点击按钮，即可生成思维导图。（下载图片时请先调整好思维导图的位置）'
  else
    value.value = '请先在左侧输入内容，然后点击按钮，即可生成思维导图。（下载图片时请先调整好思维导图的位置）'
  // value.value = swdData.value.aiInput// initValue // 修改：直接使用initValue，而不是initValue.value
  // 更新思维导图渲染
  update()
})
watch(swdData, (newValue) => {
  // mm.value = Markmap.create(svgRef.value)
  value.value = swdData.value[0].aiInput
})
const loading = ref<boolean>(false)
/**
 * @description: 保存会话到图片
 * @return {*}
 */
function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: '思维导图',
    content: '是否将 当前思维导图 保存为图片',
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'swdt-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('导出成功'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}
const footerClass = computed(() => {
  let classes = ['p-0']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
    />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div

          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <!-- 消息列表 -->
          <div id="image-wrapper" class="mb-2 h-full svg-wrapper">
            <svg ref="svgRef" style="width:100%;height: 100%;" :viewBox="isMobile ? viewBoxPhone : viewBox" />
          </div>
          <div :class="footerClass" style="margin-top: -1%;">
            <HoverButton v-if="!isMobile" tooltip="保存为图片" @click="handleExport">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="ri:download-2-line" />
              </span>
            </HoverButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
  body {
    background-image: none !important;
  }

  .svg-wrapper {
    border: 1px dashed  rgb(136, 136, 136);
    border-radius: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width:100% ;
    height: 95% !important;
    align-items: center;
  }
</style>
