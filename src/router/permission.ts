/*
 * @Author: lk
 * @LastEditTime: 2023-04-15 21:45:15
 * @FilePath: \wm-ai\src\router\permission.ts
 * @Description: 路由导航守卫(鉴权) todo
 * 增加页面历史记录---只记录最后一个有效地址
 */
import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

export function setupPageGuard(router: Router) {
  const noAuthNeededRoutes = ['/login', '/register', '/forget', '/service'] // 不需要认证的页面别名

  router.beforeEach(async (to, from, next) => {
    if (!noAuthNeededRoutes.includes(to.path)) {
    // 如果即将进入的不是非认证页面，则更新最后一个有效页面的路径
      sessionStorage.setItem('lastValidPath', to.fullPath)
      // if (lastUrl.startsWith('/'))
      //   lastUrl = lastUrl.substring(1, lastUrl.length)
      sessionStorage.setItem('activeMobileMenu', to.fullPath)
    }
    const authStore = useAuthStoreWithout()
    if (!authStore.token) {
      if (to.path === '/500')
        next({ name: 'Root' })
      else
        next()
    }
    else {
      next()
    }
  })
}
