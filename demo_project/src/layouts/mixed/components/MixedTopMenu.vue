<template>
  <div class="mixed-top-menu">
    <t-menu 
      v-model:value="activeMenu"
      mode="horizontal"
      theme="light"
      class="horizontal-menu"
      @change="handleMenuChange"
    >
      <t-menu-item 
        v-for="item in topMenuItems" 
        :key="item.path"
        :value="item.path"
        :disabled="!item.children || item.children.length === 0"
      >
        <template #icon>
          <t-icon :name="item.meta?.icon" v-if="item.meta?.icon" />
        </template>
        {{ item.meta?.title }}
      </t-menu-item>
    </t-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { constantRoutes } from '@/router/routes'

const route = useRoute()

// 定义事件
const emit = defineEmits(['menu-change'])

// 当前激活的菜单
const activeMenu = ref('')

// 顶级菜单数据 - 只显示有子菜单的项目
const topMenuItems = computed(() => {
  return constantRoutes.filter(item => {
    // 过滤掉登录页、重定向路由和隐藏的路由
    return item.path !== '/login' && 
           item.path !== '/' && 
           !item.meta?.hidden &&
           item.meta?.title &&
           item.children &&
           item.children.length > 0
  })
})

// 处理菜单变化
const handleMenuChange = (value) => {
  activeMenu.value = value
  emit('menu-change', value)
}

// 根据当前路由设置激活菜单
const setActiveMenu = () => {
  const currentPath = route.path
  
  // 查找当前路由属于哪个顶级菜单
  for (const topMenu of topMenuItems.value) {
    // 检查是否是顶级菜单本身
    if (topMenu.path === currentPath) {
      activeMenu.value = topMenu.path
      emit('menu-change', topMenu.path)
      return
    }
    
    // 检查子菜单
    if (topMenu.children) {
      for (const child of topMenu.children) {
        if (child.path === currentPath || currentPath.startsWith(child.path + '/')) {
          activeMenu.value = topMenu.path
          emit('menu-change', topMenu.path)
          return
        }
      }
    }
  }
  
  // 如果没有找到匹配的，默认选择第一个
  if (topMenuItems.value.length > 0) {
    const firstMenu = topMenuItems.value[0]
    activeMenu.value = firstMenu.path
    emit('menu-change', firstMenu.path)
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    setActiveMenu()
  },
  { immediate: true }
)
</script>

<style scoped>
.mixed-top-menu {
  flex: 1;
  display: flex;
  align-items: center;
}

.horizontal-menu {
  border-bottom: none;
  background: transparent;
}

/* 自定义菜单样式 */
:deep(.t-menu--horizontal) {
  border-bottom: none;
}

:deep(.t-menu__item) {
  margin: 0 8px;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
}

:deep(.t-menu__item:hover) {
  background: var(--td-bg-color-container-hover);
}

:deep(.t-menu__item.t-is-active) {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

:deep(.t-menu__item.t-is-active::after) {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--td-brand-color);
  border-radius: 2px;
}

:deep(.t-menu__item.t-is-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.t-menu__item.t-is-disabled:hover) {
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  :deep(.t-menu__item) {
    margin: 0 4px;
    padding: 0 12px;
  }
}

@media (max-width: 768px) {
  .mixed-top-menu {
    display: none;
  }
}
</style>