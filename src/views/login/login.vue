<script lang='ts' setup>
import { onMounted, ref, toRaw } from 'vue'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useQrStore } from '../er/components/apiTypes'
import { ls } from '@/utils/storage/local'
import { loginEmail } from '@/api/login'
import { useAuthStore, useChatStore, userParStore } from '@/store'
import { setToken } from '@/utils/auth'

const authStore = useAuthStore()
const qrStore = useQrStore()
const router = useRouter() // 导入路由对象

const route = useRoute()
const loading = ref(false)
const ms = useMessage()

const chatStore = useChatStore()
const parStore = userParStore()

const userInfo = ref({
  email: '',
  password: '',
})

const rememberPassword = ref(false)
const localLoginInfo = ls.get('userInfo')
if (localLoginInfo) {
  userInfo.value.email = localLoginInfo._value.email || ''
  userInfo.value.password = localLoginInfo._value.password || ''
}
const images = [
  '/img/OIG2.jpg',
  '/img/OIG3.jpg',
  '/img/OIG.jpg',
]
const currentIndex = ref(0)

const changeImage = (index) => {
  currentIndex.value = index
}

const handlePress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleVerify()
  }
  else if (event.key === undefined) {
    event.preventDefault()
    handleVerify()
  }
}

const handleVerify = () => {
  // 格式校验
  if (validateForm())
    pushClick()
}

const validateForm = () => {
  const regMobile = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  const phoneReg = /^1\d{10}$/// 手机号正则表达式
  if (!userInfo.value.email) {
    ms.error('请输入邮箱或手机号')
    return false
  }
  else if (!regMobile.test(userInfo.value.email) && !phoneReg.test(userInfo.value.email)) {
    ms.error('请输出正确格式的邮箱或手机号')
    return false
  }

  return true
}
const pushClick = async () => {
  // 取值
  const pushData = {
    username: userInfo.value.email,
    password: userInfo.value.password,
  }

  try {
    // 存用户账户吗密码
    if (rememberPassword.value) {
      ls.remove('userInfo')
      ls.set('userInfo', toRaw(userInfo))
    }
    else { ls.remove('userInfo') }
    // 开启加载状态
    loading.value = true
    // 发起请求
    // 登录
    const res: any = await loginEmail(pushData) // await api.login({ username, password: password.toString() })
    // 登录成功后 存token并且请求用户基础数据
    // authStore.setToken(data?.token)

    // 成功弹框
    ms.success('登录成功')
    // 重载页面
    // window.location.reload()
    // 更改布局
    // console.log(`2122121${isLoggedIn.value}`)

    // 在登录成功的地方设置 isLoggedIn 的值
    // 例如：
    // globalState.isLoggedIn.value = true
    qrStore.clearQr()
    chatStore.clearRoom()
    chatStore.clearChatByUuid(0)
    chatStore.active = 0
    // ss.clear()
    authStore.setToken(res.data.token)
    setToken(res.data.token)
    localStorage.setItem('isLoggedIn', 'true')
    // console.log(`33333333${isLoggedIn.value}`)
    // chatStore.active = 0
    parStore.addUser(userInfo.value.email)
    // console.log(`1111111${router.currentRoute.value.path}`)
    // await router.push('/Chat')
    // window.history.back()
    // window.history.go(-1)

    let lastUrl = sessionStorage.getItem('lastValidPath')
    const noAuthNeededRoutes = ['/login', '/register', '/forget', '/service'] // 不需要认证的页面别名
    if (lastUrl === null || noAuthNeededRoutes.includes(lastUrl))
      lastUrl = '/home'

    router.push(lastUrl)

    // window.location.href = `#${lastUrl}`
    const active = sessionStorage.getItem('activeMobileMenu')
    // console.log('activeMobileMenu的值已经改变为123:', active)
  }
  catch (error) {
    ms.error(`登录失败。${error.message}`)
    // 错误弹框
    // ms.error(error.message ?? 'error')
  }
  finally {
    // 关闭加载状态
    loading.value = false
  }
}
onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 5000) // 切换间隔时间，单位为毫秒
})
function openService() {
  window.open('#/service', '服务条款', 'noopener')
}
function regist() {
  router.push('/register')
}
function forget() {
  router.push('/forget')
}
// onMounted(() => {
//   window.location.reload()
//   // window.onload = function () {
//   //   document.body.style.backgroundImage = 'url(\'/src/assets/login_bg.webp\')'
//   // }
// })
</script>

