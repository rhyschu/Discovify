import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/index'
import Store from '@/stores'
import ElementPlus from 'element-plus'
import en from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/index.scss'
const app = createApp(App)
app.use(router)
app.use(Store)
// ElementPlus
app.use(ElementPlus, {
  locale: en,
})
app.mount('#app')
