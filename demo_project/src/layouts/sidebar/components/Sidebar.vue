<template>
  <t-aside :width="sidebarWidth">
    <t-menu v-model:value="activeMenu" v-model:expanded="expandedKeys" :collapsed="collapsed" :theme="sidebarTheme"
      :width="sidebarWidth" :expand-mutex="false" class="sidebar-menu" @change="handleMenuChange"
      @expand="handleMenuExpand">
      <!-- Logo插槽 -->
      <template #logo>
        <div class="logo-section" :class="{ 'logo-section-collapsed': collapsed }">
          <svg-icon v-if="collapsed" name="logo" width="34px" height="34px" />
          <span v-if="!collapsed" class="system-title" :class="`system-title--${sidebarTheme}`"
            :style="{ color: getTextColor() }">{{title}}</span>
        </div>
      </template>

      <!-- 动态菜单渲染 -->
      <template v-for="route in visibleMenuRoutes" :key="route.name">
        <!-- 有子菜单的情况 -->
        <t-submenu v-if="route.children && route.children.length > 0" :value="route.path">
          <template #icon>
            <icon-font :name="route.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
          </template>
          <template #title>
            <span>{{ route.meta?.title || route.name }}</span>
          </template>
          <!-- 递归渲染子菜单 -->
          <template v-for="child in route.children" :key="child.name">
            <!-- 子菜单还有子级的情况 -->
            <t-submenu v-if="child.children && child.children.length > 0" :value="child.path">
              <template #icon>
                <icon-font :name="child.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
              </template>
              <template #title>
                <span>{{ child.meta?.title || child.name }}</span>
              </template>
              <template v-for="grandChild in child.children" :key="grandChild.name">
                <t-menu-item :value="grandChild.path">
                  <template #icon>
                    <icon-font :name="grandChild.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
                  </template>
                  {{ grandChild.meta?.title || grandChild.name }}
                </t-menu-item>
              </template>
            </t-submenu>
            <!-- 普通子菜单项 -->
            <t-menu-item v-else :value="child.path">
              <template #icon>
                <icon-font :name="child.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
              </template>
              {{ child.meta?.title || child.name }}
            </t-menu-item>
          </template>
        </t-submenu>

        <!-- 没有子菜单的情况 -->
        <t-menu-item v-else :value="route.path">
          <template #icon>
            <icon-font :name="route.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
          </template>
          {{ route.meta?.title || route.name }}
        </t-menu-item>
      </template>

      <!-- 操作区域插槽 -->
      <template #operations>
        <!-- 收缩按钮 -->
        <t-tooltip :content="collapsed ? '展开' : '收缩'">
          <t-button shape="square" variant="text" ghost @click="toggleSidebar" :style="{ color: getTextColor() }">
            <template #icon>
              <t-icon name="view-list" />
            </template>
          </t-button>
        </t-tooltip>
      </template>
    </t-menu>
  </t-aside>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { IconFont } from 'tdesign-icons-vue-next';
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { settings } from '@/settings'

const title = ref(settings.title)
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 侧边栏状态
const collapsed = computed(() => appStore.sidebarCollapsed)
const sidebarTheme = computed(() => appStore.sidebarTheme)
const globalTheme = computed(() => appStore.theme)

// 动态菜单数据
const menuRoutes = computed(() => {
  return userStore.menuRoutes.filter(route => {
    // 只过滤掉隐藏的路由，保留Layout路由让filterHiddenRoutes处理
    return !route.meta?.hide
  })
})

