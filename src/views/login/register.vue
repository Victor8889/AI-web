<script lang='ts' setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton, NInput, useDialog, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { RegisterType, getPicCode, registerEmail, verifyEode } from '@/api/register'
import type { getPicCodeType, registerModel } from '@/api/register'

const ms = useMessage()
const loading = ref(false)
const router = useRouter() // 导入路由对象
const dialog = useDialog()
const userInfo = ref({
  email: '',
  password: '',
  emailEode: '',
  captcha: '',
  inviteCode: '',
})
// const authStore = useAuthStore()
// 验证码数据
const picData = ref<getPicCodeType>({
  picCodeBase64: '',
  // 图形验证码会话ID，注册时需要传过来
  picCodeSessionId: '',
})
const images = [
  'img/OIG2.jpg',
  'img/OIG3.jpg',
  'img/OIG.jpg',
]

const currentIndex = ref(0)

const changeImage = (index) => {
  currentIndex.value = index
}

const isButtonDisabled = computed(() => {
  const { email, password, emailEode, captcha } = userInfo
  return !email || !password || !emailEode || !captcha
})
const timer = ref(null)

onMounted(() => {
  getPicData()
  // 图片轮播的定时切换
  timer.value = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 5000)
})

// 添加生命周期钩子函数，在组件销毁前清除定时器
onBeforeUnmount(() => {
  clearInterval(timer.value)
})
const issuccess = ref(false)
// 注册按钮点击事件处理
async function handleVerify() {
  // 校验表单数据
  if (validateForm())
    await registerUser()

  // else ms.error('请正确填写输入框中的内容')
}
async function verifyEodeButton() {
  try {
    loading.value = true
    if (verifyValidateForm()) {
      const result = await verifyEode(userInfo.value.email, userInfo.value.emailEode, userInfo.value.inviteCode)
      if (result.data) {
        ms.info('恭喜注册成功，请登录')
        router.push('/login')
      }
    }
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
  }
}
function verifyValidateForm() {
  const regMobile = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  const phoneReg = /^1\d{10}$/// 手机号正则表达式
  if (!userInfo.value.email) {
    ms.error('请输入 手机号')
    return false
  }
  else if (!regMobile.test(userInfo.value.email) && !phoneReg.test(userInfo.value.email)) {
    ms.error('请输出正确格式的 手机号')
    return false
  }
  if (!userInfo.value.password) {
    ms.error('请输入密码')
    return false
  }

  if (!userInfo.value.captcha) {
    ms.error('请输入验证码')
    return false
  }
  const regCaptcha = /^[a-zA-Z0-9]{6}$/
  if (!regCaptcha.test(userInfo.value.captcha)) {
    ms.error('请输入六位验证码')
    return false
  }
  if (!userInfo.value.emailEode) {
    ms.error('请输入 手机 验证码')
    return false
  }

  return true
}
// 校验表单数据
function validateForm() {
  // const regMobile = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  const phoneReg = /^1\d{10}$/// 手机号正则表达式
  if (!userInfo.value.email) {
    ms.error('请输入 手机号')
    return false
  }
  else if (!phoneReg.test(userInfo.value.email)) { // !regMobile.test(userInfo.value.email) &&
    ms.error('请输出正确格式的 手机号')
    return false
  }
  if (!userInfo.value.password) {
    ms.error('请输入密码')
    return false
  }

  if (!userInfo.value.captcha) {
    ms.error('请输入验证码')
    return false
  }

  const regCaptcha = /^[a-zA-Z0-9]{6}$/
  if (!regCaptcha.test(userInfo.value.captcha)) {
    ms.error('请输入六位验证码')
    return false
  }

  return true
}
// 注册用户
async function registerUser() {
  const pushData: registerModel = {
    identity: userInfo.value.email,
    password: userInfo.value.password,
    picCodeSessionId: picData.value.picCodeSessionId,
    picVerificationCode: userInfo.value.captcha,
    registerType: RegisterType.Email,
  }

  try {
    const result = await registerEmail(pushData)
    if (result.data) {
      issuccess.value = true
      getEncode()
    }
    dialog.success({
      title: '验证码发送成功',
      content: `请到 ${userInfo.value.email} 查看验证码`,
      maskClosable: false,
      closable: false,
      positiveText: '确定',
      // onPositiveClick: () => {
      //   window.location.href = '/login'
      // },
    })
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
  }
}
// 监听键盘Enter事件
const handlePress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    verifyEodeButton()
  }
}

