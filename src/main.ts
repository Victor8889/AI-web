/*
 * @Description: main文件 配置项目
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import SvgIcon from './components/SvgIcon.vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore, vuexStore } from './store'
import { setupRouter } from './router'
import 'element-plus/theme-chalk/index.css'// ../node_modules/element-plus/lib/theme-chalk/index.css'
import './assets/css/layout.scss'
import './assets/css/custom.scss'

// 导入路由对象

async function setupApp() {
  const app = createApp(App)
  app.use(ElementPlus)
  app.component('SvgIcon', SvgIcon)
  // app.use(setupRouter) // 使用路由对象
  app.use(setupStore)
  app.use(vuexStore)
  // setupAssets 样式文件
  setupAssets()

  // setupScrollbarStyle 滚动条
  setupScrollbarStyle()

  // setupI18n 国际化插件
  setupI18n(app)

  // setupStore 使用pinia
  setupStore(app)

  // setupRouter 使用路由
  await setupRouter(app)

  app.mount('#app')
}

setupApp()
