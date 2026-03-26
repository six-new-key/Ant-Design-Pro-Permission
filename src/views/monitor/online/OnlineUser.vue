<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item name="userId">
            <a-input v-model:value="searchForm.userId" placeholder="请输入用户ID" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="username">
            <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item>
            <a-space :size="12">
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </transition>

    <!-- 数据表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <a-space :size="12">
            <a-button @click="loadData" :loading="loading">
              <template #icon><ReloadOutlined /></template>
              刷新
            </a-button>
          </a-space>

          <a-tag color="blue">
            <template #icon><ClockCircleOutlined /></template>
            自动刷新：30秒
          </a-tag>

          <a-space :size="12">
            <a-tooltip :title="searchVisible ? '隐藏搜索栏' : '显示搜索栏'">
              <a-button shape="circle" @click="toggleSearch">
                <template #icon>
                  <EyeInvisibleOutlined v-if="searchVisible" />
                  <EyeOutlined v-else />
                </template>
              </a-button>
            </a-tooltip>
            
            <a-dropdown placement="bottomRight">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-for="col in configurableColumns" :key="col.key">
                    <a-checkbox 
                      :checked="columnVisibility[col.key]" 
                      @change="() => toggleColumn(col.key)"
                    >
                      {{ col.title }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-tooltip title="列显示设置">
                <a-button shape="circle">
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="visibleColumns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        row-key="userId"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'remainingSeconds'">
            {{ formatRemaining(record.remainingSeconds) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="link" danger size="small" @click="handleForceLogout(record)" v-permission.disable="'system:user_online:kickout'">
                <template #icon><LogoutOutlined /></template>
                强退
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import {
  SearchOutlined,
  ReloadOutlined,
  LogoutOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { getOnlineUsers, forceLogout } from '@/api/online'

const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder
  }
})

// 查询表单
const searchForm = reactive({
  userId: '',
  username: ''
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 表格列定义
const columns = [
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 120 },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 150 },
  { title: '归属地', dataIndex: 'location', key: 'location', width: 150, ellipsis: true },
  { title: '浏览器', dataIndex: 'browser', key: 'browser', width: 150, ellipsis: true },
  { title: '操作系统', dataIndex: 'os', key: 'os', width: 150, ellipsis: true },
  { title: '登录时间', dataIndex: 'loginTime', key: 'loginTime', width: 180 },
  { title: '剩余时长', dataIndex: 'remainingSeconds', key: 'remainingSeconds', width: 120 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

// 列显隐控制
const columnVisibility = ref({
  userId: true,
  username: true,
  ip: true,
  location: true,
  browser: true,
  os: true,
  loginTime: true,
  remainingSeconds: true
})

const toggleColumn = (key) => {
  columnVisibility.value[key] = !columnVisibility.value[key]
}

const visibleColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'action') return true
    return columnVisibility.value[col.key] !== false
  })
})

const configurableColumns = computed(() => {
  return columns.filter(col => col.key !== 'action')
})

// 表格数据
const dataSource = ref([])
const loading = ref(false)
const operationLoading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  showLessItems: true
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      userId: searchForm.userId || undefined,
      username: searchForm.username || undefined
    }
    
    const res = await getOnlineUsers(params)
    
    if (res.code === 200) {
      dataSource.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.userId = ''
  searchForm.username = ''
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 格式化剩余时长
const formatRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return '已过期'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 强制退出
const handleForceLogout = async (record) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要强制退出用户"${record.username}"吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      operationLoading.value = true
      try {
        const res = await forceLogout(record.userId)
        if (res.code === 200) {
          Message.success('强制退出成功')
          loadData()
        }
      } catch (error) {
        Message.error('强制退出失败')
      } finally {
        operationLoading.value = false
      }
    }
  })
}

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

<style lang="scss" scoped>
/* 搜索栏过渡动画 */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.search-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.search-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.search-card {
  margin-bottom: 16px;
  overflow: hidden;
}

.search-form-compact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  
  :deep(.ant-form-item) {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  > :nth-child(2) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