<template>
  <div class="bodyUrl center flex lg:max-w-4xl max-w-3xl lg:flex-grow ">
    <div class="slider-container lg:w-1/2 marlene-bg-glass marlene-rounded-r-lg lg:visible w-0">
      <div class="image-slider">
        <div class="slider-indicators">
          <button v-for="(image, index) in images" :key="index" :class="{ active: currentIndex === index }" @click="changeImage(index)" />
        </div>
        <div class="slider-images">
          <img v-for="(image, index) in images" :key="index" :src="image" :class="{ active: currentIndex === index }" alt="Slider Image">
        </div>
      </div>
    </div>
    <div class="lg:bg-white lg:w-1/2 lg:p-8 lg:py-16 lg:px-12 space-y-7 marlene-rounded-l-lg shadow-sm w-max p-8 marlene-bg-glass-ex">
      <div class="space-y-3.5">
        <p class="mb-2 text-primary text-4xl">
          登录  WM-AI
        </p>
        <div class="yellow-box">
          <div class="blue-box">
            <img src="/src/assets/js.png" class="icon" alt="">
            <span class="text">本站只用于技术预览和学习。如果您在国内违反法律使用此站点，会受到监管，
              并且内容或帐号可能会被清除，而且不会提前通知。<span style="color:blue">注册即赠送免费积分。</span></span>
          </div>
        </div>
      </div>
      <form class="space-y-8">
        <div class="space-y-6">
          <div class="block ">
            <input
              :value="userInfo.email"
              class="border min-w-full border-gray focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="邮箱|手机号"
              type="email" @input="userInfo.email = $event.target.value"
            >
          </div>
          <div class="block ">
            <input
              :value="userInfo.password"
              class="border min-w-full border-gray focus:border-primary rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="密码"
              type="password" @input="userInfo.password = $event.target.value"
            >
          </div>
          <div class="grid grid-cols-7 gap-4">
            <div class="col-start-1 col-end-4">
              <label class="flex items-center space-x-3 ">
                <input
                  type="checkbox" name="checked-demo"
                  :value="rememberPassword" class="form-tick appearance-none h-4 w-4 border border-gray rounded-md checked:bg-primary checked:border-transparent focus:outline-none bg-white" @input="rememberPassword = $event.target.value"
                >
                <span class="text-blue-gray font-medium">记住密码</span>
              </label>
            </div>
            <div class="login-mm col-end-8 col-span-3">
              <router-link to="" class="underline-link" @click="forget">
                找回密码
              </router-link>&nbsp;
            </div>
          </div>
        </div>
        <div class="block login-btn">
          <button v-loading="loading" class="min-w-full h-12 focus:bg-secondary hover:bg-secondary text-2xl marlene-btn" @click="handlePress">
            登 录
          </button>
        </div>

        <div class="col-end-5 col-span-2">
          <div class="service">
            点击登录默认您已知晓并同意
            <router-link to="" class="text-service" @click="openService">
              《服务条款》
            </router-link>
          </div>
          新用户？
          <router-link to="" class="text-register" @click="regist">
            注册账号
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
#app {
  background-image:url(/img/bagr1.png) !important;
  background-attachment: fixed;
  background-size: cover;
}
.underline-link{
  text-decoration: underline;
}
.form-tick:checked {
  background-color: rgb(105, 157, 0); /* 选中时的背景颜色 */
  border-color: transparent; /* 选中时的边框颜色 */
}

.login-mm{
  position: absolute;
    right: 7%;
}
.service{
  margin-top: -21px !important;
  font-size: smaller;
  color: grey;
}
.text-service{
  color: rgb(23, 3, 240);
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
  width: 50%;
  border-radius: 0.5rem 0 0 0.5rem ;
  /* transition: opacity 0.5s ease-in-out; */
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
.login-btn{
  margin-top: 18px !important;
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
}  .yellow-box {
    border-radius: 0.5rem 0.5rem 0.5rem 0.5rem;
    background-color: rgb(255, 234, 117);
  }

  .blue-box {
    border-radius: 0.5rem 0.5rem 0.5rem 0.5rem;
    background-color: rgb(250, 252, 149);
    color: white;
  display: flex;
  align-items: center;
  }
  .icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
  .text {
  margin-top: 3px;
  margin-bottom: 1px;
  border-top: 1px;
  font-size: smaller;
  color: rgb(0, 0, 0);
  word-wrap: break-word;
}
</style>
