<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item name="jobName">
            <a-input v-model:value="searchForm.jobName" placeholder="请输入任务名称" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="jobGroup">
            <DictSelect
              v-model:value="searchForm.jobGroup"
              dict-type="job_group"
              placeholder="请选择任务分组"
              allow-clear
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect
              v-model:value="searchForm.status"
              dict-type="job_log_status"
              placeholder="请选择执行状态"
              allow-clear
              value-type="number"
              style="width: 180px"
            />
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
            <a-button @click="handleBack">
              <template #icon><ArrowLeftOutlined /></template>
              返回
            </a-button>
            <a-button danger @click="handleClean" v-permission.disable="'system:schedule_log:clean'">
              <template #icon><DeleteOutlined /></template>
              清空日志
            </a-button>
          </a-space>

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
        row-key="logId"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'duration'">
            {{ record.duration }}ms
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="8">
              <a-button
                v-if="record.status === 0"
                type="link"
                size="small"
                @click="handleViewException(record)"
              >
                <template #icon><ExclamationCircleOutlined /></template>
                查看异常
              </a-button>
              <span v-else style="color: #999;">-</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 异常信息弹窗 -->
    <a-modal
      v-model:open="exceptionVisible"
      width="800px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">异常信息</span>
          <a-space :size="12">
            <a-button @click="exceptionVisible = false">关闭</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-textarea
          :value="exceptionInfo"
          :rows="15"
          readonly
          style="font-family: monospace; font-size: 12px;"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { getJobLogPage, cleanJobLog } from '@/api/job'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
  jobId: route.query.jobId || undefined,
  jobName: route.query.jobName || '',
  jobGroup: undefined,
  status: undefined
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 表格列定义
const columns = [
  { title: '日志ID', dataIndex: 'logId', key: 'logId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', key: 'jobName', width: 150, ellipsis: true },
  { title: '任务分组', dataIndex: 'jobGroup', key: 'jobGroup', width: 120 },
  { title: '调用目标', dataIndex: 'invokeTarget', key: 'invokeTarget', width: 200, ellipsis: true },
  { title: '执行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '执行耗时', dataIndex: 'duration', key: 'duration', width: 120 },
  { title: '执行时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 列显隐控制
const columnVisibility = ref({
  logId: true,
  jobName: true,
  jobGroup: true,
  invokeTarget: true,
  status: true,
  duration: true,
  createTime: true
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

// 异常信息弹窗
const exceptionVisible = ref(false)
const exceptionInfo = ref('')

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      jobId: searchForm.jobId,
      jobName: searchForm.jobName || undefined,
      jobGroup: searchForm.jobGroup,
      status: searchForm.status
    }
    
    const res = await getJobLogPage(params)
    
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
  searchForm.jobName = route.query.jobName || ''
  searchForm.jobGroup = undefined
  searchForm.status = undefined
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 返回
const handleBack = () => {
  router.back()
}

// 清空日志
const handleClean = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有任务日志吗？此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await cleanJobLog()
        if (res.code === 200) {
          Message.success('清空成功')
          loadData()
        }
      } catch (error) {
        Message.error('清空失败')
      }
    }
  })
}

// 查看异常
const handleViewException = (record) => {
  exceptionInfo.value = record.exceptionInfo || '无异常信息'
  exceptionVisible.value = true
}

onMounted(() => {
  loadData()
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
}
</style>
