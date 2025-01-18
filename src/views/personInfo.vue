<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { NButton, NDataTable, NDivider, NIcon, NInput, NPagination, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import api from '../api/api'
import 'element-plus/theme-chalk/index.css'
import PreDialog from '../components/layout/components/sidebar/present.vue'
import { useAuthStore, useChatStore, useUserStore, userParStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { copyText } from '@/utils/format'
import { removeToken } from '@/utils/auth/token'

const authStore = useAuthStore()
const needPermission = computed(() => !authStore.token)
const userStore = useUserStore()
const router = useRouter()
const chatStore = useChatStore()

const activeName = ref('userInfo')
const { isMobile } = useBasicLayout()
const showPresent = ref(false)

const parStore = userParStore()
const isNight = computed(() => {
  return parStore.nightMode
})
const personInfo = ref({
  /**
   * 提示语
   */
  remainHoldBi: '0',
  remainHoldCount: '0',
  /**
   * 房间 id
   */
  inviteEncode: '0',
  userName: '0',
})
onMounted(async () => {
  const result: Chat.personInfo = await api.getUserInfo()
  personInfo.value = {
    remainHoldBi: result.data.remainHoldBi,
    inviteEncode: result.data.inviteEncode,
    userName: result.data.userName,
    validyDate: result.data.validyDate,
    remainHoldCount: result.data.remainHoldCount,
    isVip: result.data.isVip,
  }
  getInvites(1)
})
const pass = ref({
  oldpass: '',
  newpass: '',
})
const pNum = ref(1)
const pSize = ref(10)
const total = ref<number>(0)
const ms = useMessage()
const renewpass = ref('')
const page = ref({
  pageNum: 1,
  pageSize: 10,
})
const records = ref({
  id: '',
  model: '',
  holdBi: '',
  createTime: '',
  mark: '',
})
const recharges = ref({
  id: '',
  amount: '',
  points: '',
  updateTime: '',
  status: '',
  mark: '',
})

const invites = ref({
  id: '',
  points: '',
  createTime: '',
  mark: '',
})
async function handleClick() {
  if (activeName.value === 'userInfo') {
    const result: Chat.personInfo = await api.getUserInfo()
    personInfo.value = {
      remainHoldBi: result.data.remainHoldBi,
      inviteEncode: result.data.inviteEncode,
      userName: result.data.userName,
      validyDate: result.data.validyDate,
      remainHoldCount: result.data.remainHoldCount,
      isVip: result.data.isVip,
    }

    getInvites(1)
  }
  else if (activeName.value === 'charge') {
    getRecharges(1)
  }
  else if (activeName.value === 'record') {
    getRecords(1)
  }
}
async function getRecords(currentPage) {
  page.value.pageNum = currentPage
  const result = await api.pageRecords(page.value)
  if (result.code !== 200) {
    ms.error(result.message)
    return
  }
  if (result) {
    records.value = result.data.records
    total.value = result.data.total
  }
}
async function getRecharges(currentPage: number) {
  page.value.pageNum = currentPage
  const result = await api.getRecharges(page.value)
  if (result.code !== 200) {
    ms.error(result.message)
    return
  }
  if (result) {
    recharges.value = result.data.records
    total.value = result.data.total
  }
}
async function getInvites(currentPage: number) {
  page.value.pageNum = currentPage
  const result = await api.getInvites(page.value)
  if (result.code !== 200) {
    ms.error(result.message)
    return
  }
  if (result) {
    invites.value = result.data.records
    total.value = result.data.total
  }
  // console.log(invites.value)
}
// 拷贝按钮点击事件
function handleCopy() {
  copyText({ text: personInfo.value.inviteEncode ?? '' })
  ms.info('拷贝成功')
}
async function updatePassword() {
  if (renewpass.value != pass.value.newpass) {
    ms.warning('两次输入的密码不一致')
    return
  }
  if (pass.value.oldpass === pass.value.newpass) {
    ms.warning('新旧密码一致，请重新修改')
    return
  }

  const data = await api.password(pass.value.oldpass, pass.value.newpass)

  ms.info(data.message)
}
const columns = ref([
  { title: '编号', key: 'id' },
  { title: '积分', key: 'points' },
  { title: '时间', key: 'createTime' },
  { title: '备注', key: 'mark' },

])
const rechargesTitle = ref([
  { title: '编号', key: 'id' },
  { title: '金额', key: 'amount' },
  { title: '积分|天', key: 'points' },
  { title: '时间', key: 'createTime' },
  { title: '状态', key: 'status' },
  { title: '套餐', key: 'mark' },
  { title: '备注', key: 'payResult' },

])
const recordTitle = ref([
  { title: '编号', key: 'id' },
  { title: '类型', key: 'model' },
  { title: '积分', key: 'holdBi' },
  { title: '时间', key: 'createTime' },
  { title: '模块', key: 'mark' },

])

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
function login() {
  router.push('/login')
}
</script>

<template>
  <el-tabs v-model="activeName" :class="isNight ? 'night-theme ' : 'day-theme'" @tab-change="handleClick">
    <el-tab-pane name="userInfo" :class="isNight ? 'night-theme ' : 'day-theme'">
      <template #label>
        <span class="custom-tabs-label">
          <span :class="isNight ? 'night-el-tabs__item ' : 'day-el-tabs__item'">个人信息</span>
        </span>
      </template>

      <div :style="{ width: isMobile ? '95%' : '30%' }">
        <span>账号</span>
        <NInput v-model:value="personInfo.userName" disabled width="50px" class="w-50 m-2" />
      </div>
      <div :style="{ width: isMobile ? '95%' : '30%' }">
        <span>会员有效期</span>
        <NInput v-if="personInfo.isVip === '1'" v-model:value="personInfo.validyDate" disabled width="50px" class="w-50 m-2" />

        <NInput v-else value="会员已过期，请充值获取优惠" disabled width="50px" class="w-50 m-2" />
      </div>
      <div :style="{ width: isMobile ? '95%' : '30%' }">
        <span>积分</span>
        <div style="display: flex; align-items: center">
          <NInput v-model:value="personInfo.remainHoldBi" disabled class="w-50 m-2 " />
          <div class="hover-button-container">
            <HoverButton @click="showPresent = true">
              <NButton type="tertiary">
                <span style="color: rgb(59, 45, 250);">充值</span>
              </NButton>
            </HoverButton>
            <PreDialog v-model="showPresent" /><!-- :grid-data="gridData" -->
          </div>
        </div>
      </div>
      <div :style="{ width: isMobile ? '95%' : '30%' }">
        <span>免费基础积分</span>
        <div style="display: flex; align-items: center">
          <NInput v-model:value="personInfo.remainHoldCount" placeholder="VIP用户每月免费获得" disabled class="w-50 m-2 " />
        </div>
      </div>
      <div :style="{ width: isMobile ? '95%' : '30%' }">
        <span>邀请码</span>
        <div style="display: flex; justify-content: center;align-items: center;">
          <NInput v-model:value="personInfo.inviteEncode" disabled width="50px" class="w-50 m-2" />
          <el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="top-start"
          >
            <NButton type="tertiary" style="border: none; outline: none;" circle @click="handleCopy">
              <NIcon><CopyDocument /></NIcon>
            </NButton>
          </el-tooltip>
        </div>
      </div>

      <div v-if="isMobile" style="display: flex; align-items: center;margin-top: 5%;margin-bottom: 5%;">
        <NButton type="tertiary" style="width:100%;" @click="needPermission ? login() : logout()">
          <span v-if="!needPermission" style="color: rgb(59, 45, 250);">退出登录</span>
          <span v-else style="color: rgb(59, 45, 250);">登录</span>
        </NButton>
      </div>
      <NDivider title-placement="left">
        邀请
      </NDivider>
      <div :style="{ width: isMobile ? '90%' : '62%' }">
        <span>
          <!-- 邀请好处<br> -->
          &nbsp;&nbsp;&nbsp;&nbsp;邀请新用户注册，若被邀请的用户完成充值，您将获得他们充值积分的10%作为奖励。</span>
      </div>
      <div :style="{ width: isMobile ? '105%' : '100%' } " style="margin-top: 2%">
        <span> &nbsp;&nbsp;&nbsp;&nbsp;邀请列表</span>
        <div v-if="invites && invites.length > 0">
          <NDataTable
            :columns="columns"
            :data="invites"
            style="max-width: 1850px;margin-top: 1%;min-height:50px;max-height: 590px;overflow-y: scroll;"
          />

          <div style="margin-top: 1%">
            <NPagination
              v-model:page="page.pageNum"
              :total="total"
              :page-slot="7"
              :page-count="Math.ceil(total / page.pageSize)"
              @update:page="getInvites"
            />
          </div>
        </div>
        <div v-else>
          <span style="color: darkgray;">暂无记录</span>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane name="passwd" :class="isNight ? 'night-theme ' : 'day-theme'">
      <template #label>
        <span class="custom-tabs-label">
          <span :class="isNight ? 'night-el-tabs__item ' : 'day-el-tabs__item'">修改密码</span>
        </span>
      </template>
      <div :style="{ width: isMobile ? '90%' : '30%' }">
        <span>旧密码</span>
        <NInput v-model:value="pass.oldpass" type="password" show-password-on="mousedown" width="50px" class="w-50 m-2" />
      </div>
      <div :style="{ width: isMobile ? '90%' : '30%' }">
        <span>新密码</span>
        <NInput v-model:value="pass.newpass" type="password" show-password-on="mousedown" width="50px" class="w-50 m-2" />
      </div>
      <div :style="{ width: isMobile ? '90%' : '30%' }">
        <span>确认新密码</span>

        <NInput v-model:value="renewpass" type="password" show-password-on="mousedown" width="50px" class="w-50 m-2" />
      </div>
      <div :style="{ width: isMobile ? '90%' : '30%' }" style="margin-top: 1%">
        <div style="display: flex; justify-content: center;align-items: center;">
          <el-button type="success" :class="isNight ? 'night-el-tabs__item ' : 'day-el-tabs__item'" @click="updatePassword">
            更新密码
          </el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="兑换记录" name="charge" :class="isNight ? 'night-theme ' : 'day-theme'">
      <template #label>
        <span class="custom-tabs-label">
          <span :class="isNight ? 'night-el-tabs__item ' : 'day-el-tabs__item'">兑换记录</span>
        </span>
      </template>
      <div v-if="recharges && recharges.length > 0" :style="{ width: isMobile ? '100%' : '100%' } ">
        <NDataTable
          :columns="rechargesTitle"
          :data="recharges"
          height="490" style="max-width: 1850px;margin-top: 1%;min-height:50px;max-height: 590px;overflow-y: scroll;"
        />
        <div style="margin-top: 1%;margin-left: auto;">
          <NPagination
            v-model:page="page.pageNum"
            :total="total"
            :page-slot="7"
            :page-count="Math.ceil(total / page.pageSize)"
            @update:page="getRecharges"
          />
        </div>
      </div>
      <div v-else>
        <span style="color: darkgray;">暂无记录</span>
      </div>
    </el-tab-pane>
    <el-tab-pane label="消费记录" name="record" :class="isNight ? 'night-theme ' : 'day-theme'" style="overflow-y: hidden;">
      <template #label>
        <span class="custom-tabs-label">
          <span :class="isNight ? 'night-el-tabs__item ' : 'day-el-tabs__item'">消费记录</span>
        </span>
      </template>
      <div v-if="records && records.length > 0" :style="{ width: isMobile ? '100%' : '100%' } " style="overflow-y: hidden;">
        <NDataTable
          :columns="recordTitle"
          :data="records" style="width: 100%;margin-top: 1%;min-height:50px;max-height: 590px;overflow-y: auto;"
        />

        <div style="margin-top: 1%;margin-left: auto;">
          <NPagination
            v-model:page="page.pageNum"
            :total="total"
            :page-slot="7"
            :page-count="Math.ceil(total / page.pageSize)"
            @update:page="getRecords"
          />
        </div>
      </div>
      <div v-else>
        <span style="color: darkgray;">暂无记录</span>
      </div>
    </el-tab-pane>
  </el-tabs>
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

.el-row {
  .el-col {
    margin-bottom: 1rem;
  }
}
.card-header-label {
  font-size: 12px;
  padding: 2px 7px;
  border: 1px solid #eee;
  &.green {
    color: #389e0d;
    background: #f6ffed;
    border-color: #b7eb8f;
  }
  &.blue {
    color: #096dd9;
    background: #e6f7ff;
    border-color: #91d5ff;
  }
  &.orange {
    color: #d46b08;
    background: #fff7e6;
    border-color: #ffd591;
  }
  &.purple {
    color: #531dab;
    background: #f9f0ff;
    border-color: #d3adf7;
  }
}
.card-body {
  padding: 0.5rem 1rem;
  .num {
    display: inline-block;
    font-size: 1.5rem;
    padding-bottom: 1rem;
  }
  .bottom {
    font-size: 0.875rem;
  }
}
.details {
  padding: 0.5rem 1rem;
  > span {
    color: #999;
  }
}
</style>
