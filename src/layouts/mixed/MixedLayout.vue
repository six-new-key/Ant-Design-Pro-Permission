<template>
  <a-layout style="height: 100vh;width: 100%;">
    <!-- 顶部导航栏 -->
    <a-layout-header class="mixed-top-header" :class="{ 'theme-mode-header': appStore.headerTheme === 'dark' }">
      <div class="header-left">
        <div class="logo">
          <img src="/vite.svg" alt="logo" class="logo-img" />
          <span class="logo-text" :class="{ 'theme-mode-logo-text': appStore.headerTheme === 'dark' }">{{
            settings.projectName }}</span>
        </div>
      </div>

      <div class="top-menu">
        <MixedTopMenu />
      </div>

      <div class="header-right">
        <HeaderActions />
      </div>
    </a-layout-header>

    <a-layout>
      <!-- 侧边栏 -->
      <transition name="slide-fade">
        <a-layout-sider v-if="shouldShowSidebar" v-model:collapsed="collapsed" collapsible :width="sidebarWidth"
          :collapsedWidth="sidebarWidthCollapsed" :theme="appStore.sidebarTheme" class="mixed-sider"
          :class="{ 'mixed-sider-dark': appStore.sidebarTheme === 'dark' }" @mouseenter="handleSidebarMouseEnter"
          @mouseleave="handleSidebarMouseLeave">

          <MixedSideMenu />

          <template #trigger>
            <TriggerCollapsed @trigger-collapse="handleToggleCollapse" @pin-click="handlePinClick" />
          </template>
        </a-layout-sider>
      </transition>

      <!-- 主内容区域 -->
      <a-layout>
        <!-- 页签区域 -->
        <transition name="tabs-fade">
          <TabsView v-if="appStore.tabsShow" />
        </transition>
        
        <!-- 主内容区域 -->
        <a-layout-content class="mixed-content">
          <LayoutContent />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAppStore, useUserStore } from '@/stores'
import MixedTopMenu from './components/MixedTopMenu.vue'
import MixedSideMenu from './components/MixedSideMenu.vue'
import HeaderActions from '@/components/core/HeaderActions.vue'
import TabsView from '@/components/core/TabsView.vue'
import LayoutContent from '@/components/core/LayoutContent.vue'
import { theme } from 'ant-design-vue'
import { settings } from '@/settings'
import TriggerCollapsed from '@/components/core/TriggerCollapsed.vue'

const sidebarWidth = ref(settings.sidebarWidth)
const sidebarWidthCollapsed = ref(settings.sidebarWidthCollapsed)
const appStore = useAppStore()
const userStore = useUserStore()
const collapsed = ref(appStore.sidebarCollapsed)
const { token } = theme.useToken()

// 递归过滤隐藏的子菜单并处理单一子菜单提升逻辑
const filterHiddenRoutes = (routes, parentPath = '') => {
  if (!routes || !Array.isArray(routes)) return []

  const result = []

  for (const route of routes) {
    if (route.meta?.hidden) continue

    // 解析完整路径
    let fullPath = route.path
    if (!fullPath.startsWith('/') && !fullPath.startsWith('http')) {
      fullPath = parentPath + (parentPath === '/' ? '' : '/') + fullPath
    }

    // 创建新的路由对象
    const newRoute = { ...route, path: fullPath }

    // 如果有子路由，递归过滤
    if (route.children && route.children.length > 0) {
      const filteredChildren = filterHiddenRoutes(route.children, fullPath)

      // 如果过滤后没有可见的子菜单，则忽略该父菜单
      if (filteredChildren.length === 0) {
        continue
      }

      // 特殊处理：如果只有一个子菜单，直接渲染子菜单，不显示父菜单
      if (filteredChildren.length === 1) {
        result.push(filteredChildren[0])
        continue
      }

      newRoute.children = filteredChildren
    }

    result.push(newRoute)
  }

  return result
}

// 获取处理后的顶部菜单数据
const processedRoutes = computed(() => {
  return filterHiddenRoutes(userStore.menuRoutes)
})

// 判断当前选中的顶部菜单是否为一级路由（没有子菜单）
const shouldShowSidebar = computed(() => {
  const currentTopMenu = appStore.currentTopMenu
  if (!currentTopMenu) return false

  // 找到对应的路由配置
  const route = processedRoutes.value.find(r => r.path === currentTopMenu)
  if (!route) return false

  // 如果没有子路由或子路由为空，则隐藏侧边栏
  return route.children && route.children.length > 0
})

// 监听侧边栏状态变化
watch(() => appStore.sidebarCollapsed, (newVal) => {
  collapsed.value = newVal
})

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
  console.log('handleSidebarMouseEnter')
  if (!appStore.sidebarFixed) {
    appStore.setSidebarCollapsed(false)
  }
}

// 鼠标离开侧边栏事件处理
const handleSidebarMouseLeave = () => {
  console.log('handleSidebarMouseLeave')
  if (!appStore.sidebarFixed) {
    appStore.setSidebarCollapsed(true)
  }
}
</script>

<style scoped lang="scss">
.mixed-top-header {
  background: v-bind('token.colorBgContainer');
  display: flex;
  align-items: center;
  height: $top-height;
  border-bottom: 1px solid v-bind('token.colorFillSecondary');

  &.theme-mode-header {
    background: $component-bg-color;
  }

  .header-left {
    display: flex;
    align-items: center;
    width: 15%;

    .logo {
      min-width: 200px;
      display: flex;
      align-items: center;

      .logo-img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 600;
        color: v-bind('token.colorText');

        &.theme-mode-logo-text {
          color: #fff;
        }
      }
    }
  }

  .top-menu {
    width: 60%;
    border-bottom: none;
  }

  .header-right {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 25%;

    .header-icon {
      font-size: 16px;
      cursor: pointer;
      color: #666;
      transition: color 0.3s;
    }

    .header-icon:hover {
      color: #1890ff;
    }

    .user-avatar {
      cursor: pointer;
    }
  }
}

.mixed-sider {
  border-right: 1px solid v-bind('token.colorFillSecondary');

  &.mixed-sider-dark {
    border-top: 1px solid #414141;
  }
}

/* 从左至右滑入动画 */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.mixed-content {
  padding: $content-padding;
  height: calc(100vh - $top-height);
  overflow-y: scroll;
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