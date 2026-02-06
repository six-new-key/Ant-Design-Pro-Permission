<template>
  <div class="cache-monitor-container" :style="cssVars">
    <!-- 统计卡片区 -->
    <a-card title="缓存统计" class="statistics-card" :loading="statisticsLoading">
      <a-row :gutter="[16, 16]">
        <!-- 总缓存数量 -->
        <a-col :xs="12" :sm="8" :md="6" :lg="3">
          <div class="stat-item-circle">
            <a-progress 
              type="circle" 
              :percent="99"
              stroke-color="#1890ff"
              :size="80"
              :stroke-width="5"
              :show-info="false">
            </a-progress>
            <div class="circle-value-overlay">{{ statistics?.totalKeys || 0 }}</div>
            <div class="stat-label">总缓存数量</div>
          </div>
        </a-col>

        <!-- 动态分组统计 -->
        <a-col v-for="category in categoryStats" :key="category.code" :xs="12" :sm="8" :md="6" :lg="3">
          <div class="stat-item-circle">
            <a-progress 
              type="circle" 
              :percent="statistics?.totalKeys ? Math.round((category.count / statistics.totalKeys) * 100) : 0"
              stroke-color="#1890ff"
              :size="80"
              :stroke-width="5"
              :show-info="false">
            </a-progress>
            <div class="circle-value-overlay">{{ category.count }}</div>
            <div class="stat-label">{{ category.name }}</div>
          </div>
        </a-col>

        <!-- 内存占用 -->
        <a-col :xs="12" :sm="8" :md="6" :lg="3">
          <div class="stat-item-circle">
            <a-progress 
              type="circle" 
              :percent="99"
              stroke-color="#1890ff"
              :size="80"
              :stroke-width="5"
              :show-info="false">
            </a-progress>
            <div class="circle-value-overlay memory">{{ formatMemoryValue(statistics?.memoryUsageFormatted) }}</div>
            <div class="stat-label">内存占用 / {{ getMemoryUnit(statistics?.memoryUsageFormatted) }}</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 缓存分类统计区 -->
    <a-card class="statistics-detail-card">
      <template #title>
        <div class="title-postion">
          <div class="left">
            <a-button type="primary" @click="handleRefresh" :loading="statisticsLoading">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
          </div>
          <div class="center">
            <a-space :size="4">
              <ClockCircleOutlined style="color: var(--color-text-3); font-size: 14px;" />
              <span class="last-update-time">{{ formatLastUpdateTime() }}</span>
            </a-space>
          </div>
          <div class="right">
            <a-button danger @click="handleClearAllCache">
              <template #icon>
                <DeleteOutlined />
              </template>
              清除所有缓存
            </a-button>
          </div>
        </div>
      </template>

      <a-collapse v-model:activeKey="activeKeys" ghost>
        <!-- 动态渲染分组折叠面板 -->
        <a-collapse-panel v-for="category in categoryStats" :key="category.code">
          <template #header>
            <div class="collapse-header-wrapper">
              <span class="collapse-title">{{ category.name }}</span>
              <a-badge :count="category.count" :number-style="{ backgroundColor: category.color }" />
            </div>
          </template>
          <template #extra>
            <a-button 
              type="link" 
              danger 
              size="small"
              @click.stop="handleClearCacheByCategory(category.code, category.name)">
              <template #icon>
                <DeleteOutlined />
              </template>
              清除
            </a-button>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col v-for="type in getTypesByCategory(category.code)" :key="type.code" :xs="24" :sm="12" :md="8" :lg="4">
              <a-card size="small" hoverable @click="filterByType(type.code)" class="type-card-clickable">
                <a-statistic :title="type.name" :value="statistics?.cacheCountByType?.[type.code] || 0">
                  <template #prefix>
                    <a-tag>{{ type.code }}</a-tag>
                  </template>
                  <template #suffix>
                    <RightOutlined style="font-size: 12px; color: var(--color-text-tertiary);" />
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { theme } from 'ant-design-vue'
import {
  ReloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { useCacheStatistics } from './composables/useCacheStatistics'
import { useCacheTypes } from './composables/useCacheTypes'
import { useCacheClear } from './composables/useCacheClear'
import './styles/cache.scss'

const router = useRouter()

const { useToken } = theme
const { token } = useToken()

/**
 * CSS 变量（用于主题适配）
 */
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-shadow': t.colorBgSpotlight || 'rgba(0, 0, 0, 0.15)'
  }
})

