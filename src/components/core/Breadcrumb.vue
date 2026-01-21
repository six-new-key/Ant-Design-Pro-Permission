<template>
  <a-breadcrumb class="breadcrumb">
    <template #separator>
      <DoubleRightOutlined />
    </template>
    <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
      <router-link v-if="item.path && item.path !== route.path" :to="item.path" class="breadcrumb-link">
        <component v-if="item.icon" :is="item.icon" class="breadcrumb-icon" />
        {{ item.title }}
      </router-link>
      <span v-else class="breadcrumb-current">
        <component v-if="item.icon" :is="item.icon" class="breadcrumb-icon" />
        {{ item.title }}
      </span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DoubleRightOutlined, DashboardOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores'

const route = useRoute()
const userStore = useUserStore()

// 定义props，允许外部传入自定义的面包屑生成策略
const props = defineProps({
  // 面包屑生成策略：'hierarchy' 或 'matched'
  strategy: {
    type: String,
    default: 'hierarchy'
  },
  // 是否显示首页
  showHome: {
    type: Boolean,
    default: false
  },
  // 首页配置
  homeConfig: {
    type: Object,
    default: () => ({ title: '首页', path: '/home', icon: DashboardOutlined })
  }
})

// 生成面包屑导航
const breadcrumbItems = computed(() => {
  // 获取路由的实际跳转路径（考虑重定向）
  const getActualPath = (routeItem) => {
    // 如果路由有重定向，使用重定向路径
    if (routeItem.redirect) {
      return routeItem.redirect
    }
    // 否则使用原路径
    return routeItem.path
  }

  if (props.strategy === 'matched') {
    // 使用matched策略（适用于sidebar布局）
    const matched = route.matched.filter(item => item.meta && item.meta.title)
    const items = []

    // 添加首页
    if (props.showHome) {
      items.push(props.homeConfig)
    }

    // 添加匹配的路由
    matched.forEach(match => {
      if (match.path !== props.homeConfig.path && match.meta?.title) {
        items.push({
          title: match.meta.title,
          path: getActualPath(match),
          icon: match.meta?.icon
        })
      }
    })

    return items
  } else {
    // 使用hierarchy策略（适用于doublecolumn布局）
    const items = []
    const currentPath = route.path

    // 添加首页
    if (props.showHome) {
      items.push(props.homeConfig)
    }

    // 从 userStore 获取动态路由
    const allRoutes = userStore.menuRoutes || []

    // 查找路由层级
    const findRouteHierarchy = (routes, targetPath, hierarchy = []) => {
      for (const route of routes) {
        const currentHierarchy = [...hierarchy, route]

        if (route.path === targetPath) {
          return currentHierarchy
        }

        if (route.children && route.children.length > 0) {
          const found = findRouteHierarchy(route.children, targetPath, currentHierarchy)
          if (found.length > 0) {
            return found
          }
        }
      }
      return []
    }

    const hierarchy = findRouteHierarchy(allRoutes, currentPath)

    // 过滤掉没有标题的路由（通常是布局容器）
    hierarchy.forEach(routeItem => {
      if (routeItem.meta?.title) {
        items.push({
          title: routeItem.meta.title,
          path: getActualPath(routeItem),
          icon: routeItem.meta.icon
        })
      }
    })

    return items
  }
})
</script>

<style scoped lang="scss">
.breadcrumb {
  margin: 0;
  
  .breadcrumb-link,
  .breadcrumb-current {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  
  .breadcrumb-icon {
    margin-right: 2px;
  }
}
</style>