<template>
  <div class="server-monitor-container" :style="cssVars">
    <!-- 顶部操作栏 -->
    <div class="monitor-header">
      <a-space>
        <a-button type="primary" :loading="loading" @click="handleRefresh">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
        <span v-if="lastUpdateTime" class="last-update-time">
          {{ lastUpdateTimeText }}
        </span>
      </a-space>
    </div>

    <!-- 加载状态 -->
    <a-spin :spinning="loading && !monitorData" tip="加载中...">
      <div v-if="monitorData" class="monitor-content">
        <!-- 服务概览 -->
        <a-card title="服务概览" class="monitor-card">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic
                title="服务状态"
                :value="monitorData.serviceOverview.status"
                :value-style="getStatusStyle(monitorData.serviceOverview.status)"
              >
                <template #prefix>
                  <CheckCircleOutlined v-if="monitorData.serviceOverview.status === 'UP'" />
                  <CloseCircleOutlined v-else />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="运行时长"
                :value="monitorData.serviceOverview.uptimeFormatted"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="应用版本"
                :value="monitorData.serviceOverview.version"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="启动时间"
                :value="monitorData.serviceOverview.startTime"
              />
            </a-col>
          </a-row>
        </a-card>

        <!-- JVM 监控 -->
        <a-card title="JVM 监控" class="monitor-card">
          <a-tabs>
            <!-- 内存使用 -->
            <a-tab-pane key="memory" tab="内存使用">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="memory-section">
                    <h4>堆内存</h4>
                    <a-progress
                      :percent="monitorData.jvmMonitor.memoryUsage.heapUsagePercent"
                      :status="getMemoryStatus(monitorData.jvmMonitor.memoryUsage.heapUsagePercent)"
                    />
                    <div class="memory-info">
                      <span>已用: {{ formatBytes(monitorData.jvmMonitor.memoryUsage.heapUsed) }}</span>
                      <span>最大: {{ formatBytes(monitorData.jvmMonitor.memoryUsage.heapMax) }}</span>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="memory-section">
                    <h4>非堆内存</h4>
                    <a-progress
                      :percent="monitorData.jvmMonitor.memoryUsage.nonHeapUsagePercent"
                      :status="getMemoryStatus(monitorData.jvmMonitor.memoryUsage.nonHeapUsagePercent)"
                    />
                    <div class="memory-info">
                      <span>已用: {{ formatBytes(monitorData.jvmMonitor.memoryUsage.nonHeapUsed) }}</span>
                      <span>最大: {{ formatBytes(monitorData.jvmMonitor.memoryUsage.nonHeapMax) }}</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>

            <!-- 垃圾回收 -->
            <a-tab-pane key="gc" tab="垃圾回收">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic
                    title="Young GC 次数"
                    :value="monitorData.jvmMonitor.garbageCollection.youngGcCount"
                    suffix="次"
                  />
                  <a-statistic
                    title="Young GC 耗时"
                    :value="monitorData.jvmMonitor.garbageCollection.youngGcTime"
                    suffix="ms"
                    style="margin-top: 16px"
                  />
                </a-col>
                <a-col :span="12">
                  <a-statistic
                    title="Full GC 次数"
                    :value="monitorData.jvmMonitor.garbageCollection.fullGcCount"
                    suffix="次"
                  />
                  <a-statistic
                    title="Full GC 耗时"
                    :value="monitorData.jvmMonitor.garbageCollection.fullGcTime"
                    suffix="ms"
                    style="margin-top: 16px"
                  />
                </a-col>
              </a-row>
            </a-tab-pane>

            <!-- 线程信息 -->
            <a-tab-pane key="thread" tab="线程信息">
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-statistic
                    title="当前线程数"
                    :value="monitorData.jvmMonitor.threadInfo.liveThreads"
                  />
                </a-col>
                <a-col :span="6">
                  <a-statistic
                    title="峰值线程数"
                    :value="monitorData.jvmMonitor.threadInfo.peakThreads"
                  />
                </a-col>
                <a-col :span="6">
                  <a-statistic
                    title="守护线程数"
                    :value="monitorData.jvmMonitor.threadInfo.daemonThreads"
                  />
                </a-col>
                <a-col :span="6">
                  <a-statistic
                    title="死锁线程数"
                    :value="monitorData.jvmMonitor.threadInfo.deadlockedThreads"
                    :value-style="getDeadlockStyle(monitorData.jvmMonitor.threadInfo.deadlockedThreads)"
                  />
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>
        </a-card>

        <!-- 系统资源 -->
        <a-card title="系统资源" class="monitor-card">
          <a-row :gutter="16">
            <!-- CPU -->
            <a-col :span="8">
              <div class="resource-section">
                <h4>CPU 使用率</h4>
                <a-progress
                  type="dashboard"
                  :percent="monitorData.systemResource.cpuInfo.systemCpuUsage"
                  :status="getResourceStatus(monitorData.systemResource.cpuInfo.systemCpuUsage)"
                />
                <div class="resource-info">
                  <p>系统 CPU: {{ monitorData.systemResource.cpuInfo.systemCpuUsage }}%</p>
                  <p>进程 CPU: {{ monitorData.systemResource.cpuInfo.processCpuUsage }}%</p>
                  <p>CPU 核心数: {{ monitorData.systemResource.cpuInfo.availableProcessors }}</p>
                </div>
              </div>
            </a-col>

            <!-- 内存 -->
            <a-col :span="8">
              <div class="resource-section">
                <h4>系统内存</h4>
                <a-progress
                  type="dashboard"
                  :percent="monitorData.systemResource.memoryInfo.usagePercent"
                  :status="getResourceStatus(monitorData.systemResource.memoryInfo.usagePercent)"
                />
                <div class="resource-info">
                  <p>总内存: {{ formatBytes(monitorData.systemResource.memoryInfo.totalMemory) }}</p>
                  <p>已用: {{ formatBytes(monitorData.systemResource.memoryInfo.usedMemory) }}</p>
                  <p>可用: {{ formatBytes(monitorData.systemResource.memoryInfo.freeMemory) }}</p>
                </div>
              </div>
            </a-col>

            <!-- 磁盘 -->
            <a-col :span="8">
              <div class="resource-section">
                <h4>磁盘空间</h4>
                <a-progress
                  type="dashboard"
                  :percent="monitorData.systemResource.diskInfo.usagePercent"
                  :status="getResourceStatus(monitorData.systemResource.diskInfo.usagePercent)"
                />
                <div class="resource-info">
                  <p>总空间: {{ formatBytes(monitorData.systemResource.diskInfo.totalSpace) }}</p>
                  <p>已用: {{ formatBytes(monitorData.systemResource.diskInfo.usedSpace) }}</p>
                  <p>可用: {{ formatBytes(monitorData.systemResource.diskInfo.freeSpace) }}</p>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <!-- HTTP 请求统计 -->
        <a-card title="HTTP 请求统计" class="monitor-card">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic
                title="总请求数"
                :value="monitorData.httpStatistics.totalRequests"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="成功请求数"
                :value="monitorData.httpStatistics.successRequests"
                :value-style="successStyle"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="失败请求数"
                :value="monitorData.httpStatistics.failedRequests"
                :value-style="errorStyle"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                title="平均响应时间"
                :value="monitorData.httpStatistics.avgResponseTime"
                suffix="ms"
              />
            </a-col>
          </a-row>
        </a-card>

        <!-- 数据库连接池 -->
        <a-card title="数据库连接池" class="monitor-card">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-progress
                type="dashboard"
                :percent="monitorData.databasePool.usagePercent"
                :status="getResourceStatus(monitorData.databasePool.usagePercent)"
              />
            </a-col>
            <a-col :span="16">
              <a-row :gutter="16">
                <a-col :span="12" style="margin-bottom: 16px">
                  <a-statistic
                    title="活跃连接数"
                    :value="monitorData.databasePool.activeConnections"
                  />
                </a-col>
                <a-col :span="12" style="margin-bottom: 16px">
                  <a-statistic
                    title="空闲连接数"
                    :value="monitorData.databasePool.idleConnections"
                  />
                </a-col>
                <a-col :span="12">
                  <a-statistic
                    title="最大连接数"
                    :value="monitorData.databasePool.maxConnections"
                  />
                </a-col>
                <a-col :span="12">
                  <a-statistic
                    title="等待线程数"
                    :value="monitorData.databasePool.waitingThreads"
                  />
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-card>

        <!-- 依赖服务健康 -->
        <a-card title="依赖服务健康" class="monitor-card">
          <a-table
            :columns="healthColumns"
            :data-source="monitorData.dependencyHealth.healthDetails"
            :pagination="false"
            row-key="name"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'UP' ? 'success' : 'error'">
                  {{ record.status }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>

        <!-- 应用信息 -->
        <a-card title="应用信息" class="monitor-card">
          <a-descriptions bordered :column="2">
            <a-descriptions-item label="应用名称">
              {{ monitorData.applicationInfo.applicationName }}
            </a-descriptions-item>
            <a-descriptions-item label="应用版本">
              {{ monitorData.applicationInfo.version }}
            </a-descriptions-item>
            <a-descriptions-item label="JDK 版本">
              {{ monitorData.applicationInfo.jdkVersion }}
            </a-descriptions-item>
            <a-descriptions-item label="操作系统">
              {{ monitorData.applicationInfo.osName }} {{ monitorData.applicationInfo.osVersion }}
            </a-descriptions-item>
            <a-descriptions-item label="系统架构">
              {{ monitorData.applicationInfo.osArch }}
            </a-descriptions-item>
            <a-descriptions-item label="工作目录">
              {{ monitorData.applicationInfo.workingDirectory }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { theme } from 'ant-design-vue'
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import { useServerMonitor } from './composables/useServerMonitor'

const { loading, monitorData, fetchMonitorData } = useServerMonitor()

const { useToken } = theme
const { token } = useToken()

/**
 * CSS 变量（用于样式文件中使用）
 */
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text-1': t.colorText,
    '--color-text-2': t.colorTextSecondary,
    '--color-text-3': t.colorTextTertiary,
    '--ant-success-color': t.colorSuccess || '#3f8600',
    '--ant-error-color': t.colorError || '#cf1322'
  }
})