// 递归过滤隐藏的子菜单
const filterHiddenRoutes = (routes) => {
  if (!routes || !Array.isArray(routes)) return []

  const result = []

  for (const route of routes) {
    if (route.meta?.hide) continue

    // 特殊处理Layout路由：Layout路由本身不渲染，但处理其子菜单
    if (route.name === 'Layout' && route.children && route.children.length > 0) {
      const filteredChildren = filterHiddenRoutes(route.children)
      // 将Layout的子菜单直接添加到结果中
      result.push(...filteredChildren)
      continue
    }

    // 创建新的路由对象，避免修改原始数据
    const newRoute = { ...route }

    // 如果有子路由，递归过滤
    if (route.children && route.children.length > 0) {
      const filteredChildren = filterHiddenRoutes(route.children)

      // 如果过滤后没有可见的子菜单，则跳过父菜单
      if (filteredChildren.length === 0) continue

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

// 获取过滤后的菜单数据
const visibleMenuRoutes = computed(() => {
  return filterHiddenRoutes(menuRoutes.value)
})

// 当前激活的菜单项
const activeMenu = ref(route.path)

// 展开的菜单项
const expandedKeys = ref([])

// 初始化展开状态
const initExpandedKeys = () => {
  const keys = []

  // 根据当前路径和动态菜单数据构建展开的菜单键
  const findParentPaths = (routes, targetPath, parentPath = '') => {
    for (const routeItem of routes) {
      const currentPath = routeItem.path

      // 如果当前路径匹配目标路径或目标路径以当前路径开头
      if (targetPath === currentPath || targetPath.startsWith(currentPath + '/')) {
        if (parentPath) keys.push(parentPath)
        keys.push(currentPath)

        // 如果有子路由，继续递归查找
        if (routeItem.children && routeItem.children.length > 0) {
          findParentPaths(routeItem.children, targetPath, currentPath)
        }
        break
      }

      // 递归查找子路由
      if (routeItem.children && routeItem.children.length > 0) {
        findParentPaths(routeItem.children, targetPath, currentPath)
      }
    }
  }

  // 基于动态菜单数据查找展开路径
  if (visibleMenuRoutes.value.length > 0) {
    findParentPaths(visibleMenuRoutes.value, route.path)
  }

  expandedKeys.value = [...new Set(keys)] // 去重
}

// 侧边栏宽度
const sidebarWidth = computed(() => {
  return collapsed.value ? '64px' : '230px'
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  appStore.toggleSidebarCollapsed()
}

// 获取文字颜色
const getTextColor = () => {
  if (globalTheme.value === 'dark') {
    return 'var(--td-text-color-primary)'
  }
  return sidebarTheme.value === 'dark' ? 'var(--td-text-color-anti)' : 'var(--td-text-color-primary)'
}

// 处理菜单激活项变化
const handleMenuChange = (value) => {
  activeMenu.value = value

  // 手动处理路由跳转，避免DOM操作问题
  if (value && value !== route.path) {
    router.push(value).catch(err => {
      console.warn('路由跳转失败:', err)
    })
  }
}

// 处理菜单展开项变化
const handleMenuExpand = (value) => {
  expandedKeys.value = value
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
  // 只有在菜单数据存在时才初始化展开状态
  if (userStore.menuRoutes?.length > 0) {
    initExpandedKeys()
  }
})

// 初始化
onMounted(() => {
  // 设置初始激活菜单
  activeMenu.value = route.path

  // 确保菜单数据加载完成后再初始化
  if (userStore.menuRoutes?.length > 0) {
    initExpandedKeys()
  }
})

// 监听菜单数据变化
watch(() => userStore.menuRoutes, (newRoutes) => {
  if (newRoutes?.length > 0) {
    initExpandedKeys()
  }
}, { deep: true })
</script>

<style scoped>
.sidebar-menu {
  height: 100vh;
  border-right: 1px solid var(--td-border-level-1-color);
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-section-collapsed {
  justify-content: center;
}

.logo-section-collapsed .logo {
  margin-right: 0;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.system-title--light {
  color: var(--td-text-color-primary);
}

.system-title--dark {
  color: var(--td-text-color-anti);
}

:deep(.t-default-menu .t-menu__operations:not(:empty)) {
  border: none;
}

:deep(.t-default-menu .t-menu__logo:not(:empty)) {
  border: none;
}
</style>