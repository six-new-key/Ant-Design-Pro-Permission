<template>
  <div class="first-column-menu">
    <a-menu v-model:selectedKeys="selectedKeys" mode="vertical" theme="dark" class="vertical-menu"
      @select="handleMenuSelect">
      <a-menu-item v-for="route in firstLevelRoutes" :key="route.path">
        <template #icon>
          <component :is="route.meta?.icon" v-if="route.meta?.icon" />
        </template>
        <div class="menu-title">{{ route.meta?.title || route.name }}</div>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore, useUserStore } from '@/stores'

const emit = defineEmits(['menu-select'])
const themeStore = useThemeStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
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

// 第一级路由（一级路由或多级路由的父路由）
const firstLevelRoutes = computed(() => {
  return filterHiddenRoutes(userStore.menuRoutes)
})

// 处理菜单选择
const handleMenuSelect = ({ key }) => {
  const clickedRoute = firstLevelRoutes.value.find(route => route.path === key)
  if (!clickedRoute) return

  // 如果是一级路由（没有子路由），直接跳转
  if (!clickedRoute.children || clickedRoute.children.length === 0) {
    router.push(clickedRoute.path)
    emit('menu-select', null) // 不显示第二列
  } else {
    // 如果是多级路由，显示第二列菜单
    emit('menu-select', clickedRoute)
    // 默认跳转到第一个子路由 (可选体验优化)
    // const firstChild = findFirstAccessibleChild(clickedRoute)
    // if (firstChild) router.push(firstChild.path)
  }
}

// 根据当前路由设置选中状态
const updateSelectedKey = (currentPath) => {
  // 查找当前路由对应的第一级菜单
  for (const firstRoute of firstLevelRoutes.value) {
    // 匹配自身
    if (currentPath === firstRoute.path) {
      selectedKeys.value = [firstRoute.path]
      emit('menu-select', firstRoute.children && firstRoute.children.length > 0 ? firstRoute : null)
      return
    }

    // 匹配子路由 (检查是否是当前路径的前缀，或者递归查找)
    // 由于filterHiddenRoutes处理了path，我们可以直接检查path前缀
    // 但为了更精确，我们检查children
    if (firstRoute.children && firstRoute.children.length > 0) {
        // 简单的前缀匹配通常足够，因为path已经处理为全路径
        if (currentPath.startsWith(firstRoute.path + '/') || currentPath === firstRoute.path) {
             selectedKeys.value = [firstRoute.path]
             emit('menu-select', firstRoute)
             return
        }
        
        // 递归查找作为后备 (处理某些path不规范的情况)
        const findInChildren = (routes) => {
            for (const child of routes) {
                if (child.path === currentPath) return true
                if (child.children && findInChildren(child.children)) return true
            }
            return false
        }
        
        if (findInChildren(firstRoute.children)) {
            selectedKeys.value = [firstRoute.path]
            emit('menu-select', firstRoute)
            return
        }
    }
  }
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  updateSelectedKey(newPath)
}, { immediate: true })
</script>

<style scoped lang="scss">
.first-column-menu {
  height: calc(100vh - $top-height);
  overflow-y: auto;
}

//隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

.vertical-menu {
  border: none;
  width: 100%;
  background: $bg-color !important;
  display: flex;
  flex-direction: column;
  align-items: center;

  :deep(.ant-menu-item) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px; // 设置固定宽度
    height: 56px; // 设置固定高度
    line-height: 1.2;
    padding: 0 !important; // 移除默认padding，确保居中

    .ant-menu-item-icon {
      margin-bottom: 8px;
    }

    .menu-title {
      width: 40px; // 设置具体宽度,考虑到padding的4px左右间距
      line-height: 1.2;
      font-size: v-bind('themeStore.baseConfig.fontSize + "px"');
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis; // 文字溢出显示省略号
      box-sizing: border-box; // 确保padding计入宽度
    }
  }
}
</style>