// 自动刷新
const refreshTimer = ref(null)
const autoRefreshInterval = 60000 // 60秒

// 最后更新时间
const lastUpdateTime = ref(null)

// 健康检查表格列
const healthColumns = [
  {
    title: '组件名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '详细信息',
    dataIndex: 'details',
    key: 'details'
  }
]

// 最后更新时间文本
const lastUpdateTimeText = computed(() => {
  if (!lastUpdateTime.value) return ''
  
  const now = Date.now()
  const diff = now - lastUpdateTime.value
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (seconds < 10) {
    return '刚刚更新'
  } else if (seconds < 60) {
    return `${seconds}秒前更新`
  } else if (minutes < 60) {
    return `${minutes}分钟前更新`
  } else {
    const time = new Date(lastUpdateTime.value)
    return `更新于 ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
  }
})

// 样式计算属性（使用 Ant Design 主题 token）
const successStyle = computed(() => ({
  color: token.value.colorSuccess || '#3f8600'
}))

const errorStyle = computed(() => ({
  color: token.value.colorError || '#cf1322'
}))

const getStatusStyle = (status) => ({
  color: status === 'UP' 
    ? token.value.colorSuccess || '#3f8600' 
    : token.value.colorError || '#cf1322'
})

const getDeadlockStyle = (count) => ({
  color: count > 0 
    ? token.value.colorError || '#cf1322' 
    : token.value.colorSuccess || '#3f8600'
})

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  await fetchMonitorData()
  lastUpdateTime.value = Date.now()
}

/**
 * 启动自动刷新
 */
const startAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
  
  refreshTimer.value = setInterval(() => {
    if (!document.hidden) {
      handleRefresh()
    }
  }, autoRefreshInterval)
}

/**
 * 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

/**
 * 格式化字节
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  if (bytes < 0) return '无限制'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 获取内存状态
 */
const getMemoryStatus = (percent) => {
  if (percent >= 90) return 'exception'
  if (percent >= 70) return 'normal'
  return 'success'
}

/**
 * 获取资源状态
 */
const getResourceStatus = (percent) => {
  if (percent >= 90) return 'exception'
  if (percent >= 70) return 'normal'
  return 'success'
}

// 页面可见性变化
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopAutoRefresh()
  } else {
    handleRefresh()
    startAutoRefresh()
  }
}

onMounted(() => {
  handleRefresh()
  startAutoRefresh()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
@import './styles/server.scss';
</style>
