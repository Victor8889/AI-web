<script lang="ts" setup>
import 'element-plus/theme-chalk/index.css'
import { onMounted, ref, watch } from 'vue'
import { NDataTable, useMessage } from 'naive-ui'
import api from '../../../../api/api'
import { SvgIcon } from '@/components/index'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const ms = useMessage()
const { isMobile } = useBasicLayout()
const getImgClass = () => {
  return isMobile.value ? 'mobile-style' : 'pc-style'
}
const showPresent = ref(false)
const getUlClass = () => {
  return isMobile.value ? 'mobile-ul' : 'pc-ul'
}
function openJd() {
  window.open('https://3.cn/1NdBD-bL')
}
const activeName = ref('charges')

const present = ref([
  {
    id: 1, points: 50, amount: 5, name: '5元50积分', label: '全模块50积分',
  },
  {
    id: 2, points: 260, amount: 10, name: '10元260积分', label: '全模块260积分',
  },
  {
    id: 3, points: 525, amount: 20, name: '20元520积分', label: '全模块520积分',
  },
  {
    id: 4, points: 920, amount: 35, name: '35元920积分', label: '全模块920积分',
  },
  {
    id: 5, points: 1320, amount: 50, name: '50元1320积分', label: '全模块1320积分',
  },
  {
    id: 6, points: 2670, amount: 100, name: '100元2670积分', label: '全模块2670积分',
  },
  {
    id: 7, points: 27000, amount: 1000, name: '1000元27000积分', label: '全模块27000积分',
  },
  {
    id: 8, points: 54500, amount: 20000, name: '20000元54500积分', label: '全模块54500积分',
  },

])
const products = ref()
const vip = ref()
onMounted(() => {
  handleClick()
})
async function handleClick() {
  try {
    if (activeName.value === 'charges') {
      const result = await api.shops()
      if (result.message === 'OK')
        present.value = result.data
    }
    else if (activeName.value === 'pointsInfo') {
      const result = await api.products()
      if (result.message === 'OK') {
        // products.value = result.data
        products.value = result.data.map((product) => {
          product.name = product.name.replace('CHAT', 'WM-AI对话').replace('_1106', '')
          return product
        })
      }
    }
    else if (activeName.value === 'vipInfo') {
      const result = await api.vipPrice()
      if (result.message === 'OK')
        vip.value = result.data
    }
  }
  catch (error) {
    console.error(error)
  }
}
//
const qrUrl = ref('')
const orderId = ref('')
const id = ref('')
const name = ref('')
const amount = ref(0)
const formCode = ref('')
const centerDialogVisible = ref(false)

async function openQr(amount1: number, points: number, oldname: string) {
  if (true) {
    ms.warning('暂不支持微信支付，请使用支付宝付款')
    return
  }
  formCode.value = ''
  qrUrl.value = ''
  amount.value = amount1
  ms.info('正在计算优惠，若加载缓慢，请刷新后重试')
  const result = await api.getWXCodeUrl(amount1, points)
  if (result) {
    qrUrl.value = result.data.codeUrl
    orderId.value = result.data.orderId
    name.value = oldname
  }

  centerDialogVisible.value = true
}

let timer

// 定时任务定义与使用
const startTimer = (orderId: string, id: number, points: number) => {
  timer = setInterval(() => {
    // 调用需要传递参数的方法
    getStatus(orderId, id, points)
  }, 6000)
}

const stopTimer = () => {
  clearInterval(timer)
}
watch(centerDialogVisible, (newValue) => {
  if (!newValue)
    stopTimer()
})
const isVip = ref(false)
async function zfbFormQr(amount1: number, points: number, oldname: string) {
  formCode.value = ''
  qrUrl.value = ''
  amount.value = amount1
  isVip.value = true
  ms.info('正在计算优惠，若加载缓慢，请刷新后重试')
  if (!isMobile.value) {
    const result = await api.getZFBCodeUrl(amount1, points)
    if (result) {
      formCode.value = result.data.codeUrl
      orderId.value = result.data.orderId
      id.value = result.data.id
      name.value = oldname
      // console.log(formCode.value)
      centerDialogVisible.value = true
      startTimer(result.data.orderId, result.data.id, result.data.points)
    }
  }
  else {
    const result = await api.getZFBMobileCodeUrl(amount1, points)
    if (result)
      document.write(result.data.codeUrl)
    startTimer(result.data.orderId, result.data.id, result.data.points)
  }
}

async function zfbVipFormQr(amount1: number, points: number, oldname: string) {
  formCode.value = ''
  qrUrl.value = ''
  amount.value = amount1
  isVip.value = false
  ms.info('正在计算优惠，若加载缓慢，请刷新后重试')
  if (!isMobile.value) {
    const result = await api.getZFBVipCodeUrl(amount1, points)
    if (result) {
      formCode.value = result.data.codeUrl
      orderId.value = result.data.orderId
      id.value = result.data.id
      name.value = oldname
      // console.log(formCode.value)
      centerDialogVisible.value = true
      startTimer(result.data.orderId, result.data.id, result.data.points)
    }
  }
  else {
    const result = await api.getZFBVipMobileCodeUrl(amount1, points)
    if (result)
      document.write(result.data.codeUrl)
    startTimer(result.data.orderId, result.data.id, result.data.points)
  }
}

