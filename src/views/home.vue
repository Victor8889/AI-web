<script lang="ts" setup>
import 'element-plus/theme-chalk/index.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NModal, useMessage } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore, vuexStore } from '@/store'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)
const store = vuexStore
const message = useMessage()
// 移动端自适应相关
const { isMobile } = useBasicLayout()
const images = [
  '/img/center01.jpg',
  '/img/center2.jpg',
  '/img/center3.jpg',
  // 添加更多图片路径
]
const currentIndex = ref(0)

const interval = 2000 // 每张图片展示的间隔时间（单位：毫秒）

let timer: any // 定时器

// 切换到下一张图片
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

// 获取当前展示的图片路径
const currentImage = ref(images[currentIndex.value])

// 监听索引变化，更新当前图片路径
watch(currentIndex, () => {
  currentImage.value = images[currentIndex.value]
})

// 定时切换图片
const startCarousel = () => {
  timer = setInterval(nextImage, interval)
}

// 停止定时器
const stopCarousel = () => {
  clearInterval(timer)
}

onMounted(() => {
  startCarousel() // 页面加载完成后开始自动轮播
  store.commit('setActiveMenu', 'home')
})

onUnmounted(() => {
  stopCarousel() // 页面卸载时停止自动轮播
})
const showPopup = ref(false)
function openJc() {
  showPopup.value = true
}

function openJd() {
  window.open('https://api.openxs.top')
}
// 点击跳转
const router = useRouter()
function routerView(view) {
  if (view === 'other') {
    message.info('敬请期待...')
    return
  }
  else { router.push({ name: view }) }
  // if (view === 'Chat')
  //   view = 'gpt'
  store.commit('setActiveMenu', view)
  sessionStorage.setItem('activeMobileMenu', view)
  const data = '[{"menuId":"gpt","menuName":"助手聊天","path":"Chat","children":[]}]'
  sessionStorage.setItem('BREADCRUMB', JSON.stringify(data))
}

const currentIndex1 = ref(0)
const items2 = [
  {
    title: '对话',
    description: 'AI 3.5、AI 4.0、文心一言、讯飞星火等智能机器人,有趣的对话，碰撞火花。',
    things: '写作，学英语，学技术、查资料、起名字，想方法，出主意，做规划，样样精通。更多精彩等你发现',
    background: 'url(/img/me.jpg)',
  },
  {
    title: '绘画',
    description: 'Midjourney、DALL-E等绘画工具，充满无限创意与惊喜，画你所想，试试画一个梦境',
    things: 'AI制图工具，只要关键字，就能透过AI算法生成相对应的图片、一句话画出你的梦想之人/物/景、海报设计',
    background: 'url(/img/OIG.jpg)',
  },
  {
    title: '思维导图',
    description: '更加简便，输入想法即得思想火花，思维导图调理更加清晰。',
    background: 'url(/img/center3.jpg)',
  },
  {
    title: '更多AI',
    description: 'AI艺术二维码、照片处理等，更多AI敬请期待...',
    background: 'url(/img/center3.jpg)',
  },
]

onMounted(() => {
  setInterval(() => {
    currentIndex1.value = (currentIndex1.value + 1) % items2.length
  }, 5000)
})
</script>

