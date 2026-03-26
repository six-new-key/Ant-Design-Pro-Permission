<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item name="title">
            <a-input v-model:value="searchForm.title" placeholder="请输入操作模块" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="operName">
            <a-input v-model:value="searchForm.operName" placeholder="请输入操作人员" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect
              v-model:value="searchForm.status"
              dict-type="oper_status"
              placeholder="请选择操作状态"
              allow-clear
              value-type="number"
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item name="dateRange">
            <a-range-picker
              v-model:value="searchForm.dateRange"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              style="width: 240px"
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
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete" v-permission.disable="'system:oper_log:remove'">
              <template #icon><DeleteOutlined /></template>
              删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
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

            <a-dropdown placement="bottomRight">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="clean" @click="handleClean" v-if="hasPermission('system:oper_log:clean')">
                    <ClearOutlined />
                    <span style="margin-left: 8px;">清空日志</span>
                  </a-menu-item>
                  <a-menu-item key="export" @click="handleExport" v-if="hasPermission('system:oper_log:export')">
                    <DownloadOutlined />
                    <span style="margin-left: 8px;">导出</span>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-tooltip title="更多操作">
                <a-button shape="circle">
                  <template #icon><MoreOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="visibleColumns"
        :data-source="dataSource"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'businessType'">
            {{ getBusinessTypeText(record.businessType) }}
          </template>
          <template v-else-if="column.key === 'costTime'">
            {{ record.costTime }}ms
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="link" size="small" @click="handleView(record)">
                <template #icon><EyeOutlined /></template>
                详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      width="800px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">操作日志详情</span>
          <a-space :size="12">
            <a-button @click="detailVisible = false">关闭</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars" style="max-height: 600px; overflow-y: auto; font-size: 12px;">
        <a-descriptions bordered :column="2" size="small" :labelStyle="{ width: '100px', minWidth: '100px' }">
          <a-descriptions-item label="操作模块">
            <div style="word-break: break-all;">{{ detailData.title || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="业务类型">
            <div style="word-break: break-all;">{{ getBusinessTypeText(detailData.businessType) }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="请求方式">
            <div style="word-break: break-all;">{{ detailData.requestMethod || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作人员">
            <div style="word-break: break-all;">{{ detailData.operName || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作地址" :span="2">
            <div style="word-break: break-all; white-space: pre-wrap;">{{ detailData.operUrl || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作IP">
            <div style="word-break: break-all;">{{ detailData.operIp || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作地点">
            <div style="word-break: break-all;">{{ detailData.operLocation || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作状态">
            <a-tag :color="detailData.status === 1 ? 'success' : 'error'">
              {{ detailData.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="消耗时间">
            <div style="word-break: break-all;">{{ detailData.costTime }}ms</div>
          </a-descriptions-item>
          <a-descriptions-item label="操作时间" :span="2">
            <div style="word-break: break-all;">{{ detailData.createTime || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="方法名称" :span="2">
            <div style="word-break: break-all; white-space: pre-wrap; font-family: monospace;">
              {{ detailData.method || '-' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="请求参数" :span="2">
            <div style="max-height: 150px; overflow-y: auto; word-break: break-all; white-space: pre-wrap; font-family: monospace;">
              {{ detailData.operParam || '无' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="返回结果" :span="2">
            <div style="max-height: 150px; overflow-y: auto; word-break: break-all; white-space: pre-wrap; font-family: monospace;">
              {{ detailData.jsonResult || '无' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item v-if="detailData.errorMsg" label="错误信息" :span="2">
            <div style="max-height: 150px; overflow-y: auto; word-break: break-all; white-space: pre-wrap; color: #ff4d4f; font-family: monospace;">
              {{ detailData.errorMsg }}
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { usePermission } from '@/utils/usePermission'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ClearOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import { getOperLogList, deleteOperLog, cleanOperLog, exportOperLog } from '@/api/operlog'

const { useToken } = theme
const { token } = useToken()
const { hasPermission } = usePermission()

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
  title: '',
  operName: '',
  status: undefined,
  dateRange: []
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 业务类型映射
const businessTypeMap = {
  0: '其他',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '生成代码',
  9: '清空数据'
}

const getBusinessTypeText = (type) => {
  return businessTypeMap[type] || '未知'
}

// 表格列定义
const columns = [
  { title: '日志编号', dataIndex: 'id', key: 'id', width: 120 },
  { title: '操作模块', dataIndex: 'title', key: 'title', width: 150, ellipsis: true },
  { title: '业务类型', dataIndex: 'businessType', key: 'businessType', width: 120 },
  { title: '请求方式', dataIndex: 'requestMethod', key: 'requestMethod', width: 120 },
  { title: '操作人员', dataIndex: 'operName', key: 'operName', width: 120 },
  { title: '操作IP', dataIndex: 'operIp', key: 'operIp', width: 150 },
  { title: '操作地点', dataIndex: 'operLocation', key: 'operLocation', width: 150, ellipsis: true },
  { title: '操作状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '消耗时间', dataIndex: 'costTime', key: 'costTime', width: 120 },
  { title: '操作时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

// 列显隐控制
const columnVisibility = ref({
  id: true,
  title: true,
  businessType: true,
  requestMethod: true,
  operName: true,
  operIp: true,
  operLocation: true,
  status: true,
  costTime: true,
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
const selectedRowKeys = ref([])
const exportLoading = ref(false)

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

// 行选择
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 详情弹窗
const detailVisible = ref(false)
const detailData = ref({})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      title: searchForm.title || undefined,
      operName: searchForm.operName || undefined,
      status: searchForm.status
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.beginTime = searchForm.dateRange[0].format('YYYY-MM-DD')
      params.endTime = searchForm.dateRange[1].format('YYYY-MM-DD')
    }

    const res = await getOperLogList(params)
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
  searchForm.title = ''
  searchForm.operName = ''
  searchForm.status = undefined
  searchForm.dateRange = []
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 查看详情
const handleView = (record) => {
  detailData.value = record
  detailVisible.value = true
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的数据')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条操作日志吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await deleteOperLog(selectedRowKeys.value)
        if (res.code === 200) {
          Message.success('删除成功')
          selectedRowKeys.value = []
          loadData()
        }
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

// 清空日志
const handleClean = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有操作日志吗？此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await cleanOperLog()
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

// 导出
const handleExport = () => {
  Modal.confirm({
    title: '确认导出',
    content: '确定要导出操作日志数据吗？',
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      exportLoading.value = true
      try {
        const params = {
          title: searchForm.title || undefined,
          operName: searchForm.operName || undefined,
          status: searchForm.status
        }

        if (searchForm.dateRange && searchForm.dateRange.length === 2) {
          params.beginTime = searchForm.dateRange[0].format('YYYY-MM-DD')
          params.endTime = searchForm.dateRange[1].format('YYYY-MM-DD')
        }

        Message.loading({ content: '正在导出...', key: 'export', duration: 0 })
        const response = await exportOperLog(params)
        
        // 创建下载链接
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `操作日志_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        
        Message.success({ content: '导出成功', key: 'export' })
      } catch (error) {
        Message.error({ content: '导出失败', key: 'export' })
      } finally {
        exportLoading.value = false
      }
    }
  })
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
