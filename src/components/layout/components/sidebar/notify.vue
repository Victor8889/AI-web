<script lang="ts" setup>
import 'element-plus/theme-chalk/index.css'
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../../../../api/api'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const ms = useMessage()
const { isMobile } = useBasicLayout()
const showNotify = ref(false)
const getUlClass = () => {
  return isMobile.value ? 'mobile-ul' : 'pc-ul'
}

const notices = ref({
  title: '',
  content: '',
  date: '',
})
const noticesList = ref([])

const title = ref('soun音乐支持')
const activeName = ref('重要更新：支持suno音乐生成，请前往“助手聊天”模块选择sono-v3使用')
const date = ref('20240328')
const activeName2 = ref('charges')

const products = ref()
const vip = ref()
onMounted(() => {
  handleClick()
})

async function handleClick() {
  try {
    const result = await api.notice()
    if (result.message === 'OK') {
      noticesList.value = result.data
      notices.value.title = result.data?.title
      notices.value.content = result.data?.content
      notices.value.date = result.data?.date.split(' ')[0]
    }
  }
  catch (error) {
    // console.error(error)
  }
}
</script>

<template>
  <el-dialog
    v-model="showNotify" class="main main-dialog" title="公告" :width="isMobile ? '90%' : '35%'"
    :height="isMobile ? '235px' : '235px'" center @open="handleClick"
  >
    <template #header="{ titleId }">
      <div>
        <el-button link>
          <div class="title-button">
            <h4 :id="titleId">
              <span class="title-button">WM-AI 公告 <span /></span>
              <!-- <span class="title-button">   1年低至<span class="charge">50</span>元</span>  @click="openJd" -->
            </h4>
          </div>
        </el-button>
      </div>
    </template>
    <div style="height: 300px;overflow: auto;">
      <div v-for="(temp, index) in noticesList" :key="index">
        <div class="pc-style">
          <span>{{ temp?.title }}</span>
        </div>
        {{ temp?.content }}
        <div><span style="font-size: smaller;">{{ temp?.createTime?.split(' ')[0] }}</span></div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="css">
el-dialog__body{
  margin-top: 0px ;
}
.person-tabs {
  padding: 5x;
}
.mobile-style{
  display: flex; align-items: center; flex-direction: column;
}
.pc-style{
  display: flex;
  justify-content: center;
}
.mobile-ul{
display: flex; flex-direction: column; align-items: center;
}
.pc-ul{
  display: flex; justify-content: space-around; align-items: center;
}
.privilege-ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
  border-radius: 5px;
  }

  .vip-type {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .svgicon {
    background-color: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
  }

  .clearfix {
    clear: both;
  }
.title-button{
  font-size: 26px;
  color: aliceblue;
}
.charge{
  font-size: 35px;
}
.main-dialog .el-dialog__header{
  background-image: url('/img/red3.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
}
.sun-dialog .el-dialog__header{
  display: none;
}
.sun-dialog .el-dialog__body{

  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}
.sun-dialog {

display: flex !important;
justify-content: center !important;
align-items: center !important;
}
.cancel-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 10px;
  border: none !important;
}
.el-icon {
  right: 9px;
}
</style>