// 获取验证码数据
const getPicData = async () => {
  try {
    const { data } = await getPicCode()
    picData.value.picCodeBase64 = `data:image/png;base64,${data?.picCodeBase64}`
    picData.value.picCodeSessionId = data?.picCodeSessionId
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
}
const countdown = ref(0)
function getEncode() {
  if (issuccess.value && countdown.value <= 0)
    countdown.value = 30
  localStorage.setItem('countdown', countdown.value.toString())
  const timer = setInterval(() => {
    countdown.value--
    localStorage.setItem('countdown', countdown.value.toString())
    if (countdown.value <= 0) {
      clearInterval(timer)
      localStorage.removeItem('countdown')
    }
  }, 1000)
}

onMounted(() => {
  const savedCountdown = localStorage.getItem('countdown')
  if (savedCountdown) {
    countdown.value = parseInt(savedCountdown)
    getEncode()
  }
})
</script>

<template>
  <div class="center flex lg:max-w-4xl max-w-3xl lg:flex-grow ">
    <div class="slider-container lg:w-1/2 marlene-bg-glass marlene-rounded-r-lg lg:visible w-0">
      <div class="image-slider">
        <div class="slider-indicators">
          <button v-for="(image, index) in images" :class="{ active: currentIndex === index }" @click="changeImage(index)" />
        </div>
        <div class="slider-images">
          <img v-for="(image, index) in images" :src="image" :class="{ active: currentIndex === index }" alt="Slider Image">
        </div>
      </div>
    </div>
    <div class="lg:bg-white lg:w-1/2 lg:p-8 lg:py-16 lg:px-12 space-y-7 marlene-rounded-l-lg shadow-sm w-max p-8 marlene-bg-glass-ex">
      <div class="space-y-3.5">
        <p class="mb-2 text-primary text-4xl">
          注册 WM-AI
        </p>
        <div class="regist-box">
          <div class="regist-blue-box">
            <!-- <img src="/src/assets/js.png" class="icon" alt=""> -->
            <span class="regist-text">本站只用于技术预览和学习。请使用手机号进行注册和登录。</span>
          </div>
        </div>
      </div>
      <form class="space-y-8">
        <div class="space-y-3">
          <div class="block ">
            <!-- | 手机号 -->
            <NInput
              v-model:value="userInfo.email" type="text" placeholder=" 手机号"
              class="border min-w-full border-gray  focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div class="block ">
            <NInput
              v-model:value="userInfo.password"
              type="password"
              show-password-on="mousedown"
              placeholder="密码"
              :maxlength="18"
              class="border min-w-full border-gray focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <!-- <input
              :value="userInfo.passWord"
              class="border min-w-full border-gray focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="密码"
              type="password" @input="userInfo.passWord = $event.target.value"
            > -->
          </div>

          <div class="block picCode">
            <NInput
              v-model:value="userInfo.captcha" type="text" placeholder="验证码"
              style="width: 45%;"
              class=" border border-gray focus:border-primary
              rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <img class="picImg " :src="picData.picCodeBase64" alt="">
            <NButton style="margin-left: 3%;" text @click="getPicData">
              <span style="color: rgb(0, 0, 0)">刷新</span>
            </NButton>
          </div>

          <div class="block picCode">
            <NInput
              v-model:value="userInfo.emailEode" type="text" placeholder="验证码"
              style="width: 45%;"
              class=" border border-gray focus:border-primary
              rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <NButton type="primary" color="rgb(109, 165, 0)" style="margin-left: 3%;" :disabled="countdown > 0" @click="handleVerify">
              <span style="color: rgb(255, 255, 255)"> {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}</span>
            </NButton>
          </div>
          <div class="block ">
            <NInput
              v-model:value="userInfo.inviteCode" type="text" placeholder="邀请码。没有可不填"
              class="border min-w-full border-gray focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div class="grid grid-cols-7 gap-4">
            <div class="regist-mm col-end-8 col-span-3">
              已有账号?
              <router-link to="login" class="text-register">
                登录
              </router-link>
            </div>
          </div>
        </div>
        <div class="block regist-btn">
          <button
            v-loading="loading"
            type="button" class="min-w-full h-12 focus:bg-secondary
          hover:bg-secondary text-2xl marlene-btn" @click="verifyEodeButton"
          >
            注 册
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
#app {
  height: 100%;
  background-image:url(/img/bagr1.png) !important;
  background-attachment: fixed;
  background-size: cover;
}
n-input {
  border-radius: 10px;
}
.picImg{
  position: relative;
  top: 0;
  left: 0;
  max-width: 100%;
  max-height: 100%;
  width: 28%;
  height: 18%;
  margin-left: 10px;
}
.iconButon{
  margin-left: 8px;
  display: flex;
  align-items: center;
  border: none !important;
}
.iconImg{
  width: 18px;
  height: 10px !important;
  margin-left: 10px;
  fill: rgb(164, 165, 163) !important;
}
.block.picCode{
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  position: relative;
}
.underline-link{
  text-decoration: underline;
}
.bg-primary{
  color: rgb(105, 157, 0)!important;
}
.login-mm{
  position: absolute;
    right: 7%;
}
.regist-mm{
  margin-top: 0% ;
  position: absolute;
    right: 7%;
}
.text-register{
  color: rgb(105, 157, 0);
}
.checked {
  position: relative;
}

