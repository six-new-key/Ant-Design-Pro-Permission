<template>
  <a-layout style="height: 100vh;width: 100%;">
    <!-- 侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" collapsible :width="sidebarWidth"
      :collapsedWidth="sidebarWidthCollapsed" class="sidebar-sider" :theme="appStore.sidebarTheme"
      @mouseenter="handleSidebarMouseEnter" @mouseleave="handleSidebarMouseLeave">
      <!-- Logo区域 -->
      <div class="logo-container">
        <div class="logo">
          <img src="/vite.svg" alt="logo" class="logo-img" />
          <transition name="slide-fade">
            <span v-if="!collapsed" class="logo-text" :class="{ 'text-white': appStore.sidebarTheme === 'dark' }">{{
              settings.projectName }}</span>
          </transition>
        </div>
      </div>

      <!-- 侧边菜单 -->
      <div class="sidebar-menu">
        <Sidebar />
      </div>

      <template #trigger>
        <TriggerCollapsed @trigger-collapse="handleToggleCollapse" @pin-click="handlePinClick" />
      </template>
    </a-layout-sider>

    <!-- 主内容区域 -->
    <a-layout class="sidebar-layout" :class="{ 'right-collapsed': collapsed }">
      <!-- 头部 -->
      <a-layout-header class="sidebar-header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <Breadcrumb strategy="matched" :show-home="true" />
        </div>

        <div class="header-right">
          <HeaderActions />
        </div>
      </a-layout-header>

      <!-- 页签区域 -->
      <transition name="tabs-fade">
        <TabsView v-if="appStore.tabsShow" />
      </transition>

      <!-- 内容区域 -->
      <a-layout-content class="sidebar-content">
        <LayoutContent />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores'
import Breadcrumb from '@/components/core/Breadcrumb.vue'
import HeaderActions from '@/components/core/HeaderActions.vue'
import Sidebar from './components/Sidebar.vue'
import TabsView from '@/components/core/TabsView.vue'
import LayoutContent from '@/components/core/LayoutContent.vue'
import { settings } from '@/settings'
import { theme } from 'ant-design-vue'
import TriggerCollapsed from '@/components/core/TriggerCollapsed.vue'

const sidebarWidth = ref(settings.sidebarWidth)
const sidebarWidthCollapsed = ref(settings.sidebarWidthCollapsed)
const appStore = useAppStore()
const collapsed = ref(appStore.sidebarCollapsed)
const { token } = theme.useToken()

// 切换折叠按钮点击事件
const handleToggleCollapse = () => {
  collapsed.value = !collapsed.value
  appStore.setSidebarCollapsed(collapsed.value)
}

// 固定按钮点击事件
const handlePinClick = () => {
  appStore.setSidebarFixed(!appStore.sidebarFixed)
}

// 鼠标进入侧边栏事件处理
const handleSidebarMouseEnter = () => {
  if (!appStore.sidebarFixed) {
    appStore.setSidebarCollapsed(false)
  }
}

// 鼠标离开侧边栏事件处理
const handleSidebarMouseLeave = () => {
  if (!appStore.sidebarFixed) {
    appStore.setSidebarCollapsed(true)
  }
}

// 监听store中的状态变化
watch(() => appStore.sidebarCollapsed, (newVal) => {
  collapsed.value = newVal
})
</script>

<style scoped lang="scss">
.sidebar-sider {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  border-right: 1px solid v-bind('token.colorFillSecondary');

  .logo-container {
    height: $top-height;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    .logo {
      display: flex;
      align-items: center;

      .logo-img {
        width: 32px;
        height: 32px;
      }

      .logo-text {
        font-size: 21px;
        font-weight: 600;
        color: v-bind('token.colorText');
        white-space: nowrap;
        margin-left: 12px;

        &.text-white {
          color: #fff;
        }
      }
    }
  }

  .sidebar-menu {
    height: calc(100vh - $top-height - 50px);
    overflow-y: auto;
  }
}

.sidebar-layout {
  height: 100vh;
  margin-left: $sidebar-width;

  &.right-collapsed {
    margin-left: $sidebar-width-collapsed;
  }
}

.sidebar-header {
  background: v-bind('token.colorBgContainer');
  display: flex;
  align-items: center;
  height: $top-height;

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.sidebar-content {
  height: calc(100vh - $top-height);
  overflow-y: scroll;
  width: 100%;
  padding: $content-padding;
}

/* 从左至右滑入动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* 页签区域淡入淡出动画 */
.tabs-fade-enter-active,
.tabs-fade-leave-active {
  transition: all 0.2s ease-out;
}

.tabs-fade-enter-from,
.tabs-fade-leave-to {
  opacity: 0;
}
</style>