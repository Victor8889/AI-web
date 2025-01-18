/*
 * @Author: lk
 * @LastEditTime: 2023-04-16 13:53:25
 * @Description: 路由配置文件出口
 */
import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { Layout } from '@/components/layout/index.vue'
import { ChatLayout } from '@/views/chat/layout'
import { MjLayout } from '@/views/mj/layout'
import { ERLayout } from '@/views/er/layout'
import { SWDLayout } from '@/views/swd/layout'

const isLoggedInGuard = (to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (to.path === '/')
    next('/home')
  else
    next()
  // if (!isLoggedIn) {
  //   if (to.path === '/forget' || to.path === '/service' || to.path === 'emailValidation')
  //     next() //  其他情况继续路由
  //   else if (to.path === '/')
  //     next('/home')
  //   else
  //     next('/login') // 如果未登录且访问其他页面，则重定向到登录页面
  // }
  // else {
  //   if (to.path === '/')
  //     next('/home')
  //   else
  //     next() // 登录则跳转到地址页面
  // }
}
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: Layout,
    // redirect: '/chat', // chat
    children: [
      {
        path: '/',
        name: '/chat',
        component: ChatLayout,
        children: [{
          path: '/chat/:roomId?',
          name: 'Chat',
          component: () => import('@/views/chat/index.vue'),
        }],
      },
      {
        path: 'person',
        name: 'person',
        component: () => import('@/views/personInfo.vue'),
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/login.vue'),
        // component: () => import('@/views/chat/index.vue'), // src\views\login\login.vue  src/views/login/register.vue
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('@/views/login/register.vue'),
      },
      {
        path: '/forget',
        name: 'forget',
        component: () => import('@/views/login/forget.vue'),
      },
      {
        path: '/',
        name: '/swd',
        component: SWDLayout,
        children: [{
          path: 'swd',
          name: 'swd',
          component: () => import('@/views/swd/index.vue'),
        }],
        // component: () => import('@/components/setting/index.vue'),
        // component: () => import('@/views/chat/index.vue'), // src\views\login\login.vue  src/views/login/register.vue
      },
      {
        path: '/',
        name: '/mj',
        component: MjLayout,
        children: [{
          path: 'mj',
          name: 'mj',
          component: () => import('@/views/mj/index.vue'),
        }],
      },
      {
        path: '/',
        name: '/qr',
        component: ERLayout,
        children: [{
          path: 'qr',
          name: 'qr',
          component: () => import('@/views/er/index.vue'),
        }],
      },
    ],
    beforeEnter: isLoggedInGuard,
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/login/login.vue'),
  //   // component: () => import('@/views/chat/index.vue'), // src\views\login\login.vue  src/views/login/register.vue
  // },
  {
    path: '/service',
    name: 'service',
    component: () => import('@/views/login/service.vue'),
  },
  {
    path: '/logins',
    name: 'Logins',
    component: () => import('@/views/login/login.vue'),
    // component: () => import('@/views/chat/index.vue'), // src\views\login\login.vue  src/views/login/register.vue
  },
  {
    path: '/emailValidation',
    name: 'emailValidation',
    component: () => import('@/views/exception/emailValidation/index.vue'),
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
