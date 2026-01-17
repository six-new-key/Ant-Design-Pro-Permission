<template>
  <div class="mixed-side-menu">
    <t-menu 
      v-model:value="activeMenu"
      :collapsed="collapsed"
      theme="light"
      class="side-menu"
    >
      <template v-for="item in menuData" :key="item.path">
        <!-- 有子菜单的情况 -->
        <t-submenu 
          v-if="item.children && item.children.length > 0 && !item.meta?.hidden"
          :value="item.path"
          :title="item.meta?.title"
        >
          <template #icon>
            <t-icon :name="item.meta?.icon" v-if="item.meta?.icon" />
          </template>
          
          <template v-for="child in item.children" :key="child.path">
            <t-menu-item 
              v-if="!child.meta?.hidden"
              :value="child.path"
              @click="handleMenuClick(child.path)"
            >
              <template #icon>
                <t-icon :name="child.meta?.icon" v-if="child.meta?.icon" />
              </template>
              {{ child.meta?.title }}
            </t-menu-item>
          </template>
        </t-submenu>
        
        <!-- 没有子菜单的情况 -->
        <t-menu-item 
          v-else-if="!item.meta?.hidden"
          :value="item.path"
          @click="handleMenuClick(item.path)"
        >
          <template #icon>
            <t-icon :name="item.meta?.icon" v-if="item.meta?.icon" />
          </template>
          {{ item.meta?.title }}
        </t-menu-item>
      </template>
    </t-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Props
const props = defineProps({
  menuData: {
    type: Array,
    default: () => []
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

// 当前激活的菜单
const activeMenu = ref('')

// 处理菜单点击
const handleMenuClick = (path) => {
  if (path && path !== route.path) {
    router.push(path)
  }
}

// 根据当前路由设置激活菜单
const setActiveMenu = () => {
  const currentPath = route.path
  
  // 查找匹配的菜单项
  for (const item of props.menuData) {
    if (item.path === currentPath) {
      activeMenu.value = currentPath
      return
    }
    
    // 检查子菜单
    if (item.children) {
      for (const child of item.children) {
        if (child.path === currentPath || currentPath.startsWith(child.path + '/')) {
          activeMenu.value = currentPath
          return
        }
      }
    }
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

// 监听菜单数据变化
watch(
  () => props.menuData,
  () => {
    setActiveMenu()
  },
  { immediate: true }
)
</script>

<style scoped>
.mixed-side-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.side-menu {
  border-right: none;
  background: transparent;
  height: 100%;
}

/* 自定义菜单样式 */
:deep(.t-menu) {
  background: transparent;
}

:deep(.t-menu__item) {
  margin: 4px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.t-menu__item:hover) {
  background: var(--td-bg-color-container-hover);
}

:deep(.t-menu__item.t-is-active) {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

:deep(.t-submenu__title) {
  margin: 4px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.t-submenu__title:hover) {
  background: var(--td-bg-color-container-hover);
}

:deep(.t-submenu.t-is-active .t-submenu__title) {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

:deep(.t-submenu__content) {
  background: transparent;
}

:deep(.t-submenu .t-menu__item) {
  margin: 2px 24px;
  padding-left: 32px;
}

/* 折叠状态样式 */
:deep(.t-menu--collapsed) {
  width: 64px;
}

:deep(.t-menu--collapsed .t-menu__item) {
  margin: 4px 8px;
  justify-content: center;
}

:deep(.t-menu--collapsed .t-submenu__title) {
  margin: 4px 8px;
  justify-content: center;
}

/* 滚动条样式 */
.mixed-side-menu::-webkit-scrollbar {
  width: 4px;
}

.mixed-side-menu::-webkit-scrollbar-track {
  background: transparent;
}

.mixed-side-menu::-webkit-scrollbar-thumb {
  background: var(--td-scrollbar-color);
  border-radius: 2px;
}

.mixed-side-menu::-webkit-scrollbar-thumb:hover {
  background: var(--td-text-color-disabled);
}
</style>