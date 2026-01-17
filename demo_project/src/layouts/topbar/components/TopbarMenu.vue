<template>
  <t-head-menu v-model:value="activeMenu" v-model:expanded="expandedKeys" :theme="sidebarTheme" :default-value="'/home'"
    @change="handleMenuChange" expand-type="popup">
    <template #logo>
      <div class="header-logo">
        <svg-icon name="logo" width="35px" height="35px" />
        <span :style="{ color: getTextColor() }" class="logo-text">TDesign Pro</span>
      </div>
    </template>

    <!-- 动态渲染菜单 -->
    <template v-for="route in menuRoutes" :key="route.name">
      <!-- 一层菜单 -->
      <t-menu-item v-if="!route.children" :value="route.path">
        <template #icon>
          <icon-font :name="route.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
        </template>
        {{ route.meta?.title || route.name }}
      </t-menu-item>

      <!-- 二层菜单 -->
      <t-submenu v-else-if="route.children && !hasThirdLevel(route)" :value="route.path"
        :title="route.meta?.title || route.name">
        <template #icon>
          <icon-font :name="route.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
        </template>
        <t-menu-item v-for="child in route.children" :key="child.name" :value="child.path">
          <template #icon>
            <icon-font :name="child.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
          </template>
          {{ child.meta?.title || child.name }}
        </t-menu-item>
      </t-submenu>

      <!-- 三层菜单 -->
      <t-submenu v-else-if="route.children && hasThirdLevel(route)" :value="route.path"
        :title="route.meta?.title || route.name">
        <template #icon>
          <icon-font :name="route.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
        </template>
        <template v-for="child in route.children" :key="child.name">
          <t-submenu :value="child.path" :title="child.meta?.title || child.name">
            <template #icon>
              <icon-font :name="child.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
            </template>
            <t-menu-item v-for="grandChild in child.children" :key="grandChild.name" :value="grandChild.path">
              <template #icon>
                <icon-font :name="grandChild.meta?.icon || 'default'" size="17px" style="margin-top: 4px;" />
              </template>
              {{ grandChild.meta?.title || grandChild.name }}
            </t-menu-item>
          </t-submenu>
        </template>
      </t-submenu>
    </template>

    <template #operations>
      <HeaderActions />
    </template>
  </t-head-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import HeaderActions from './HeaderActions.vue'
import { IconFont } from 'tdesign-icons-vue-next';
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { constantRoutes } from '@/router/routes'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
// 当前激活的菜单项
const activeMenu = ref('')
// 展开的菜单项
const expandedKeys = ref([])
// 菜单栏主题状态从store获取
const sidebarTheme = computed(() => appStore.sidebarTheme)
// 全局主题状态从store获取
const globalTheme = computed(() => appStore.theme)

// 菜单路由数据
const menuRoutes = computed(() => {
  // 过滤掉登录页面和Layout父路由，只显示Layout的children
  const layoutRoute = constantRoutes.find(route => route.name === 'Layout')
  if (layoutRoute && layoutRoute.children) {
    return layoutRoute.children.filter(route => !route.meta?.hide)
  }
  return constantRoutes.filter(route => !route.meta?.hide && route.name !== 'Login')
})

// 判断是否有三层菜单
const hasThirdLevel = (route) => {
  return route.children && route.children.some(child => child.children && child.children.length > 0)
}

// 获取文字颜色：优先考虑全局主题，然后考虑菜单栏主题
const getTextColor = () => {
  // 如果全局主题是dark，使用暗色主题的文字颜色
  if (globalTheme.value === 'dark') {
    return 'var(--td-text-color-primary)'
  }
  // 如果全局主题是light，根据菜单栏主题决定颜色
  return sidebarTheme.value === 'dark' ? 'var(--td-text-color-anti)' : 'var(--td-text-color-primary)'
}

// 处理菜单点击
const handleMenuChange = (value) => {
  console.log('菜单切换:', value)

  // 直接使用路径进行导航
  if (value && value !== route.path) {
    router.push(value)
  }
}

// 监听路由变化，更新激活菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath

  // 设置展开的菜单项
  const expandedPaths = []

  // 递归查找当前路径的所有父级菜单
  const findAllParentPaths = (routes, targetPath, currentParentPath = '') => {
    for (const route of routes) {
      const fullPath = currentParentPath + route.path

      if (route.children) {
        // 检查直接子路由是否匹配
        const directMatch = route.children.some(child => {
          const childPath = currentParentPath + child.path
          return childPath === targetPath
        })

        if (directMatch) {
          expandedPaths.push(fullPath)
        }

        // 检查嵌套子路由是否匹配
        const hasNestedMatch = route.children.some(child => {
          if (child.children) {
            return child.children.some(grandChild => {
              const grandChildPath = currentParentPath + grandChild.path
              return grandChildPath === targetPath
            })
          }
          return false
        })

        if (hasNestedMatch) {
          expandedPaths.push(fullPath)
          // 找到匹配的二级菜单也要展开
          route.children.forEach(child => {
            if (child.children) {
              const childHasMatch = child.children.some(grandChild => {
                const grandChildPath = currentParentPath + grandChild.path
                return grandChildPath === targetPath
              })
              if (childHasMatch) {
                expandedPaths.push(currentParentPath + child.path)
              }
            }
          })
        }

        // 递归处理子路由
        findAllParentPaths(route.children, targetPath, currentParentPath)
      }
    }
  }

  findAllParentPaths(menuRoutes.value, newPath)
  expandedKeys.value = [...new Set(expandedPaths)] // 去重
}, { immediate: true })
</script>

<style scoped lang="scss">
.header-logo {
  display: flex;
  align-items: center;
  min-width: 170px;

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    margin-left: 10px;
    color: var(--td-text-color-primary);
  }
}
</style>