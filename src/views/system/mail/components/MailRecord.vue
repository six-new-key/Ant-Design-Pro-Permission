<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item>
            <a-input 
              v-model:value="searchForm.keyword" 
              placeholder="收件人或主题"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-input 
              v-model:value="searchForm.templateCode" 
              placeholder="模板代码"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-select 
              v-model:value="searchForm.sendStatus" 
              placeholder="发送状态"
              style="width: 180px"
              allow-clear
            >
              <a-select-option value="pending">待发送</a-select-option>
              <a-select-option value="sending">发送中</a-select-option>
              <a-select-option value="success">成功</a-select-option>
              <a-select-option value="failed">失败</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-range-picker 
              v-model:value="dateRange" 
              style="width: 240px"
              @change="handleDateChange"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                查询
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

    <!-- 数据统计和工具栏 -->
    <a-card :bordered="false" class="statistics-toolbar-card">
      <div class="statistics-toolbar-wrapper">
        <!-- 左侧：批量操作按钮 -->
        <a-space :size="12">
          <a-button 
            type="primary" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchResend"
            v-permission.disable="'system:mail:resendBatch'"
          >
            <template #icon><RedoOutlined /></template>
            批量重发 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
          </a-button>
          <a-button 
            danger
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
            v-permission.disable="'system:mail:recordDelete'"
          >
            <template #icon><DeleteOutlined /></template>
            批量删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
          </a-button>
        </a-space>
        
        <!-- 中间：数据统计 -->
        <div class="statistics-cards">
          <div class="stat-card">
            <div class="stat-icon today">
              <MailOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">今日发送</div>
              <div class="stat-number">{{ statistics.todayCount }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">今日成功</div>
              <div class="stat-number success">{{ statistics.todaySuccess }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon error">
              <CloseCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">今日失败</div>
              <div class="stat-number error">{{ statistics.todayFailed }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon rate">
              <PercentageOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">成功率</div>
              <div class="stat-number primary">{{ statistics.successRate }}%</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：工具按钮 -->
        <a-space :size="12">
          <a-tooltip :title="searchVisible ? '隐藏搜索栏' : '显示搜索栏'">
            <a-button shape="circle" @click="toggleSearch">
              <template #icon>
                <EyeOutlined v-if="searchVisible" />
                <EyeInvisibleOutlined v-else />
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
    </a-card>

    <!-- 表格区域 -->
    <a-card :bordered="false">
      <a-table
        :columns="visibleColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 'max-content' }"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'recipient'">
            <span>{{ record.recipient }}</span>
          </template>
          
          <template v-if="column.key === 'sendStatus'">
            <a-tag :color="getStatusColor(record.sendStatus)">
              {{ getStatusText(record.sendStatus) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-tooltip title="详情">
                <a-button 
                  type="link" 
                  size="small" 
                  @click="handleViewDetail(record)"
                >
                  <template #icon><EyeOutlined /></template>
                  详情
                </a-button>
              </a-tooltip>
              
              <a-tooltip :title="getResendTooltip(record)">
                <a-button 
                  type="link" 
                  size="small"
                  :disabled="!canResend(record)"
                  @click="handleResend(record)"
                  v-permission.disable="'system:mail:resend'"
                >
                  <template #icon><RedoOutlined /></template>
                  重发
                </a-button>
              </a-tooltip>
              
              <a-popconfirm
                title="确定要删除这条记录吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-tooltip title="删除">
                  <a-button type="link" size="small" danger v-permission.disable="'system:mail:recordDelete'">
                    <template #icon><DeleteOutlined /></template>
                    删除
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <a-drawer
      :width="800"
      :open="detailVisible"
      :closable="false"
      @close="detailVisible = false"
    >
      <template #title>
        <div class="drawer-header">
          <span class="drawer-title">发送记录详情</span>
          <a-button @click="detailVisible = false">关闭</a-button>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-descriptions bordered :column="1" v-if="currentRecord" :labelStyle="{ width: '120px', whiteSpace: 'nowrap' }" :contentStyle="{ wordBreak: 'break-all' }">
          <a-descriptions-item label="收件人">
            {{ currentRecord.recipient }}
          </a-descriptions-item>
          <a-descriptions-item label="模板代码" v-if="currentRecord.templateCode">
            {{ currentRecord.templateCode }}
          </a-descriptions-item>
          <a-descriptions-item label="邮件主题">
            {{ currentRecord.subject }}
          </a-descriptions-item>
          <a-descriptions-item label="发送状态">
            <a-tag :color="getStatusColor(currentRecord.sendStatus)">
              {{ getStatusText(currentRecord.sendStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发送时间">
            {{ currentRecord.sendTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="重试次数">
            {{ currentRecord.retryCount }}
          </a-descriptions-item>
          <a-descriptions-item label="错误信息" v-if="currentRecord.errorMessage">
            <a-alert :message="currentRecord.errorMessage" type="error" />
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ currentRecord.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="邮件内容" v-if="currentRecord.content">
            <div class="mail-content-preview">
              <div v-html="currentRecord.content"></div>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { 
  SearchOutlined, 
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  RedoOutlined,
  DeleteOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import {
  queryRecordPage,
  getRecordById,
  deleteRecord,
  batchDeleteRecord,
  getStatistics,
  resendMail,
  batchResendMail
} from '@/api/mail'

// CSS 变量
const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-primary': t.colorPrimary,
    '--color-success': t.colorSuccess,
    '--color-error': t.colorError,
    '--color-warning': t.colorWarning,
    '--color-info': t.colorInfo,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder,
    '--color-fill': t.colorFillQuaternary,
    '--border-radius': `${t.borderRadius}px`,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
  }
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 统计数据
const statistics = reactive({
  todayCount: 0,
  todaySuccess: 0,
  todayFailed: 0,
  successRate: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  templateCode: '',
  sendStatus: undefined,
  startTime: '',
  endTime: ''
})

const dateRange = ref([])

// 列配置
const allColumns = [
  { title: '收件人', dataIndex: 'recipient', key: 'recipient', width: 200, ellipsis: true },
  { title: '模板代码', dataIndex: 'templateCode', key: 'templateCode', width: 150, ellipsis: true },
  { title: '邮件主题', dataIndex: 'subject', key: 'subject', width: 200, ellipsis: true },
  { title: '发送状态', key: 'sendStatus', width: 100 },
  { title: '发送时间', dataIndex: 'sendTime', key: 'sendTime', width: 180 },
  { title: '重试次数', dataIndex: 'retryCount', key: 'retryCount', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 300, fixed: 'right' }
]

// 列显示控制
const columnVisibility = reactive({
  recipient: true,
  templateCode: true,
  subject: true,
  sendStatus: true,
  sendTime: true,
  retryCount: true,
  createTime: true
})

const configurableColumns = allColumns.filter(col => col.key !== 'action')

const visibleColumns = computed(() => {
  return allColumns.filter(col => {
    if (col.key === 'action') return true
    return columnVisibility[col.key]
  })
})

const toggleColumn = (key) => {
  columnVisibility[key] = !columnVisibility[key]
}

// 表格数据
const tableData = ref([])
const loading = ref(false)
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

// 表格多选
const selectedRowKeys = ref([])
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 详情
const detailVisible = ref(false)
const currentRecord = ref(null)

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    if (res.code === 200) {
      // 确保数据类型正确
      statistics.todayCount = Number(res.data.todayCount) || 0
      statistics.todaySuccess = Number(res.data.todaySuccess) || 0
      statistics.todayFailed = Number(res.data.todayFailed) || 0
      statistics.successRate = parseFloat(res.data.successRate) || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await queryRecordPage({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.code === 200) {
      tableData.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 时间范围变化
const handleDateChange = (dates, dateStrings) => {
  searchForm.startTime = dateStrings[0]
  searchForm.endTime = dateStrings[1]
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    templateCode: '',
    sendStatus: undefined,
    startTime: '',
    endTime: ''
  })
  dateRange.value = []
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  selectedRowKeys.value = [] // 翻页时清空选中
  loadData()
}

// 查看详情
const handleViewDetail = async (record) => {
  try {
    const res = await getRecordById(record.id)
    if (res.code === 200) {
      currentRecord.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('查看详情失败:', error)
  }
}

// 判断是否可以重发
const canResend = (record) => {
  // 1. 必须是失败状态
  if (record.sendStatus !== 'failed') {
    return false
  }
  
  // 2. 检查是否允许重发（0=不允许，1=允许）
  if (record.allowResend === 0) {
    return false
  }
  
  return true
}

// 获取重发按钮的提示文本
const getResendTooltip = (record) => {
  if (record.sendStatus !== 'failed') {
    return '只能重发失败的邮件'
  }
  
  if (record.allowResend === 0) {
    return '该邮件不允许重发（如验证码类邮件）'
  }
  
  return '重新发送'
}

// 重新发送
const handleResend = (record) => {
  Modal.confirm({
    title: '重发确认',
    content: h('div', [
      h('p', `确定要重新发送这封邮件吗？`),
      h('p', { style: 'margin-top: 8px;' }, `收件人：${record.recipient}`),
      h('p', `主题：${record.subject}`),
      h('p', `当前状态：${getStatusText(record.sendStatus)}`)
    ]),
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        const res = await resendMail(record.id)
        if (res.code === 200) {
          Message.success('重新发送成功')
          loadData()
          loadStatistics()
        }
      } catch (error) {
        console.error('重新发送失败:', error)
      }
    }
  })
}

// 删除
const handleDelete = async (id) => {
  try {
    const res = await deleteRecord(id)
    if (res.code === 200) {
      Message.success('删除成功')
      loadData()
      loadStatistics()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 批量重发
const handleBatchResend = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要重发的记录')
    return
  }
  
  if (selectedRowKeys.value.length > 50) {
    Message.warning('一次最多重发50条记录')
    return
  }
  
  // 筛选出可以重发的记录（失败状态 且 允许重发）
  const selectedRecords = tableData.value.filter(record => 
    selectedRowKeys.value.includes(record.id)
  )
  const canResendRecords = selectedRecords.filter(r => canResend(r))
  const cannotResendCount = selectedRecords.length - canResendRecords.length
  
  if (canResendRecords.length === 0) {
    Message.warning('所选记录均不可重发（需要是失败状态且允许重发）')
    return
  }
  
  // 构建提示信息
  const contentVNode = h('div', [
    h('p', `确定要重新发送选中的 ${canResendRecords.length} 条失败记录吗？`),
    cannotResendCount > 0 ? h('p', { 
      style: 'margin-top: 12px; color: var(--color-warning);'
    }, `注意：已自动过滤 ${cannotResendCount} 条不可重发的记录`) : null
  ].filter(Boolean))
  
  Modal.confirm({
    title: '批量重发确认',
    content: contentVNode,
    okText: '确定重发',
    cancelText: '取消',
    centered: true,
    width: 500,
    onOk: async () => {
      try {
        loading.value = true
        // 只发送可以重发的记录ID
        const canResendRecordIds = canResendRecords.map(r => r.id)
        const res = await batchResendMail(canResendRecordIds)
        if (res.code === 200) {
          Message.success(`批量重发任务已提交，共 ${canResendRecords.length} 条记录`)
          
          // 清空选中
          selectedRowKeys.value = []
          // 刷新数据
          loadData()
          loadStatistics()
        }
      } catch (error) {
        console.error('批量重发失败:', error)
        Message.error('批量重发失败：' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的记录')
    return
  }
  
  Modal.confirm({
    title: '批量删除确认',
    content: h('div', [
      h('p', `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`),
      h('p', { class: 'warning-text' }, '⚠️ 警告：删除后数据将无法恢复！')
    ]),
    okText: '确定删除',
    cancelText: '取消',
    centered: true,
    okType: 'danger',
    onOk: async () => {
      try {
        loading.value = true
        const res = await batchDeleteRecord(selectedRowKeys.value)
        if (res.code === 200) {
          Message.success(`批量删除成功！共删除 ${selectedRowKeys.value.length} 条记录`)
          selectedRowKeys.value = []
          loadData()
          loadStatistics()
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        Message.error('批量删除失败：' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }
  })
}

// 工具函数
const getStatusColor = (status) => {
  const colors = {
    pending: 'default',
    sending: 'processing',
    success: 'success',
    failed: 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发送',
    sending: '发送中',
    success: '成功',
    failed: '失败'
  }
  return texts[status] || status
}

onMounted(() => {
  loadStatistics()
  loadData()
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: none;
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

.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s ease;
}

.search-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-toolbar-card {
  margin-bottom: 24px;
  box-shadow: none;
  
  :deep(.ant-card-body) {
    padding: 16px 24px;
  }
}

.statistics-toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 24px;
}

.statistics-cards {
  display: flex;
  gap: 16px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--color-fill);
  border-radius: var(--border-radius);
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 20px;
  
  &.today {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.success {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    color: var(--color-success);
  }
  
  &.error {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: var(--color-error);
  }
  
  &.rate {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: var(--color-primary);
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1;
  
  &.success {
    color: var(--color-success);
  }
  
  &.error {
    color: var(--color-error);
  }
  
  &.primary {
    color: var(--color-primary);
  }
}

.warning-text {
  margin-top: 12px;
  color: var(--color-error);
  font-weight: 600;
}

.error-text {
  color: var(--color-error);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
}

.mail-content-preview {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: var(--color-bg-layout);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  
  :deep(img) {
    max-width: 100%;
    height: auto;
  }
  
  :deep(table) {
    max-width: 100%;
    border-collapse: collapse;
  }
}
</style>