<template>
  <main class="flex-1 mx-auto overflow-y-auto semi-layout-content" style="overflow-x: hidden;">
    <div class="bg-white dark:bg-black">
      <main class="isolate">
        <div v-if="isMobile" style="float: right;margin-top: 5%;position: relative;z-index: 2;">
          <el-button @click="openJc">
            使用教程
          </el-button>

          <!-- <div v-if="showPopup" class="popup"> -->
          <NModal v-model:show="showPopup" style="width: 95%; height: 10%" preset="card" title="使用教程">
            <div class="bg-white rounded dark:bg-slate-800">
              <div class="space-y-4">
                <iframe src="https://kdocs.cn/l/cjLxocttgC21" style="width: 100%;height: 566px; max-height: 1248px;overflow: auto;" />

                <!-- <NTabs v-model="activeTab" size="large">
                  <NTabPane name="all" label="概览">
                    <Guide />
                  </NTabPane>
                  <NTabPane name="chat" label="AI聊天">
                    <Gtp />
                  </NTabPane>
                  <NTabPane name="pho" label="AI绘图">
                    <Mj />
                  </NTabPane>
                  <NTabPane name="swd" label="AI思维导图">
                    <Swd />
                  </NTabPane>
                  <NTabPane name="qr" label="AI艺术二维码">
                    <Qr />
                  </NTabPane>
                </NTabs> -->
              </div>
            </div>
          </NModal>
        </div>
        <div class="relative pt-14">
          <div style="display: flex;">
            <div v-if="!isMobile" style="flex: 1;  padding: 10px;margin-left: 6%;">
              <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                WM-AI
              </h1><br>
              <p class="text-lg leading-8 text-gray-600 dark:text-white">
                领先的AI工具，助力您的工作/学习/创作<br>实现您天马行空的想象力<br>
                支持多种风格，让您更加轻松，创作更加丰富
              </p>
            </div>
            <div v-if="!isMobile" style="flex: 1;  padding: 10px; ">
              <div class="carousel" style="height: auto;">
                <img :src="currentImage" alt="WM-AI">
              </div>
            </div>
            <div style="flex: 1;  padding: 10px;margin-right: 5%;">
              <div style="display: flex; align-items: center;">
                <div style="flex: 1;  margin-right: 5%;">
                  <div class="gg-div" :style="{ width: !isMobile ? '200px' : '100%', marginLeft: !isMobile ? '0' : '5%' }" @click="openJd">
                    <div style="margin-top: 3%;display: flex; flex-direction: column;">
                      <div style="display: flex; justify-content: center; align-items: center; ">
                        <p style="margin-top: 3%;" class="text-2xl leading-5 text-gray-800 dark:text-white">
                          <span style="font-weight: bold; color: coral;">&nbsp;&nbsp;云智API</span><br>
                        </p><br>
                      </div>
                      <div style="margin-top: 15px; color:slateblue">
                        <p class=" leading-5 text-gray-800 dark:text-white">
                          <span style="font-size: large;color:slateblue">官key-直连-无猫腻</span>
                        </p>
                        <p class=" leading-7 text-gray-800 dark:text-white">
                          <span style="font-size: large;color:slateblue">稳-快-高并发</span>
                        </p>
                        <p class=" leading-5 text-gray-800 dark:text-white">
                          <span style="font-size: large;color:slateblue">注册赠送体验额度</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!isMobile" style="flex: 1;  margin-right: 5%;margin-left: 1%;">
                  <div class="custom-div" style="dark:rgb(129, 129, 129)">
                    <div style="display: flex; flex-direction: column;">
                      <p class="text-2xl leading-10 text-gray-800 " style="dark:rgb(129, 129, 129)">
                        使用教程
                      </p><br>
                      <el-button @click="showPopup = true">
                        <i class="el-icon el-dialog__close">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM10.6219 8.41459L15.5008 11.6672C15.6846 11.7897 15.7343 12.0381 15.6117 12.2219C15.5824 12.2658 15.5447 12.3035 15.5008 12.3328L10.6219 15.5854C10.4381 15.708 10.1897 15.6583 10.0672 15.4745C10.0234 15.4088 10 15.3316 10 15.2526V8.74741C10 8.52649 10.1791 8.34741 10.4 8.34741C10.479 8.34741 10.5562 8.37078 10.6219 8.41459Z" fill="currentColor" /></svg></i>

                        点击查看
                      </el-button>
                    </div>
                    <!-- <div v-if="showPopup" class="popup"> -->
                    <NModal v-model:show="showPopup" style="width: 100%; max-width: 1248px" preset="card">
                      <div class="bg-white rounded dark:bg-slate-800">
                        <div class="space-y-4" />
                        <iframe src="https://kdocs.cn/l/cjLxocttgC21" style="width: 100%;height: 566px; max-height: 1248px;overflow: auto;" />
                      </div>
                    </NModal>
                    <!-- <button @click="showPopup = false">
                        关闭
                      </button>
                      <Guide />
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);" />
          </div>
          <div style="margin-top: 5%;">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
              <div class="mx-auto max-w-2xl text-center">
                <div v-if="needPermission" style="margin-bottom:2%">
                  <a href="#/login" style="color:rgb(59, 45, 250)">登录/注册</a>
                </div>
                <div class="semi-space semi-space-align-center semi-space-vertical" x-semi-prop="children" style="gap: 10px;">
                  <p class="text-2xl leading-8 text-gray-800 dark:text-white">
                    即刻开始
                  </p>
                </div>
              </div>
              <div class="mt-6 flex items-center justify-center">
                <div style="display: flex; justify-content: space-between;">
                  <div style="flex: 1;  padding: 8px;">
                    <i class="ri-chat-smile-2-line" />
                    <el-button dark="true" @click="routerView('Chat')">
                      <i class="el-icon el-dialog__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM11 10H13V12H11V10ZM7 10H9V12H7V10ZM15 10H17V12H15V10Z" fill="currentColor" /></svg></i>
                      AI对话
                    </el-button>
                  </div>
                  <div style="flex: 1;  padding: 8px;">
                    <el-button @click="routerView('mj')">
                      <i class="el-icon el-dialog__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4565 9.67503L15.3144 9.53297C14.6661 8.90796 13.8549 8.43369 12.9235 8.18412C10.0168 7.40527 7.22541 9.05273 6.43185 12.0143C6.38901 12.1742 6.36574 12.3537 6.3285 12.8051C6.17423 14.6752 5.73449 16.0697 4.5286 17.4842C6.78847 18.3727 9.46572 18.9986 11.5016 18.9986C13.9702 18.9986 16.1644 17.3394 16.8126 14.9202C17.3306 12.9869 16.7513 11.0181 15.4565 9.67503ZM13.2886 6.21301L18.2278 2.37142C18.6259 2.0618 19.1922 2.09706 19.5488 2.45367L22.543 5.44787C22.8997 5.80448 22.9349 6.37082 22.6253 6.76891L18.7847 11.7068C19.0778 12.8951 19.0836 14.1721 18.7444 15.4379C17.8463 18.7897 14.8142 20.9986 11.5016 20.9986C8 20.9986 3.5 19.4967 1 17.9967C4.97978 14.9967 4.04722 13.1865 4.5 11.4967C5.55843 7.54658 9.34224 5.23935 13.2886 6.21301ZM16.7015 8.09161C16.7673 8.15506 16.8319 8.21964 16.8952 8.28533L18.0297 9.41984L20.5046 6.23786L18.7589 4.4921L15.5769 6.96698L16.7015 8.09161Z" fill="currentColor" /></svg></i>
                      AI绘画
                    </el-button>
                  </div>
                  <div style="flex: 1;  padding: 8px;">
                    <el-button @click="routerView('swd')">
                      <i class="el-icon el-dialog__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15C13.6941 9 12.5831 8.16562 12.171 7.0009L11 7C9.9 7 9 7.9 9 9L9.0009 9.17102C10.1656 9.58312 11 10.6941 11 12C11 13.3059 10.1656 14.4169 9.0009 14.829L9 15C9 16.1 9.9 17 11 17L12.1707 17.0001C12.5825 15.8349 13.6937 15 15 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21H15C13.6941 21 12.5831 20.1656 12.171 19.0009L11 19C8.79 19 7 17.21 7 15H5C3.34315 15 2 13.6569 2 12C2 10.3431 3.34315 9 5 9H7C7 6.79086 8.79086 5 11 5L12.1707 5.00009C12.5825 3.83485 13.6937 3 15 3H18ZM18 17H15C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19H18C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17ZM8 11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H8C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11ZM18 5H15C14.4477 5 14 5.44772 14 6C14 6.55228 14.4477 7 15 7H18C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" fill="currentColor" /></svg></i>
                      AI思维导图
                    </el-button>
                  </div>
                  <div v-if="!isMobile" style="flex: 1;  padding: 8px;">
                    <el-button @click="routerView('other')">
                      <i class="el-icon el-dialog__close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 4C11.6487 4 12.2498 4.20569 12.7411 4.55646C11.4486 5.22914 10.2602 6.07623 8.99996 6.80385L9.99996 8.5359C11.575 7.62654 13.0517 6.48541 14.7608 5.83037C16.1134 5.31198 17.681 5.83976 18.4282 7.13398C18.7526 7.69582 18.8749 8.31917 18.8168 8.92006C17.588 8.13708 16.2602 7.53146 15 6.80385L14 8.5359C15.575 9.44525 17.3016 10.1536 18.7234 11.3061C19.8487 12.2183 20.1754 13.8398 19.4282 15.134C19.1037 15.696 18.6249 16.1137 18.0752 16.3638C18.1385 14.9081 18 13.4553 18 12H16C16 13.8184 16.2498 15.6685 15.9626 17.4758C15.7353 18.9063 14.4944 20 13 20C12.351 20 11.7498 19.7942 11.2584 19.4432C12.5508 18.7701 13.7396 17.9238 15 17.1962L14 15.4641C12.4252 16.3733 10.9478 17.5147 9.23912 18.1696C7.88657 18.688 6.31898 18.1602 5.57176 16.866C5.24729 16.304 5.12493 15.6805 5.18316 15.0794C6.41224 15.8621 7.73964 16.4685 8.99997 17.1962L9.99997 15.4641C8.42517 14.5549 6.69801 13.8462 5.27649 12.6939C4.15128 11.7817 3.82455 10.1602 4.57176 8.86602C4.89624 8.30402 5.37506 7.88628 5.9247 7.63618C5.86145 9.09192 5.99997 10.5447 5.99997 12H7.99997C7.99997 10.1816 7.75013 8.33148 8.03733 6.52422C8.26467 5.09369 9.50554 4 11 4ZM14.7925 3.74171C13.8765 2.67659 12.5176 2 11 2C8.7782 2 6.89621 3.44833 6.24435 5.45243C4.86393 5.71314 3.59851 6.55175 2.83971 7.86602C1.72883 9.79013 2.04213 12.1442 3.4518 13.7107C2.98737 15.0366 3.08092 16.5518 3.83971 17.866C4.95059 19.7901 7.14589 20.6958 9.20742 20.2583C10.1234 21.3234 11.4824 22 13 22C15.2217 22 17.1037 20.5517 17.7556 18.5476C19.136 18.2869 20.4014 17.4482 21.1602 16.134C22.2711 14.2099 21.9578 11.8559 20.5481 10.2893C21.0126 8.96345 20.919 7.44825 20.1602 6.13398C19.0493 4.20987 16.854 3.30419 14.7925 3.74171Z" fill="currentColor" /></svg></i>
                      更多AI
                    </el-button>
                  </div>
                </div>
              </div>

              <div v-if="isMobile" style="display: flex; align-items: center; justify-content: center;padding: 8px;">
                <span style="color:rgb(119, 119, 119)">更多AI,敬请期待...</span>
              </div>
              <div class=" flow-root sm:mt-10">
                <div>
                  <div class="semi-carousel-content-slide semi-carousel-content" x-semi-prop="children">
                    <div class="carousel-container">
                      <div v-for="(item, index) in items2" :key="index" class="carousel-item" :class="{ active: currentIndex1 === index }">
                        <!-- :style="{ backgroundImage: item.background }" -->
                        <div class="carousel-item-content">
                          <h2>{{ item.title }}</h2>
                          <p>{{ item.description }}</p>
                          <p>{{ item.things }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.el-table  {
  background-color: transparent;
}
.day-theme {

  background-color: #f9f9f9;
  padding: 22px;
  font-size: 14px;
  color: #333333;
}

.night-theme {
  background-color: #000000;  // 夜晚背景色
  padding: 22px;
  font-size: 14px;
  color: #f6f6f6;  // 夜晚字的颜色
}
.day-theme .el-input__inner {
  background-color: #ffffff;
  color: #333333;
  // 其他白天样式...
}

.night-theme .el-input__inner {
  background-color: #000000;
  color: #f6f6f6;
  // 其他夜晚样式...
}

.dayTheme {
  background-color: #ffffff;
  color: #333333;
  // 其他白天样式...
}

.nightTheme .el-input__inner{
  background-color: #000000;
  color: #f6f6f6;
  // 其他夜晚样式...
}

.day-el-tabs__item {
  color: #333333;  // 白天标签的颜色
}
.night-el-tabs__item {
  color: #ffffff;
}
.night-theme .night-el-tabs__item.is-top.is-active,
.day-theme .day-el-tabs__item.is-top.is-active {
  color: red;
}
.carousel {
  max-width: 100%;
  overflow: hidden;
  border-radius: 10px; /* 添加圆角属性 */
}

.carousel img {
  width: 100%;
  height: auto;
  border-radius: 10px; /* 添加圆角属性 */
  height: 13em;
}

.custom-div {
  width: 200px;
  height: 13em;
  border-radius: 10px;
  box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image:url('/img/jc.jpg');
}

.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
}
.gg-div{
  width: 200px;
  height: 13em;
  border-radius: 10px;
  box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  background-image:url('/img/api.png');
  background-size: 30% ;
background-repeat: no-repeat;
background-position: left top;
}
.carousel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  border: 1px dashed #8f8e8e;
  border-radius: 10px;
}

.carousel-item {
  display: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.5s;
}

.carousel-item.active {
  display: block;
  opacity: 1;
}

.carousel-item-content {
  text-align: center;
  color: #7e7e7e;
  padding: 20px;
}

.carousel-item-content h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.carousel-item-content p {
  font-size: 16px;
}
.bg-1 {
  background-size: cover;
  background-image: url("https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-1.png");
  transition-timing-function: ease;
  transition-duration: 300ms;
  animation-timing-function: ease;
  animation-duration: 300ms;
}

.bg-2 {
  background-size: cover;
  background-image: url("https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png");
  transition-timing-function: ease;
  transition-duration: 300ms;
  animation-timing-function: ease;
  animation-duration: 300ms;
}

.bg-3 {
  background-size: cover;
  background-image: url("https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png");
  transition-timing-function: ease;
  transition-duration: 300ms;
  animation-timing-function: ease;
  animation-duration: 300ms;
}
</style>
