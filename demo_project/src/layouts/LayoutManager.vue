<template>
  <!-- 锁屏状态下显示全屏锁定界面 -->
  <template v-if="appStore.lockStatus">
    <FullScreenLock />
  </template>

  <!-- 布局加载状态 -->
  <template v-else-if="layoutStore.layoutLoading">
    <div class="layout-loading">
      <t-loading size="large" text="正在切换布局..." />
    </div>
  </template>

  <!-- 侧边栏布局 -->
  <template v-else-if="layoutStore.currentLayout === 'sidebar'">
    <SidebarLayout />
  </template>

  <!-- 顶部导航布局 -->
  <template v-else-if="layoutStore.currentLayout === 'topbar'">
    <TopbarLayout />
  </template>

  <!-- 混合布局 -->
  <template v-else-if="layoutStore.currentLayout === 'mixed'">
    <MixedLayout />
  </template>

  <!-- 全局主题配置 -->
  <div class="theme-drawer">
    <t-button v-if="!showThemeDrawer" type="primary" @click="openThemeDrawer">
      <t-icon name="setting" />
    </t-button>

    <ThemeDrawer v-model="showThemeDrawer" />
  </div>
</template>

<script setup>
import {ref } from 'vue'
import { useLayoutStore } from '@/store/modules/layout'
import { useAppStore } from '@/store/modules/app'
import SidebarLayout from '@/layouts/sidebar/SidebarLayout.vue'
import TopbarLayout from '@/layouts/topbar/TopbarLayout.vue'
import MixedLayout from '@/layouts/mixed/MixedLayout.vue'
import FullScreenLock from '@/components/lock-screen/FullScreenLock.vue'
import ThemeDrawer from '@/components/custom/ThemeDrawer.vue'

const layoutStore = useLayoutStore()
const appStore = useAppStore()

// 抽屉状态
const showThemeDrawer = ref(false)

// 打开主题设置抽屉
const openThemeDrawer = () => {
  showThemeDrawer.value = true
}
</script>

<style scoped lang="scss">
.layout-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.theme-drawer {
  position: fixed;
  top: 50%;
  right: -3px;
  z-index: 1000;

  :deep(.t-button) {
    padding: 10px;
  }
}
</style>