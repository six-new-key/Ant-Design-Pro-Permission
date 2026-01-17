<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    :theme="appStore.sidebarTheme"
    :inline-collapsed="appStore.sidebarCollapsed"
    @click="handleClick"
  >
    <template v-for="route in visibleMenuRoutes" :key="route.path">
      <!-- 有子菜单的情况 -->
      <a-sub-menu v-if="route.children && route.children.length > 0" :key="route.path">
        <template #icon>
          <component :is="route.meta?.icon" v-if="route.meta?.icon" />
        </template>
        <template #title>{{ route.meta?.title || route.name }}</template>

        <!-- 二级菜单 -->
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
              {{ grandChild.meta?.title || grandChild.name }}
            </a-menu-item>
          </a-sub-menu>

          <!-- 二级菜单无子菜单 -->
          <a-menu-item v-else :key="child.path">
            <template #icon>
              <component :is="child.meta?.icon" v-if="child.meta?.icon" />
            </template>
            {{ child.meta?.title || child.name }}
          </a-menu-item>
        </template>
      </a-sub-menu>

      <!-- 没有子菜单的情况 (一级菜单) -->
      <a-menu-item v-else :key="route.path">
        <template #icon>
          <component :is="route.meta?.icon" v-if="route.meta?.icon" />
        </template>
        {{ route.meta?.title || route.name }}
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/stores'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const selectedKeys = ref([])
const openKeys = ref([])

// 递归过滤隐藏的子菜单并处理单一子菜单提升逻辑
const filterHiddenRoutes = (routes, parentPath = '') => {
  if (!routes || !Array.isArray(routes)) return []

  const result = []

  for (const route of routes) {
    if (route.meta?.hidden) continue

    // 解析完整路径，确保 key 是唯一的且可导航
    let fullPath = route.path
    if (!fullPath.startsWith('/') && !fullPath.startsWith('http')) {
      fullPath = parentPath + (parentPath === '/' ? '' : '/') + fullPath
    }

    // 创建新的路由对象，避免修改原始数据
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

// 获取处理后的菜单数据
const visibleMenuRoutes = computed(() => {
  return filterHiddenRoutes(userStore.menuRoutes)
})

// 菜单点击事件
const handleClick = ({ key }) => {
  if (key && key !== route.path) {
    if (key.startsWith('http')) {
      window.open(key, '_blank')
    } else {
      router.push(key)
    }
  }
}

// 根据当前路由设置选中项和展开项
const updateMenuState = () => {
  const currentPath = route.path
  selectedKeys.value = [currentPath]

  const matched = route.matched
  if (matched.length > 1 && !appStore.sidebarCollapsed) {
    const keys = matched
      .slice(0, -1)
      .map(item => item.path)
    
    openKeys.value = [...new Set([...openKeys.value, ...keys])]
  }
}

watch(
  () => route.path,
  () => {
    updateMenuState()
  },
  { immediate: true }
)

watch(
  () => appStore.sidebarCollapsed,
  (collapsed) => {
    if (collapsed) {
      openKeys.value = []
    } else {
      updateMenuState()
    }
  }
)
</script>