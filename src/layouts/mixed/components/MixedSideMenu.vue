<template>
  <div class="mixed-side-menu">
    <!-- 侧边菜单 -->
    <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline" :theme="appStore.sidebarTheme"
      class="side-menu">
      <template v-for="route in visibleRoutes" :key="route.path">
        <!-- 有子菜单的情况 -->
        <a-sub-menu v-if="route.children && route.children.length > 0" :key="route.path">
          <template #icon>
            <component :is="route.meta?.icon" v-if="route.meta?.icon" />
          </template>
          <template #title>{{ route.meta?.title || route.name }}</template>

          <template v-for="child in route.children" :key="child.path">
            <!-- 二级菜单有子菜单 (三级) -->
            <a-sub-menu v-if="child.children && child.children.length > 0" :key="child.path">
              <template #icon>
                <component :is="child.meta?.icon" v-if="child.meta?.icon" />
              </template>
              <template #title>{{ child.meta?.title || child.name }}</template>

              <!-- 三级菜单 -->
              <a-menu-item v-for="grandChild in child.children" :key="grandChild.path">
                <template #icon>
                  <component :is="grandChild.meta?.icon" v-if="grandChild.meta?.icon" />
                </template>
                <router-link :to="grandChild.path">
                  {{ grandChild.meta?.title || grandChild.name }}
                </router-link>
              </a-menu-item>
            </a-sub-menu>

            <!-- 二级菜单无子菜单 -->
            <a-menu-item v-else :key="child.path">
              <template #icon>
                <component :is="child.meta?.icon" v-if="child.meta?.icon" />
              </template>
              <router-link :to="child.path">
                {{ child.meta?.title || child.name }}
              </router-link>
            </a-menu-item>
          </template>
        </a-sub-menu>

        <!-- 没有子菜单的情况 -->
        <a-menu-item v-else :key="route.path">
          <template #icon>
            <component :is="route.meta?.icon" v-if="route.meta?.icon" />
          </template>
          <router-link :to="route.path">
            {{ route.meta?.title || route.name }}
          </router-link>
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const selectedKeys = ref([route.path])
const openKeys = ref([])

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

// 根据当前选中的顶部菜单获取对应的侧边栏菜单
const visibleRoutes = computed(() => {
  const currentTopMenuKey = appStore.currentTopMenu
  if (!currentTopMenuKey) {
    return []
  }

  // 先获取处理后的完整菜单树
  const allProcessedRoutes = filterHiddenRoutes(userStore.menuRoutes)

  // 找到对应的顶部菜单路由
  const topMenuRoute = allProcessedRoutes.find(route => route.path === currentTopMenuKey)
  
  if (!topMenuRoute || !topMenuRoute.children) {
    return []
  }

  return topMenuRoute.children
})

// 根据当前路由自动展开菜单和设置选中状态
const updateMenuState = (currentPath) => {
  selectedKeys.value = [currentPath]

  // 查找父级菜单并自动展开
  const findParentKeys = (routes, targetPath, parentKeys = []) => {
    for (const route of routes) {
      if (route.path === targetPath) {
        return parentKeys
      }
      if (route.children && route.children.length > 0) {
        const found = findParentKeys(route.children, targetPath, [...parentKeys, route.path])
        if (found.length > 0) {
          return found
        }
      }
    }
    return []
  }

  const parentKeys = findParentKeys(visibleRoutes.value, currentPath)
  openKeys.value = [...new Set([...openKeys.value, ...parentKeys])]
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  updateMenuState(newPath)
}, { immediate: true })

// 监听顶部菜单变化，重置侧边栏状态
watch(() => appStore.currentTopMenu, () => {
  // 延迟执行，确保visibleRoutes已更新
  setTimeout(() => {
    updateMenuState(route.path)
  }, 0)

  // 如果当前路由不属于新选中的顶部菜单，则清空选中状态（或者什么都不做，因为用户点击顶部菜单通常会触发跳转）
  // 注意：handleTopMenuClick 会触发跳转，跳转会触发 route.path 变化，进而触发 updateMenuState
})
</script>