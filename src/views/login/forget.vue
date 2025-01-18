<script lang='ts' setup>
import { onMounted, ref } from 'vue'
import { NButton, NForm, NInput, useDialog, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { RegisterType, resetPassword, sendCode } from '@/api/register'
import type { resetPasswordModel } from '@/api/register'
const ms = useMessage()
const loading = ref(false)
const router = useRouter() // 导入路由对象
const dialog = useDialog()

const issuccess = ref(false)
const userInfo = ref({
  email: '',
  password: '',
  emailEode: '',
  inviteCode: '',
})
async function handleVerify() {
  // 校验表单数据
  if (validateForm())
    await getCode()

  // else ms.error('请正确填写输入框中的内容')
}

function validateForm() {
  if (!userInfo.value.email) {
    ms.error('请输入邮箱或手机号')
    return false
  }
  return true
}
function validateRestForm() {
  if (!userInfo.value.email) {
    ms.error('请输入邮箱或手机号')
    return false
  }
  if (!userInfo.value.password) {
    ms.error('请输入密码')
    return false
  }
  if (!userInfo.value.emailEode) {
    ms.error('请输入验证码')
    return false
  }
  return true
}
// 获取验证码
async function getCode() {
  try {
    const result = await sendCode(userInfo.value.email)
    if (result.data) {
      issuccess.value = true
      getEncode()
    }
    dialog.success({
      title: '验证码发送成功',
      content: `请到${userInfo.value.email}查看验证码`,
      maskClosable: false,
      closable: false,
      positiveText: '确定',
    // onPositiveClick: () => {
    //   window.location.href = '/login'
    // },
    })
  }
  catch (e) {
    ms.error(e.message)
  }
}

// 修改密码
async function resetPass() {
  loading.value = true
  if (!validateRestForm()) {
    loading.value = false
    return
  }
  const pushData: resetPasswordModel = {
    identity: userInfo.value.email,
    password: userInfo.value.password,
    code: userInfo.value.emailEode,
    registerType: RegisterType.Email,
  }

  try {
    const result = await resetPassword(pushData)
    if (result.data) {
      ms.info('恭喜您，密码修改成功。')
      router.push('/login')
    }
    else { ms.error('密码修改失败') }
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loading.value = false
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
  <div class="forget-center flex lg:max-w-4xl max-w-3xl lg:flex-grow ">
    <div class="lg:bg-white lg:w-1/2 lg:p-8 lg:py-16 lg:px-12 space-y-7 for-marlene-rounded-l-lg  ">
      <div class="">
        <p class="mb-2 text-primary text-4xl">
          WM-AI 找回密码
        </p>
      </div>
      <NForm class="space-y-8">
        <div class="space-y-6">
          <div class="block ">
            <NInput
              v-model:value="userInfo.email" type="text" placeholder="邮箱 | 手机号 "
              class="border min-w-full border-gray  focus:border-primary appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div class="block picCode">
            <NInput
              v-model:value="userInfo.emailEode" placeholder="验证码"
              style="width: 55%;" type="text"
              class=" border border-gray focus:border-primary
              rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <NButton type="primary" color="rgb(109, 165, 0)" style="margin-left: 3%;" :disabled="countdown > 0" @click="handleVerify">
              <span style="color: rgb(255, 255, 255)"> {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}</span>
            </NButton>
          </div>
          <div class="block ">
            <NInput
              v-model:value="userInfo.password"
              class="border min-w-full border-gray focus:border-primary
              rounded-lg appearance-none p-1 pl-2 h-12 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="密码"
              type="password"
              show-password-on="mousedown"
            />
          </div>

          <div class="grid grid-cols-7 gap-4">
            <div class="forget-mm col-end-8 col-span-3">
              <router-link to="login" class="text-forget">
                ⬅返回登录
              </router-link>
            </div>
          </div>
        </div>
        <div class="block forget-btn">
          <NButton
            v-loading="loading" color="rgb(109, 165, 0)" style="height:30px"
            class="min-w-full h-12 focus:bg-secondary hover:bg-secondary text-2xl " type="primary" @click="resetPass"
          >
            <span style="color: rgb(255, 255, 255)">重置密码</span>
          </NButton>
        </div>
      </NForm>
    </div>
  </div>
</template>

<style>
#app {
  height: 100%;
  background-image:url(/img/bagr1.png);
  background-size: cover;
}
.forget-mm{
  margin-top: -21px ;
  position: relative;
  right: -37%;
}
.text-forget{
  color: rgb(105, 157, 0);
}
.forget-center {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.forget-btn{
  margin-top: 10px !important;
}

.for-marlene-rounded-l-lg {
  border-radius: 0.5rem;
}
.marlene-rounded-r-lg {
  border-radius: 0.5rem;
}

.regist-text {
  border-top: 1px;
  font-size: smaller;
  color: rgba(0, 0, 0, 0);
  word-wrap: break-word;
}
</style>
