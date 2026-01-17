<template>
  <t-layout>
    <t-header>
      <TopbarMenu />
    </t-header>

    <t-content class="main-content">
      <div class="page-content">
        <router-view v-slot="{ Component, route }">
          <transition name="page-transition" mode="out-in">
            <component :is="Component" :key="`${route.path}-${componentKey}`" />
          </transition>
        </router-view>
      </div>
    </t-content>
  </t-layout>
</template>

<script setup>
import { watch, nextTick, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import TopbarMenu from './components/TopbarMenu.vue'
import { useAppStore } from '@/store/modules/app'

const route = useRoute()
const appStore = useAppStore()

// 控制组件重新渲染的key
const componentKey = ref(0)

// 面包屑数据
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta.title,
    path: item.path === route.path ? null : item.path
  }))
})


// 监听刷新状态
watch(
  () => appStore.shouldRefresh,
  (shouldRefresh) => {
    if (shouldRefresh) {
      // 使用nextTick确保在下一个DOM更新周期重新渲染组件
      nextTick(() => {
        componentKey.value += 1
        // 重置刷新状态
        appStore.resetRefresh()
      })
    }
  }
)
</script>

<style scoped>
:deep(.t-layout) {
  height: 100vh;
  width: 100%;
  max-width: 100%;
}

:deep(.t-layout__header) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.main-content {
  background: var(--td-bg-color-page);
  overflow: scroll;
  height: calc(100vh - 60px);
}

.page-content {
  padding: 20px;
}

/* 页面切换动画 */
.page-transition-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(1.02);
}

/* 滚动条样式 */
.page-content::-webkit-scrollbar {
  width: 6px;
}

.page-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.page-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.page-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .topbar-header {
    padding: 0 16px;
  }

  .header-logo {
    margin-right: 20px;
    min-width: 150px;
  }

  .logo-text {
    display: none;
  }

  .page-content {
    padding: 16px;
  }

  .breadcrumb-wrapper {
    padding: 12px 16px;
  }
}
</style>