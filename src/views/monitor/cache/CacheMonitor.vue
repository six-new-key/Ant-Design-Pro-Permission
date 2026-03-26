<template>
  <div class="cache-monitor-container" :style="cssVars">
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- Tab 1: 缓存统计 -->
      <a-tab-pane key="cache" tab="缓存统计">
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
            <a-button danger @click="handleClearAllCache" v-permission.disable="'system:cache:clear_all'">
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
              @click.stop="handleClearCacheByCategory(category.code, category.name)" v-permission.disable="'system:cache:clear_category'">
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
      </a-tab-pane>

      <!-- Tab 2: Redis 监控 -->
      <a-tab-pane key="redis" tab="Redis 监控">
        <a-card title="Redis 服务器信息" :loading="redisLoading">
          <template #extra>
            <a-space :size="12">
              <a-space :size="4">
                <ClockCircleOutlined style="color: var(--color-text-3); font-size: 14px;" />
                <span class="last-update-time">{{ formatRedisLastUpdateTime() }}</span>
              </a-space>
              <a-button type="primary" @click="handleRefreshRedis" :loading="redisLoading">
                <template #icon>
                  <ReloadOutlined />
                </template>
                刷新
              </a-button>
            </a-space>
          </template>

          <div v-if="redisInfo">
            <!-- 基本信息 -->
            <a-descriptions title="基本信息" bordered :column="4" size="small" style="margin-bottom: 24px;">
              <a-descriptions-item label="Redis 版本">{{ redisInfo.basicInfo?.version }}</a-descriptions-item>
              <a-descriptions-item label="运行模式">{{ redisInfo.basicInfo?.mode }}</a-descriptions-item>
              <a-descriptions-item label="端口">{{ redisInfo.basicInfo?.port }}</a-descriptions-item>
              <a-descriptions-item label="客户端数">{{ redisInfo.basicInfo?.clients }}</a-descriptions-item>
              <a-descriptions-item label="运行天数">{{ redisInfo.basicInfo?.uptimeDays }} 天</a-descriptions-item>
              <a-descriptions-item label="运行时长">{{ formatUptime(redisInfo.basicInfo?.uptimeSeconds) }}</a-descriptions-item>
              <a-descriptions-item label="AOF">{{ redisInfo.basicInfo?.aofEnabled === '1' ? '已开启' : '未开启' }}</a-descriptions-item>
              <a-descriptions-item label="键空间大小">{{ redisInfo.dbSize }}</a-descriptions-item>
            </a-descriptions>

            <!-- 性能指标 -->
            <a-descriptions title="性能指标" bordered :column="3" size="small" style="margin-bottom: 24px;">
              <a-descriptions-item label="已使用内存">{{ redisInfo.performance?.usedMemoryHuman }}</a-descriptions-item>
              <a-descriptions-item label="内存峰值">{{ redisInfo.performance?.usedMemoryPeakHuman }}</a-descriptions-item>
              <a-descriptions-item label="内存碎片率">{{ redisInfo.performance?.memFragmentationRatio }}</a-descriptions-item>
              <a-descriptions-item label="总连接数">{{ redisInfo.performance?.totalConnectionsReceived }}</a-descriptions-item>
              <a-descriptions-item label="总命令数">{{ redisInfo.performance?.totalCommandsProcessed }}</a-descriptions-item>
              <a-descriptions-item label="每秒操作数">{{ redisInfo.performance?.instantaneousOpsPerSec }}</a-descriptions-item>
              <a-descriptions-item label="网络输入">{{ redisInfo.performance?.instantaneousInputKbps }} KB/s</a-descriptions-item>
              <a-descriptions-item label="网络输出">{{ redisInfo.performance?.instantaneousOutputKbps }} KB/s</a-descriptions-item>
              <a-descriptions-item label="命中率">
                <a-tag :color="getHitRateColor(redisInfo.performance?.hitRate)">
                  {{ redisInfo.performance?.hitRate }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="键命中次数">{{ redisInfo.performance?.keyspaceHits }}</a-descriptions-item>
              <a-descriptions-item label="键未命中次数">{{ redisInfo.performance?.keyspaceMisses }}</a-descriptions-item>
            </a-descriptions>

            <!-- 命令统计 -->
            <a-card title="命令统计" size="small" v-if="redisInfo.commandStats && redisInfo.commandStats.length > 0">
              <a-row :gutter="[16, 16]">
                <a-col v-for="cmd in redisInfo.commandStats" :key="cmd.name" :xs="12" :sm="8" :md="6" :lg="4">
                  <a-statistic :title="cmd.name.toUpperCase()" :value="cmd.value" :value-style="{ fontSize: '16px' }">
                    <template #suffix>
                      <span style="font-size: 12px; color: var(--color-text-tertiary);">次</span>
                    </template>
                  </a-statistic>
                </a-col>
              </a-row>
            </a-card>
          </div>
        </a-card>
      </a-tab-pane>
    </a-tabs>
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
import { useRedisInfo } from './composables/useRedisInfo'

const router = useRouter()

const { useToken } = theme
const { token } = useToken()

// Tab 切换
const activeTab = ref('cache')

// 定时刷新相关
let refreshTimer = null
let redisRefreshTimer = null
const autoRefreshInterval = 60000 // 1分钟

/**
 * Tab 切换处理
 */
function handleTabChange(key) {
  activeTab.value = key
  
  if (key === 'cache') {
    // 切换到缓存统计，启动缓存统计刷新，停止 Redis 刷新
    startAutoRefresh()
    stopRedisAutoRefresh()
  } else if (key === 'redis') {
    // 切换到 Redis 监控，启动 Redis 刷新，停止缓存统计刷新
    stopAutoRefresh()
    startRedisAutoRefresh()
    // 如果数据为空，立即加载
    if (!redisInfo.value) {
      handleRefreshRedis()
    }
  }
}

/**
 * CSS 变量（用于主题适配）
 */
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-shadow': t.colorBgSpotlight || 'rgba(0, 0, 0, 0.15)',
    '--color-fill-2': t.colorFillSecondary,
    '--color-text-1': t.colorText,
    '--color-text-2': t.colorTextSecondary,
    '--color-text-3': t.colorTextTertiary
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

// Redis 信息相关
const { redisInfo, loading: redisLoading, loadRedisInfo } = useRedisInfo()

// 最后更新时间
const lastUpdateTime = ref(null)
const redisLastUpdateTime = ref(null)

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
 * 格式化 Redis 最后更新时间
 */
function formatRedisLastUpdateTime() {
  if (!redisLastUpdateTime.value) return '暂无数据'
  
  const now = new Date()
  const diff = Math.floor((now - redisLastUpdateTime.value) / 1000) // 秒
  
  if (diff < 5) {
    return '刚刚更新'
  } else if (diff < 60) {
    return `${diff}秒前更新`
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前更新`
  } else {
    const hours = redisLastUpdateTime.value.getHours().toString().padStart(2, '0')
    const minutes = redisLastUpdateTime.value.getMinutes().toString().padStart(2, '0')
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
    // 只在页面可见且在缓存统计 Tab 时刷新
    if (!document.hidden && activeTab.value === 'cache') {
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
 * 启动 Redis 定时刷新
 */
function startRedisAutoRefresh() {
  // 清除已存在的定时器
  if (redisRefreshTimer) {
    clearInterval(redisRefreshTimer)
  }
  
  // 设置新的定时器
  redisRefreshTimer = setInterval(() => {
    // 只在页面可见且在 Redis 监控 Tab 时刷新
    if (!document.hidden && activeTab.value === 'redis') {
      handleRefreshRedis()
    }
  }, autoRefreshInterval)
}

/**
 * 停止 Redis 定时刷新
 */
function stopRedisAutoRefresh() {
  if (redisRefreshTimer) {
    clearInterval(redisRefreshTimer)
    redisRefreshTimer = null
  }
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
  if (!document.hidden) {
    // 页面重新可见时，根据当前 Tab 刷新对应数据
    if (activeTab.value === 'cache') {
      handleRefresh()
    } else if (activeTab.value === 'redis') {
      handleRefreshRedis()
    }
  }
}

/**
 * 刷新 Redis 信息
 */
async function handleRefreshRedis() {
  await loadRedisInfo()
  // 更新最后刷新时间
  redisLastUpdateTime.value = new Date()
}

/**
 * 格式化运行时长
 */
function formatUptime(seconds) {
  if (!seconds) return '0秒'
  const sec = parseInt(seconds)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const secs = sec % 60
  
  let result = ''
  if (days > 0) result += `${days}天`
  if (hours > 0) result += `${hours}小时`
  if (minutes > 0) result += `${minutes}分钟`
  if (secs > 0 || result === '') result += `${secs}秒`
  
  return result
}

/**
 * 获取命中率颜色
 */
function getHitRateColor(hitRate) {
  if (!hitRate) return 'default'
  const rate = parseFloat(hitRate)
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'error'
}

// 初始化
onMounted(async () => {
  await loadCacheTypes()
  handleRefresh()
  // 启动缓存统计定时刷新（默认在缓存统计 Tab）
  startAutoRefresh()
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件卸载时清理定时器和事件监听
onUnmounted(() => {
  stopAutoRefresh()
  stopRedisAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
@import './styles/cache.scss';
</style>
