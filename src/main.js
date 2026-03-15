import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElInfiniteScroll } from 'element-plus'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册InfiniteScroll指令
app.directive('InfiniteScroll', ElInfiniteScroll)

app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')
