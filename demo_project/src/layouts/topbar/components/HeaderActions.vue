<template>
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

      <!-- 全屏切换 -->
      <t-tooltip :content="isFullscreen ? '退出全屏' : '进入全屏'">
        <t-button theme="default" shape="square" variant="text" @click="toggleFullscreen">
          <template #icon>
            <t-icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
          </template>
        </t-button>
      </t-tooltip>

      <!-- 用户信息下拉菜单 -->
      <div>
        <!-- <UserDropdown /> -->
        <t-dropdown :options="[{ content: '操作一', value: 1 }, { content: '操作二', value: 2 }]">
          <t-button>更多...</t-button>
        </t-dropdown>
      </div>
    </t-space>
  </div>

  <!-- 搜索对话框组件 -->
  <SearchDialog v-model="showSearchDialog" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { IconFont } from 'tdesign-icons-vue-next';
import { useAppStore } from '@/store/modules/app'
import SearchDialog from '@/components/search-dialog/SearchDialog.vue'
import UserDropdown from '@/components/custom/UserDropdown.vue'

const appStore = useAppStore()

// 搜索相关
const showSearchDialog = ref(false)

// 全屏相关
const isFullscreen = ref(false)

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
.header-right {
  display: flex;
  align-items: center;
  min-width: 220px;
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
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 115px;
}


.search-icon {
  font-size: 15px;
}

.search-placeholder {
  font-size: 12px;
  flex: 1;
}

.search-shortcut {
  font-size: 10px;
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
}
</style>