async function getStatus(orderId: string, id: number, points: number) {
  const result = await api.getAiStatus(orderId, id, 1, points)
  if (result.data) {
    centerDialogVisible.value = false
    stopTimer()
    ms.info('恭喜您支付成功，请继续使用')
  }
}

const productTitle = ref([
  { title: '类型', key: 'model' },
  { title: '模型|模块', key: 'showName' },
  { title: '普通用户消费', key: 'records' },
  { title: '会员消费', key: 'vipRecords' },

])
</script>

<template>
  <el-dialog v-model="showPresent" class="main main-dialog" title="赞助与兑换" :width="isMobile ? '90%' : '45%'" center @open="handleClick">
    <template #header="{ titleId }">
      <div>
        <el-button link @click="openJd">
          <div class="title-button">
            <h4 :id="titleId">
              <span class="title-button">爆款云主机 <span /></span>
              <span class="title-button">   1年低至<span class="charge">50</span>元</span>
            </h4>
          </div>
        </el-button>
      </div>
    </template>

    <el-tabs v-model="activeName" class="person-tabs" @tab-change="handleClick">
      <el-tab-pane label="账号充值" name="charges" :height="isMobile ? '90%' : '45%'" style="overflow-y: auto; height: 450px;">
        <div class="module-privilege mb-2" :class="getUlClass()" style="display: flex; flex-wrap: wrap; justify-content: center;align-items: center;">
          <ul
            v-for="item in present" :key="item.id" class="privilege-ul" style="width:80%;border: 1px solid white; display: flex; flex-direction: column; justify-content: center; align-items: center;
          box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 5px; margin: 5px; flex: 0 0 45%;"
          >
            <li class="first-item" style="padding: 5px; margin: 5px;">
              <div class="vip-type">
                <span class="vip-type-title">{{ item.name.replace("积分", "") }}&nbsp;</span><img style="width:16px;height:16px;display: inline;margin-bottom: 1px;" src="/img/zs.png" alt="">
              </div>
            </li>
            <li style="padding: 5px; margin: 5px;">
              {{ item.label.replace("积分", "") }}&nbsp;<img style="width:16px;height:16px;display: inline;margin-bottom: 2px;" src="/img/zs.png" alt="">
            </li>
            <li style="padding: 5px; margin: 5px; margin-top:3%">
              <el-button style="background-image: url('img/58_168_zfb.png');background-size: contain; background-repeat: no-repeat; width: 80px; height: 29px; " @click="zfbFormQr(item.amount, item.points, item.name)" />

              <!----><el-button style="background-image: url('img/WePayLogo.png');background-size: contain; background-position: center;background-repeat: no-repeat;width: 80px; height: 30px; " @click="openQr(item.amount, item.points, item.name)" />
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <el-tab-pane label="购买会员" name="vipInfo" :height="isMobile ? '80%' : '45%'" style="overflow-y: auto; height: 450px;">
        <div class="module-privilege mb-2" :class="getUlClass()" style="display: flex; flex-wrap: wrap; justify-content: center;align-items: center;">
          <ul
            v-for="item in vip" :key="item.id" class="privilege-ul" style="width:80%;border: 1px solid white; display: flex; flex-direction: column; justify-content: center; align-items: center;
          box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 5px; margin: 5px; flex: 0 0 45%;"
          >
            <li class="first-item" style="padding: 5px; margin: 5px;">
              <div class="vip-type">
                <SvgIcon class="svgicon" icon="ri-vip-line" />
              </div>
            </li>
            <li style="padding: 5px; margin: 5px;">
              {{ item.price }}元/{{ item.mark }}
            </li>
            <li style="padding: 5px; margin: 5px; margin-top:3%">
              <el-button style="background-image: url('img/58_168_zfb.png');background-size: contain; background-repeat: no-repeat; width: 80px; height: 29px; " @click="zfbVipFormQr(item.price, item.duration, `会员：${item.price}元/${item.mark}`)" />

              <el-button style="background-image: url('img/WePayLogo.png');background-size: contain; background-position: center;background-repeat: no-repeat;width: 80px; height: 30px; " @click="openQr(item.amount, item.points, item.name)" />
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <el-tab-pane label="商品说明" name="pointsInfo" :height="isMobile ? '80%' : '45%'" style="overflow-y: auto; height: 450px;">
        <div class="module-privilege mb-2" :class="getUlClass()" style="display: flex; flex-wrap: wrap; justify-content: left;align-items: center;">
          <div style="margin-left: 7%;">
            <span>
              *本系统商品为虚拟商品，售出不退不换。<br>
              <br>
              注意事项，必读！注意事项，必读！注意事项，必读！<br>
              本站主营产品：AI对话 / AI绘图 / AI思维导图<br>

              1.基础AI对话使用的训练数据截止到2021年9月，部分高级AI对话模型数据截止到2023年4月，系统支持3.5及4.0<br>
              2.VIP用户每月定期刷新200免费积分(<img style="width:16px;height:16px;display: inline;margin-bottom: 2px;" src="/img/zs.png" alt="">)(仅用于AI对话3.5-TURBO)，免费积分不叠加，购买积分永久有效<br>
              3.<span style="color:coral">本系统Midjourney出图方式有快速模式和松慢速模式</span><br>
              4.本系统不做生成式产品内容的版权保留，自己生成的产品版权归自己，自由合法使用！<br>
              5.请明确积分(<img style="width:16px;height:16px;display: inline;margin-bottom: 2px;" src="/img/zs.png" alt="">)的消耗方式！<br>
              6.会员仅需4元/月，会员价格相当优惠。<br>
              <br> 系统消耗积分说明(单位：<img style="width:16px;height:16px;display: inline;" src="/img/zs.png" alt="">/次)：<br>
              <div style="margin-top: 1.5%;">

                <NDataTable
                  :columns="productTitle"
                  :data="products"
                  height="590" style="max-width: 1850px;margin-top: 1%;min-height:50px;max-height: 1825px;overflow-y: scroll;"
                />
              </div>
              <br>
              <div style="margin-top: 2%;">更多AI工具敬请期待</div>
            </span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="友情赞助" name="userInfo" :height="isMobile ? '50%' : '45%'" style="overflow-y: auto; height: 450px;">
        <div :class="getImgClass()">
          <img src="/img/zanzhu.jpg" style="border-radius: 5px;width: 220px;height: 220px;margin-right: 10px;margin-bottom: 10px;" alt="谢谢">
          <span style="margin-right: 10px;margin-bottom: 10px;" :class="isMobile ? 'margin-top: 3%;' : 'margin-top: 13%;'">
            <br>祝您顺利。<br><span v-if="isMobile">下</span> <span v-else>右</span>边联系作者
          </span>
          <img src="/img/zuozhe.png" style="border-radius: 5px;width: 220px;height: 220px;margin-right: 10px;margin-top: 10px;" alt="谢谢">
        </div>
        <div
          style="border-radius: 5px;margin-top: 2%;
          background: linear-gradient(to right, #a8e6cf, #dcedc1, #ffd3b6, #ffaaa5, #ff8b94);"
        >
          <div class="module-privilege mb-2" :class="getUlClass()">
            <ul class="privilege-ul " style="width:80%;border: 1px ; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 10px; margin: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <li class=" first-item" style="padding: 5px; margin: 5px;">
                <div class="vip-type">
                  <SvgIcon class="svgicon" icon="ri-vip-line" />
                  <span class="vip-type-title">同源部署</span>
                </div>
              </li><li style="padding: 5px; margin: 5px;">
                同站点部署
              </li><li style="padding: 5px; margin: 5px;">
                ￥ ?
              </li>
            </ul>
            <div class="clearfix" />
            <ul
              class="privilege-ul " style="width:80%;border: 1px ; box-shadow: 0 0 10px rgba(0,0,0,0.1);
             padding: 10px; margin: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;"
            >
              <li class="first-item" style="padding: 5px; margin: 5px;">
                <div class="vip-type">
                  <SvgIcon class="svgicon" icon="ri-vip-crown-line" />
                  <span class="vip-type-title">全套站点</span>
                </div>
              </li><li style=" padding: 5px; margin: 5px;">
                全套源码，包部署
              </li><li style="padding: 5px; margin: 5px;">
                ￥ ?
              </li>
            </ul>
            <div class="clearfix" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div>
      <el-dialog v-model="centerDialogVisible" class="sun-dialog" center style="width: 320px; height: 380px; ">
        <el-button class="cancel-button" icon="el-icon-close" @click="centerDialogVisible = false">
          <i class="el-icon el-dialog__close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" /></svg></i>
        </el-button>
        <div
          style="align-content: center;"
        >
          <div class="sun-dialog" style="margin-top: 1%;align-items: center;">
            <span style="font-size: 25px; font-weight: 1000; color: rgb(32, 30, 30);">支付宝扫码</span>
          </div>
          <div style="margin-top: 5%;margin-left: 7%;">
            <iframe
              v-if="formCode.length > 0"
              :srcdoc="formCode"
              frameborder="no"
              border="0"
              marginwidth="0"
              marginheight="0"
              scrolling="no"
              width="200"
              height="200"
              style="overflow:hidden;"
            />
          </div>
          <div class="sun-dialog">
            <span style="font-weight: 600; font-size:small">价格：</span>
            <span style="color: rgb(255, 0, 0);">{{ amount }}元</span>
          </div>
          <img v-if="qrUrl.length > 0" :src="qrUrl" alt="支付码">
          <div class="sun-dialog" style="margin-top: 8%;font-size:small">
            <span style="font-weight: 600;">商品名称：</span>{{ name.replace("积分", "") }}&nbsp;<img v-if="isVip" style="width:16px;height:16px;display: inline;margin-bottom: 2px;" src="/img/zs.png" alt="">
          </div>
          <div class="sun-dialog" style="font-size:small">
            <span style="font-weight: 600;">订单号：</span>{{ orderId }}
          </div>
        </div>
      </el-dialog>
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
