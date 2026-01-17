<template>
  <t-layout class="mixed-layout">
    <!-- 顶部：Logo + 主导航 -->
    <t-header class="mixed-header">
      <!-- Logo 区域 -->
      <div class="header-logo">
        <svg-icon name="logo" width="35px" height="35px" />
        <span class="logo-text">TDesign Pro</span>
      </div>

      <!-- 主导航菜单 -->
      <div class="header-nav">
        <MixedTopMenu @menu-change="handleTopMenuChange" />
      </div>

      <!-- 右侧操作区域 -->
      <div class="header-actions">
        <HeaderActions />
      </div>
    </t-header>

    <!-- 主体区域 -->
    <t-layout class="mixed-body">
      <!-- 左侧：子菜单 -->
      <t-aside v-if="hasSubMenu" :width="sidebarWidth" class="mixed-sidebar"
        :class="{ collapsed: appStore.sidebarCollapsed }">
        <div class="sidebar-content">
          <!-- 子菜单标题 -->
          <!-- <div class="submenu-title">
            <t-icon :name="currentTopMenu?.meta?.icon" class="title-icon" />
            <span v-if="!appStore.sidebarCollapsed" class="title-text">
              {{ currentTopMenu?.meta?.title }}
            </span>
          </div> -->

          <!-- 子菜单列表 -->
          <MixedSideMenu :menu-data="currentSubMenus" :collapsed="appStore.sidebarCollapsed" />
        </div>

        <!-- 折叠按钮 -->
        <div class="collapse-trigger" @click="toggleSidebar">
          <t-icon :name="appStore.sidebarCollapsed ? 'chevron-right' : 'chevron-left'" />
        </div>
      </t-aside>

      <!-- 右侧：内容区域 -->
      <t-layout class="content-layout">
        <!-- 面包屑导航 -->
        <div v-if="appStore.showBreadcrumb" class="breadcrumb-wrapper">
          <t-breadcrumb>
            <t-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </t-breadcrumb-item>
          </t-breadcrumb>
        </div>

        <!-- 页面内容 -->
        <t-content class="main-content">
          <router-view v-slot="{ Component, route }">
            <transition name="page-transition" mode="out-in">
              <component :is="Component" :key="`${route.path}-${componentKey}`" />
            </transition>
          </router-view>
        </t-content>
      </t-layout>
    </t-layout>
  </t-layout>
</template>

<script setup>
import { watch, nextTick, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import MixedTopMenu from './components/MixedTopMenu.vue'
import MixedSideMenu from './components/MixedSideMenu.vue'
import HeaderActions from '../topbar/components/HeaderActions.vue'
import { useAppStore } from '@/store/modules/app'
import { constantRoutes } from '@/router/routes'

const route = useRoute()
const appStore = useAppStore()

// 控制组件重新渲染的key
const componentKey = ref(0)

// 当前选中的顶级菜单
const currentTopMenuKey = ref('')

// 侧边栏宽度
const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '240px'
})

// 当前顶级菜单项
const currentTopMenu = computed(() => {
  return constantRoutes.find(item => item.path === currentTopMenuKey.value)
})

// 当前子菜单列表
const currentSubMenus = computed(() => {
  return currentTopMenu.value?.children || []
})

// 是否有子菜单
const hasSubMenu = computed(() => {
  return currentSubMenus.value.length > 0
})

// 面包屑数据
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta.title,
    path: item.path === route.path ? null : item.path
  }))
})

// 处理顶级菜单变化
const handleTopMenuChange = (menuKey) => {
  currentTopMenuKey.value = menuKey
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 根据当前路由设置顶级菜单
const setCurrentTopMenu = () => {
  const currentPath = route.path

  // 查找当前路由属于哪个顶级菜单
  for (const topMenu of constantRoutes) {
    if (topMenu.path === currentPath) {
      currentTopMenuKey.value = topMenu.path
      return
    }

    // 检查子菜单
    if (topMenu.children) {
      for (const child of topMenu.children) {
        if (child.path === currentPath || currentPath.startsWith(child.path + '/')) {
          currentTopMenuKey.value = topMenu.path
          return
        }
      }
    }
  }
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 更新页面标题
    const title = route.meta?.title || 'TDesign Pro'
    appStore.setTitle(title)
    document.title = title

    // 设置当前顶级菜单
    setCurrentTopMenu()
  },
  { immediate: true }
)

// 监听刷新状态
watch(
  () => appStore.shouldRefresh,
  (shouldRefresh) => {
    if (shouldRefresh) {
      // 使用nextTick确保在下一个DOM更新周期重新渲染组件
      nextTick(() => {
        componentKey.value += 1
        // 重置刷新状态
        appStore.resetRefresh()
      })
    }
  }
)
</script>

<style scoped>
.mixed-layout {
  height: 100vh;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mixed-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.header-logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
  min-width: 200px;
}

.logo-image {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.header-nav {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
}

.mixed-body {
  flex: 1;
  overflow: hidden;
}

.mixed-sidebar {
  background: var(--td-bg-color-container);
  border-right: 1px solid var(--td-border-level-1-color);
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.submenu-title {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--td-border-level-1-color);
  background: var(--td-bg-color-page);
}

.title-icon {
  font-size: 18px;
  color: var(--td-brand-color);
  margin-right: 8px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.collapse-trigger {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.collapse-trigger:hover {
  background: var(--td-bg-color-container-hover);
  border-color: var(--td-brand-color);
}

.content-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb-wrapper {
  padding: 16px 24px;
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.main-content {
  flex: 1;
  background: var(--td-bg-color-page);
  padding: 24px;
  overflow: auto;
}

/* 页面切换动画 */
.page-transition-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(1.02);
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 折叠状态样式 */
.mixed-sidebar.collapsed .submenu-title {
  justify-content: center;
}

.mixed-sidebar.collapsed .title-text {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mixed-header {
    padding: 0 16px;
  }

  .header-logo {
    margin-right: 20px;
    min-width: 150px;
  }

  .logo-text {
    display: none;
  }

  .main-content {
    padding: 16px;
  }

  .breadcrumb-wrapper {
    padding: 12px 16px;
  }

  .mixed-sidebar {
    position: absolute;
    z-index: 1000;
    height: 100%;
  }
}
</style>