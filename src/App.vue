<template>
  <a-config-provider :theme="themeConfig" :locale="language">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { ref,computed, watch, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import { useAppStore, useThemeStore } from '@/stores'
import { settings } from './settings'
import { setNProgressStyle } from '@/utils'
import { getLocale } from '@/locale'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const appStore = useAppStore()
const themeStore = useThemeStore()

const language = ref(getLocale(appStore.language))

// 主题配置
const themeConfig = computed(() => {
  return {
    algorithm: appStore.themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: themeStore.primaryColorHex,
      colorInfo: themeStore.primaryColorHex,
      colorBgLayout: appStore.themeMode === 'dark' ? settings.bgColor : "#eee",
      colorBgContainer: appStore.themeMode === 'dark' ? settings.componentBgColor : "#fff",
      fontSize: themeStore.baseConfig.fontSize,
      borderRadius: themeStore.baseConfig.borderRadius,
      wireframe: themeStore.baseConfig.wireframe,
    }
  }
})

//监听primaryColorHex
watch(() => themeStore.primaryColorHex, (newVal) => {
  setNProgressStyle(newVal)
})

// 监听语言变化
watch(() => appStore.language, (newVal) => {
  language.value = getLocale(newVal)
  dayjs.locale(newVal)
})

onMounted(() => {
  //设置进度条背景色
  setNProgressStyle(themeStore.primaryColorHex)
})

</script>

<style>
:where(.ant-layout .ant-layout-sider) {
  background: v-bind('appStore.themeMode === "dark" || appStore.sidebarTheme === "dark" ? settings.componentBgColor : "#fff"') !important;
}

:where(.mixed-top-header.theme-mode-header) {
  background: v-bind('appStore.themeMode === "dark" || appStore.headerTheme === "dark" ? settings.componentBgColor : "#fff"') !important;
}

:where(.topbar-header.theme-mode-header) {
  background: v-bind('appStore.themeMode === "dark" || appStore.headerTheme === "dark" ? settings.componentBgColor : "#fff"') !important;
}

:where(.ant-menu.ant-menu-horizontal > .ant-menu-item),
:where(.ant-menu.ant-menu-horizontal > .ant-menu-submenu) {
  border-radius: v-bind('themeStore.baseConfig.borderRadius + "px"') !important;
}

::-webkit-scrollbar {
  width: 4px !important;
  height: 0 !important;
}

/*滚动条的滑块按钮*/
::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: v-bind('appStore.themeMode === "dark" || appStore.sidebarTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e7e7e7"') !important;
  transition: all 0.2s;
  -webkit-transition: all 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('appStore.themeMode === "dark" || appStore.sidebarTheme === "dark" ? "rgba(255, 255, 255, 0.3)" : "#d3d3d3"') !important;
}

/*滚动条的上下两端的按钮*/
::-webkit-scrollbar-button {
  height: 0px;
  width: 0;
}
</style>
