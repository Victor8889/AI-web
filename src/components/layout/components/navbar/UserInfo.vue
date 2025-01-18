<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../../../../api/api'
import { useAuthStore, useChatStore, useUserStore } from '@/store'
import { SvgIcon } from '@/components/index'
import { removeToken } from '@/utils/auth/token'

// export default {}
const router = useRouter() // 导入路由对象
const ms = useMessage()

const chatStore = useChatStore()
const authStore = useAuthStore()
const userStore = useUserStore()
// const needPermission = ref(false)
const needPermission = computed(() => !authStore.token)
// needPermission.value = computed(() => !getToken())
async function logout() {
  await api.logouts()
  // 移除token
  authStore.removeToken()
  userStore.resetUserInfo()
  removeToken()
  chatStore.clearRoom()
  localStorage.setItem('isLoggedIn', 'false')
  router.push('/home')
  ms.info('退出成功')
}
function userInfo() {
  router.push('/person')
}
function login() {
  router.push('/login')
}
watch(() => authStore.token, (newAuthStore, oldAuthStore) => {
})
</script>

<template>
  <el-dropdown>
    <div class="header-user">
      <img src="@/assets/img/user.jpg" alt="">
      <!-- <span>超级管理员</span> -->
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="!needPermission" @click="userInfo">
          <SvgIcon icon="ri-user-5-line" class="mr-2 text-1.5xl" />
          个人信息
          <!-- <UserAvatar /> -->
        </el-dropdown-item>
        <el-dropdown-item v-if="!needPermission" @click="logout">
          <SvgIcon icon="ri-logout-circle-r-line" class="mr-2 text-1xl" />
          退出登录
        </el-dropdown-item>

        <el-dropdown-item v-if="needPermission" @click="login">
          <SvgIcon icon="ri-login-circle-line" class="mr-2 text-1xl" />
          登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.header-user {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0 4px;
  cursor: pointer;
  color: #ffffff;
  img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 4px;
  }
}
</style>
