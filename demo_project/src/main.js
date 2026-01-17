// 引入i18n，必须放在第一行
import '../lang/index.js'
import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import './style.css'
import 'animate.css'
import router from './router'
//引入pina
import pinia from "@/store";
//引入pina持久化插件
import { createPersistedState } from "pinia-persistedstate-plugin";
import App from './App.vue'
import 'virtual:svg-icons-register'
//引入自定义插件用来注册全局组件
import globalComponent from "@/plugins";
// 引入路由权限控制
import './permission'

// 引入主题系统
const app = createApp(App)
const persist = createPersistedState();


app.use(globalComponent);
app.use(TDesign)
app.use(pinia)
pinia.use(persist)
app.use(router)

app.mount('#app')
