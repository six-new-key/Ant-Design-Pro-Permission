<template>
  <t-header class="layout-header">
    <div class="header-content">
      <!-- 左侧区域 -->
      <div class="header-left">
        <!-- 面包屑导航 -->
        <t-breadcrumb v-if="appStore.breadcrumbVisible" class="breadcrumb">
          <t-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
            <template #icon>
              <icon-font :name="item.icon" size="15px" style="margin-top: 2px;" />
            </template>
            {{ item.title }}
          </t-breadcrumb-item>
        </t-breadcrumb>
      </div>

      <!-- 右侧区域 -->
      <div class="header-right">
        <t-space>
          <!-- 搜索框 -->
          <div class="search-trigger" @click="openSearchDialog">
            <t-icon name="search" class="search-icon" />
            <span class="search-placeholder">搜索</span>
            <span class="search-shortcut">Ctrl K</span>
          </div>

          <!-- 刷新按钮 -->
          <t-tooltip content="刷新">
            <t-button theme="default" shape="square" variant="text" @click="handleRefresh">
              <template #icon>
                <IconFont name="refresh" size="14px" />
              </template>
            </t-button>
          </t-tooltip>

          <!-- 主题切换按钮 -->
          <t-tooltip content="切换主题">
            <t-button theme="default" shape="square" variant="text" @click="handleThemeChange">
              <template #icon>
                <IconFont :name="appStore.themeMode === 'dark' ? 'sunny' : 'moon'" size="14px" />
              </template>
            </t-button>
          </t-tooltip>

          <!-- 语言切换，使用下拉菜单 -->
          <t-dropdown :options="langOptions" :min-column-width="90">
            <t-button theme="default" shape="square" variant="text">
              <template #icon>
                <IconFont name="translate-1" size="14px" />
              </template>
            </t-button>
          </t-dropdown>

          <!-- 全屏切换 -->
          <t-tooltip :content="isFullscreen ? '退出全屏' : '进入全屏'">
            <t-button theme="default" shape="square" variant="text" @click="toggleFullscreen">
              <template #icon>
                <t-icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
              </template>
            </t-button>
          </t-tooltip>

          <!-- 用户信息下拉菜单 -->
          <UserDropdown />
        </t-space>
      </div>
    </div>
  </t-header>

  <!-- 页面标签组件 -->
  <PageTags v-if="appStore.pageTagsVisible" />

  <!-- 搜索对话框组件 -->
  <SearchDialog v-model="showSearchDialog" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IconFont } from 'tdesign-icons-vue-next';
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import PageTags from '@/components/page-tags/PageTags.vue'
import SearchDialog from '@/components/search-dialog/SearchDialog.vue'
import UserDropdown from '@/components/custom/UserDropdown.vue'
import { themeChangeWithAnimation } from '@/utils/theme'

const route = useRoute()
const appStore = useAppStore()

// 搜索相关
const showSearchDialog = ref(false)

// 全屏相关
const isFullscreen = ref(false)

// 面包屑导航
const breadcrumbItems = computed(() => {
  const items = []

  // 获取匹配的路由层级
  const matched = route.matched.filter(item => item.meta && item.meta.title)

  // 总是添加首页作为第一项（除非当前就是首页）
  if (route.path !== '/' && route.path !== '/home') {
    items.push({ title: '首页', path: '/home', icon: 'home' })
  }

  // 添加路由层级中的每一级
  matched.forEach((match, index) => {
    // 跳过根路径
    if (match.path === '/') return

    // 对于中间层级，如果没有实际页面组件，使用 # 作为路径
    let itemPath = match.path
    if (index < matched.length - 1 && !match.component) {
      itemPath = '#'
    }

    items.push({
      title: match.meta.title,
      path: itemPath,
      icon: match.meta.icon
    })
  })

  return items
})

// 语言切换
const langOptions = ref([
  {
    content: '中文',
    value: 'zhcn',
    active: appStore.getLang() === 'zhcn',
    onClick: () => {
      changeLang('zhcn')
    },
    prefixIcon: (h) => {
      if (appStore.getLang() === 'zhcn') {
        return h(IconFont, { name: 'check', size: '14px' })
      }
      // 使用正确的 TNode 函数签名，接收 h 作为参数
      return null;
    }
  },
  {
    content: '英文',
    value: 'en',
    active: appStore.getLang() === 'en',
    onClick: () => {
      changeLang('en')
    },
    prefixIcon: (h) => {
      if (appStore.getLang() === 'en') {
        return h(IconFont, { name: 'check', size: '14px' })
      }
      // 使用正确的 TNode 函数签名，接收 h 作为参数
      return null;
    }
  }
])

// 切换语言
const changeLang = (value) => {
  appStore.setLang(value)
  appStore.langChange(value)
}

// 主题切换
const handleThemeChange = (e) => {
  themeChangeWithAnimation(e, () => {
    appStore.setThemeMode(appStore.themeMode === 'dark' ? 'light' : 'dark')
  })
}

// 打开搜索对话框
const openSearchDialog = () => {
  showSearchDialog.value = true
}

// 刷新页面
const handleRefresh = () => {
  appStore.triggerRefresh()
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

</script>

<style scoped>
.layout-header {
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  height: 52px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.breadcrumb {
  margin: 0;
}

/* 搜索触发器样式 */
.search-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--td-bg-color-container-hover);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 115px;
}

.search-trigger:hover {
  background: var(--td-bg-color-container-active);
  border-color: var(--td-border-level-2-color);
}

.search-icon {
  color: var(--td-text-color-placeholder);
  font-size: 15px;
}

.search-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
  flex: 1;
}

.search-shortcut {
  color: var(--td-text-color-placeholder);
  font-size: 10px;
  background: var(--td-mask-background);
  padding: 3px 5px;
  border-radius: 4px;
  max-height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: var(--td-text-color-primary);
}

/* 深色主题适配 */
:global(.t-theme-dark) .layout-header {
  background: var(--td-bg-color-container);
  border-bottom-color: var(--td-border-level-1-color);
}

:global(.t-theme-dark) .username {
  color: var(--td-text-color-primary);
}
</style>