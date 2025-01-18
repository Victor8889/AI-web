<!--
 * @Author: mjjh
 * @LastEditTime: 2023-04-16 19:55:29
 * @FilePath: \chagpt-shuowen\src\views\chat\index.vue
 * @Description: chat页面index.vue
-->
<script setup lang='ts'>
import { NTabPane, NTabs } from 'naive-ui'
import MjRelax from './indexMjRelax.vue'
import MjBlend from './indexMjBlend.vue'
import MjFace from './indexMjFace.vue'
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    <main class="flex-1 ">
      <NTabs type="segment" animated>
        <NTabPane name="chap2" tab="普通MJ">
          <MjRelax :my-prop="2" />
        </NTabPane>
        <NTabPane name="chap1" tab="快速MJ">
          <MjRelax :my-prop="1" />
        </NTabPane>
        <NTabPane name="chap4" tab="普通混图">
          <MjBlend :my-prop="2" />
        </NTabPane>
        <NTabPane name="chap3" tab="快速混图">
          <MjBlend :my-prop="1" />
        </NTabPane>
        <NTabPane name="chap5" tab="快速换脸">
          <MjFace :my-prop="1" />
        </NTabPane>
        <!--
        <NTabPane name="chap6" tab="普通换脸">
          <MjFace :my-prop="2" />
        </NTabPane> -->
      </NTabs>
    </main>
  </div>
</template>

<style>
body {
  background-image: none !important;
}
.image-wrapper {
  padding: 0 !important; /* 设置内边距为 0 */
  margin: 0 !important; /* 设置外边距为 0 */
}
.light-green {
  height: 308px;
  width: 100%;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 308px;
  background-color: rgba(0, 128, 0, 0.24);
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0px;
}
.box {
  min-width: 225PX;
  /* min-height: 200px; */
  max-width: 390px;
  /* max-height: 450px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}
/* //425 */
.task-box {
  min-width: 360px;
  min-height: 200px;
  max-width: 420px;
  /* max-height: 500px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}
.pc-box{
  align-self: flex-start;
  min-width: 345px;
  min-height: 200px;
  max-width: 345px;
  /* max-height: 500px; */
  border: 1px solid #8d8d8d3e;
  display: flex;
  flex-direction: column;
  margin: 0.3%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.4rem ;
}

.mjCenter {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
}

button {
  padding: 5px 10px;
}

.pic-button{
  width: 35%;
  margin-left: 6px;
}
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.rotate-animation {
  animation-name: rotate;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
}
.n-tooltip {
  width: 300px; /* 设置固定宽度 */
}
</style>