.checked::before {
  content: "\2713"; /* 对勾的 Unicode 编码 */
  position: absolute;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
  font-size: 12px;
  color: green;
}
.image-slider {
  flex-direction: column; /* 修改这里的属性为 row */
  align-items: center;

}
.slider-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.slider-images {
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slider-images img {
  position: absolute;
  margin: auto;
  justify-content: center;
  align-items: center;
  object-fit: cover;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  width: 50%;
  border-radius: 0.5rem 0 0 0.5rem ;
}

.slider-images img.active {
  opacity: 1;
}

.slider-indicators {
  margin: auto;
  justify-content: center;
  position: absolute;
  z-index: 2;
  bottom: 0.2px;
  align-items: center;
  transform: translateX(-50%);
}

.slider-indicators button {
  display: inline-block;
  align-self: flex-end;
  width: 8px;
  height: 8px;
  background-color: gray;
  border-radius: 50%;
  margin: 0 5px;
  cursor: pointer;
}

.slider-indicators button.active {
  background-color: black;
}
.center {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.regist-btn{
  margin-top: 5% ;
}
.marlene-btn {
  font-size: medium !important;
  border-radius: 0.2rem 0.2rem 0.2rem 0.2rem;
  background-color: rgb(105, 157, 0) !important;
  color: rgb(241, 235, 235);
  height: 20% !important;
}
.marlene-bg-glass {
  background: linear-gradient(
          117.76deg,
          rgba(255, 255, 255, 0.7) -7.21%,
          rgba(255, 255, 255, 0.5) 118.08%
  );
  /* backdrop-filter: blur(8px); */
}
.marlene-rounded-l-lg {
  border-radius: 0.5rem;
}
.marlene-rounded-r-lg {
  border-radius: 0.5rem;
}
@media (min-width: 1024px) {
  .marlene-rounded-l-lg {
    border-radius: 0rem 0.5rem 0.5rem 0rem;
  }
  .marlene-rounded-r-lg {
    border-radius: 0.5rem 0rem 0rem 0.5rem;
  }
}
@media (max-width: 1024px) {
  .marlene-bg-glass-ex {
    background: linear-gradient(
            117.76deg,
            rgba(255, 255, 255, 0.7) -7.21%,
            rgba(255, 255, 255, 0.5) 118.08%
    );
    backdrop-filter: blur(8px);
  }
}
.regist-box {
    margin-top: -4% !important;
    border-radius: 0.5rem 0.5rem 0.5rem 0.5rem;
    background-color: rgba(0, 0, 0, 0);
  }

  .icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
  .regist-text {
    border-top: 1px;
  font-size: smaller;
  color: rgba(0, 0, 0, 0);
  word-wrap: break-word;
}
</style>
