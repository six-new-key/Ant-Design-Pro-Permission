<template>
  <a-card :bordered="false">
    <template #title>
      <a-form layout="inline">
        <a-form-item>
          <a-input
            v-model:value="searchForm.userId"
            placeholder="用户ID"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="searchForm.username"
            placeholder="用户名"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <SearchOutlined />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>

    <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
      :scroll="{ x: 1200 }" row-key="userId" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <!-- 剩余时长 -->
        <template v-if="column.key === 'remainingSeconds'">
          {{ formatRemaining(record.remainingSeconds) }}
        </template>

        <!-- 操作 -->
        <template v-else-if="column.key === 'action'">
          <a-button type="link" danger size="small" :loading="operationLoading" @click="handleForceLogout(record)">
            <template #icon>
              <DeleteOutlined />
            </template>
            强退
          </a-button>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useOnlineUserTable } from './composables/useOnlineUserTable'
import { useOnlineUserOperations } from './composables/useOnlineUserOperations'
import { useCountdown } from './composables/useCountdown'

// 表格相关
const {
  loading,
  dataSource,
  pagination,
  searchForm,
  columns,
  loadData,
  handleSearch,
  handleReset,
  handleTableChange
} = useOnlineUserTable()

// 操作相关
const { operationLoading, handleForceLogout } = useOnlineUserOperations(loadData)

// 倒计时相关
const { formatRemaining } = useCountdown(dataSource)

// 自动刷新定时器
const autoRefreshTimer = ref(null)

// 启动自动刷新（30秒）
const startAutoRefresh = () => {
  autoRefreshTimer.value = setInterval(() => {
    loadData()
  }, 30000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

// 初始化
onMounted(() => {
  loadData()
  startAutoRefresh()
})

// 清理
onUnmounted(() => {
  stopAutoRefresh()
})
</script>
