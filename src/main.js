import '../lang/index.js'
import { loadDynamicBgLibraries } from '@/utils'

import { createApp } from 'vue'
import '@/style/index.scss'
import 'katex/dist/katex.min.css'
import App from './App.vue'
import router from './router'
import * as antIcons from "@ant-design/icons-vue" //引入UI图标库
import 'ant-design-vue/dist/reset.css'
import pinia from './stores'
import './permission' // 导入权限控制模块，自动配置路由守卫
import Vue3ColorPicker from 'vue3-colorpicker' // 引入颜色选择器插件
import 'vue3-colorpicker/style.css'
import 'virtual:svg-icons-register' //svg注册
import globalComponent from "@/plugins" //引入自定义插件用来注册全局组件
import 'animate.css' // 引入动画库

const app = createApp(App)
//注册图标组件
Object.keys(antIcons).forEach((key) => {
  app.component(key, antIcons[key]);
});

// 加载动态背景库
await loadDynamicBgLibraries();
//注册全局组件插件
app.use(globalComponent);
app.use(router)
app.use(pinia)
app.use(Vue3ColorPicker)

app.mount('#app')