// 预定义的颜色池（使用轻柔的颜色）
const COLOR_POOL = [
  '#69b1ff', // 浅蓝
  '#95de64', // 浅绿
  '#ffd666', // 浅黄
  '#ff9c6e', // 浅橙
  '#b37feb', // 浅紫
  '#5cdbd3', // 浅青
  '#ff85c0', // 浅粉
  '#ffa940', // 浅橘
  '#bae637', // 浅黄绿
  '#85a5ff'  // 浅靛蓝
]

// 根据分组代码获取颜色（使用哈希算法保证同一分组颜色一致）
const getCategoryColor = (code) => {
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLOR_POOL[Math.abs(hash) % COLOR_POOL.length]
}

// 缓存类型配置
const { cacheTypes, loadCacheTypes, getTypesByCategory } = useCacheTypes()

// 统计相关
const { statistics, loading: statisticsLoading, loadStatistics } = useCacheStatistics()

// 最后更新时间
const lastUpdateTime = ref(null)

// 定时刷新相关
let refreshTimer = null
const autoRefreshInterval = 60000 // 1分钟

/**
 * 刷新数据
 */
async function handleRefresh() {
  await loadStatistics()
  updateActiveKeys()
  // 更新最后刷新时间
  lastUpdateTime.value = new Date()
}

// 缓存清理相关（传入刷新回调）
const { handleClearCacheByCategory, handleClearAllCache } = useCacheClear(handleRefresh)

// 计算属性：分组统计数据（从后端返回的categoryStats，添加前端颜色）
const categoryStats = computed(() => {
  return (statistics.value?.categoryStats || []).map(cat => ({
    ...cat,
    color: getCategoryColor(cat.code)
  }))
})

// 折叠面板激活的key（默认展开所有分组）
const activeKeys = ref([])

// 监听categoryStats变化，自动展开所有分组
const updateActiveKeys = () => {
  activeKeys.value = categoryStats.value.map(cat => cat.code)
}

/**
 * 点击统计卡片，跳转到缓存列表页面
 */
function filterByType(typeCode) {
  router.push({
    path: '/monitor/cache-list',
    query: { type: typeCode }
  })
}

/**
 * 格式化内存值（只返回数字部分）
 */
function formatMemoryValue(memoryStr) {
  if (!memoryStr) return '0'
  // 提取数字部分，如 "32.00KB" -> "32"
  const match = memoryStr.match(/^([\d.]+)/)
  return match ? parseFloat(match[1]).toFixed(0) : '0'
}

/**
 * 获取内存单位
 */
function getMemoryUnit(memoryStr) {
  if (!memoryStr) return 'B'
  // 提取单位部分，如 "32.00KB" -> "KB"
  const match = memoryStr.match(/[A-Z]+$/)
  return match ? match[0] : 'B'
}

/**
 * 格式化最后更新时间
 */
function formatLastUpdateTime() {
  if (!lastUpdateTime.value) return '暂无数据'
  
  const now = new Date()
  const diff = Math.floor((now - lastUpdateTime.value) / 1000) // 秒
  
  if (diff < 5) {
    return '刚刚更新'
  } else if (diff < 60) {
    return `${diff}秒前更新`
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前更新`
  } else {
    const hours = lastUpdateTime.value.getHours().toString().padStart(2, '0')
    const minutes = lastUpdateTime.value.getMinutes().toString().padStart(2, '0')
    return `更新于 ${hours}:${minutes}`
  }
}

/**
 * 启动定时刷新
 */
function startAutoRefresh() {
  // 清除已存在的定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置新的定时器
  refreshTimer = setInterval(() => {
    // 只在页面可见时刷新
    if (!document.hidden) {
      handleRefresh()
    }
  }, autoRefreshInterval)
}

/**
 * 停止定时刷新
 */
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
  if (!document.hidden) {
    // 页面重新可见时，立即刷新一次
    handleRefresh()
  }
}

// 初始化
onMounted(async () => {
  await loadCacheTypes()
  handleRefresh()
  // 启动定时刷新
  startAutoRefresh()
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件卸载时清理定时器和事件监听
onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
