<template>
  <!-- 水平导航菜单 -->
  <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" @click="handleTopMenuClick"
    :theme="appStore.headerTheme">
    <a-menu-item v-for="item in visibleTopRoutes" :key="item.path">
      <template #icon>
        <component :is="item.meta?.icon" v-if="item.meta?.icon" />
      </template>
      {{ item.meta?.title || item.name }}
    </a-menu-item>
  </a-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const selectedKeys = ref([])

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
const visibleTopRoutes = computed(() => {
  return filterHiddenRoutes(userStore.menuRoutes)
})

// 处理顶部菜单点击事件
const handleTopMenuClick = ({ key }) => {
  const menuItem = visibleTopRoutes.value.find(item => item.path === key)
  if (menuItem) {
    // 如果是一级路由（没有子菜单），直接跳转
    if (!menuItem.children || menuItem.children.length === 0) {
      if (key.startsWith('http')) {
        window.open(key, '_blank')
      } else {
        router.push(key)
      }
    } else {
      // 如果有子菜单，跳转到第一个可访问的子路由
      const firstChild = findFirstAccessibleChild(menuItem)
      if (firstChild) {
        router.push(firstChild.path)
      }
    }

    // 通知侧边栏菜单更新
    appStore.setCurrentTopMenu(key)
  }
}

// 查找第一个可访问的子路由
const findFirstAccessibleChild = (route) => {
  if (!route.children || route.children.length === 0) {
    return route
  }

  for (const child of route.children) {
    if (!child.meta?.hidden) {
      if (child.children && child.children.length > 0) {
        return findFirstAccessibleChild(child)
      } else {
        return child
      }
    }
  }

  return null
}

// 监听路由变化，更新选中的顶部菜单
watch(() => route.path, (newPath) => {
  // 根据当前路由找到对应的顶部菜单项
  const topMenuItem = visibleTopRoutes.value.find(item => {
    if (item.path === newPath) {
      return true
    }
    // 检查是否是该菜单项的子路由
    if (item.children && item.children.length > 0) {
      return newPath.startsWith(item.path)
    }
    return false
  })

  if (topMenuItem) {
    selectedKeys.value = [topMenuItem.path]
    appStore.setCurrentTopMenu(topMenuItem.path)
  }
}, { immediate: true })
</script>