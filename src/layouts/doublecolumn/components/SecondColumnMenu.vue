<template>
  <div class="second-column-menu" v-if="parentRoute">
    <!-- 项目名称 -->
    <transition name="slide-fade">
      <div v-if="!appStore.sidebarCollapsed" class="project-title"
        :class="{ 'text-white': appStore.sidebarTheme === 'dark' }">
        {{ parentRoute?.meta?.title || parentRoute?.name || settings.projectName }}
      </div>
    </transition>

    <!-- 子菜单列表 -->
    <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline" :theme="appStore.sidebarTheme"
      class="sub-menu">
      <!-- 使用递归组件渲染菜单，支持任意层级 -->
      <RecursiveMenu
        v-for="child in visibleChildren"
        :key="child.path"
        :menu-item="child"
      />
    </a-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'
import { theme } from 'ant-design-vue'
import { settings } from '@/settings'
import RecursiveMenu from '@/components/core/RecursiveMenu.vue'

const props = defineProps({
  parentRoute: {
    type: Object,
    default: null
  }
})

const { token } = theme.useToken()
const appStore = useAppStore()
const route = useRoute()
const selectedKeys = ref([route.path])
const openKeys = ref([])

// 处理可见的子路由
// 由于 FirstColumnMenu 已经对路由进行了 filterHiddenRoutes 处理（包含路径补全、隐藏过滤、单子级提升），
// 这里只需要简单返回 children 即可。为了保险起见，保留基础的非空检查。
const visibleChildren = computed(() => {
  if (!props.parentRoute || !props.parentRoute.children) {
    return []
  }

  // 此时 parentRoute.children 已经是处理过的“视图模型”，无需再次递归处理
  // 如果需要排序，可以在这里加，或者假设上层已排好序
  // 保持原有排序逻辑以防万一
  return [...props.parentRoute.children].sort((a, b) => {
      const orderA = a.meta?.order || 999
      const orderB = b.meta?.order || 999
      return orderA - orderB
    })
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
        const found = findParentKeys(route.children, targetPath, [...parentKeys, 'sub-' + route.path])
        if (found.length > 0) {
          return found
        }
      }
    }
    return []
  }

  const parentKeys = findParentKeys(visibleChildren.value, currentPath)
  openKeys.value = parentKeys
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  updateMenuState(newPath)
}, { immediate: true })

// 监听父路由变化，重置菜单状态
watch(() => props.parentRoute, () => {
  if (props.parentRoute) {
    // 延迟一下确保 DOM 更新或数据稳定
    setTimeout(() => {
        updateMenuState(route.path)
    }, 0)
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.second-column-menu {
  height: 100%;
  overflow-y: auto;
}

.project-title {
  height: $top-height;
  display: flex;
  padding-left: 28px;
  align-items: center;
  font-weight: bold;
  color: v-bind('token.colorText');

  &.text-white {
    color: #fff;
  }
}

/* 从左至右滑入动画 */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.sub-menu {
  border: none;
  background: transparent;
}
</style>