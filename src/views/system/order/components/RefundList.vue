<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item>
            <a-input
              v-model:value="searchForm.outTradeNo"
              placeholder="商户订单号"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="searchForm.outRequestNo"
              placeholder="退款请求号"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-select
              v-model:value="searchForm.refundStatus"
              placeholder="退款状态"
              style="width: 140px"
              allow-clear
            >
              <a-select-option value="PENDING">处理中</a-select-option>
              <a-select-option value="REFUND_SUCCESS">退款成功</a-select-option>
              <a-select-option value="REFUND_FAILED">退款失败</a-select-option>
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

    <!-- 表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <span class="card-title">退款记录</span>
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
      </template>

      <a-table
        :columns="visibleColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 'max-content' }"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'refundStatus'">
            <a-tag :color="getRefundStatusColor(record.refundStatus)">
              {{ getRefundStatusText(record.refundStatus) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'refundAmount'">
            <span style="color: var(--color-warning); font-weight: 600;">
              ¥{{ record.refundAmount }}
            </span>
          </template>

          <template v-if="column.key === 'fundChange'">
            <a-tag :color="record.fundChange === 'Y' ? 'success' : 'default'">
              {{ record.fundChange === 'Y' ? '已到账' : (record.fundChange === 'N' ? '未到账' : '-') }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-tooltip title="详情">
                <a-button type="link" size="small" @click="handleViewDetail(record)">
                  <template #icon><EyeOutlined /></template>
                  详情
                </a-button>
              </a-tooltip>
              <a-popconfirm
                title="确定要删除这条退款记录吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger v-permission.disable="'system:order_refund:delete'">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
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
          <span class="drawer-title">退款详情</span>
          <a-button @click="detailVisible = false">关闭</a-button>
        </div>
      </template>

      <div :style="cssVars" v-if="currentRecord">
        <a-descriptions
          bordered
          :column="1"
          :labelStyle="{ width: '140px', whiteSpace: 'nowrap' }"
          :contentStyle="{ wordBreak: 'break-all' }"
        >
          <a-descriptions-item label="记录ID">{{ currentRecord.id }}</a-descriptions-item>
          <a-descriptions-item label="商户订单号">{{ currentRecord.outTradeNo }}</a-descriptions-item>
          <a-descriptions-item label="用户ID">{{ currentRecord.userId }}</a-descriptions-item>
          <a-descriptions-item label="退款请求号">{{ currentRecord.outRequestNo }}</a-descriptions-item>
          <a-descriptions-item label="退款金额">
            <span style="color: var(--color-warning); font-weight: 600;">¥{{ currentRecord.refundAmount }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="退款原因">{{ currentRecord.refundReason || '-' }}</a-descriptions-item>
          <a-descriptions-item label="退款状态">
            <a-tag :color="getRefundStatusColor(currentRecord.refundStatus)">
              {{ getRefundStatusText(currentRecord.refundStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="资金是否到账">
            <a-tag :color="currentRecord.fundChange === 'Y' ? 'success' : 'default'">
              {{ currentRecord.fundChange === 'Y' ? '已到账' : (currentRecord.fundChange === 'N' ? '未到账' : '-') }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="失败原因" v-if="currentRecord.errorMessage">
            <span style="color: var(--color-error);">{{ currentRecord.errorMessage }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentRecord.createTime }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentRecord.updateTime }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import { queryRefundPage, getRefundById, deleteRefund } from '@/api/payment'

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
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder,
    '--color-fill': t.colorFillQuaternary,
    '--border-radius': `${t.borderRadius}px`,
  }
})

const searchVisible = ref(true)
const toggleSearch = () => { searchVisible.value = !searchVisible.value }

const searchForm = reactive({
  outTradeNo: '',
  outRequestNo: '',
  refundStatus: undefined,
  startTime: '',
  endTime: ''
})
const dateRange = ref([])

const allColumns = [
  { title: '商户订单号', dataIndex: 'outTradeNo', key: 'outTradeNo', width: 220, ellipsis: true, fixed: 'left' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 180 },
  { title: '退款请求号', dataIndex: 'outRequestNo', key: 'outRequestNo', width: 220, ellipsis: true },
  { title: '退款金额', key: 'refundAmount', width: 110 },
  { title: '退款状态', key: 'refundStatus', width: 110 },
  { title: '资金到账', key: 'fundChange', width: 100 },
  { title: '退款原因', dataIndex: 'refundReason', key: 'refundReason', width: 160, ellipsis: true },
  { title: '失败原因', dataIndex: 'errorMessage', key: 'errorMessage', width: 200, ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' }
]

const columnVisibility = reactive({
  outTradeNo: true,
  userId: true,
  outRequestNo: true,
  refundAmount: true,
  refundStatus: true,
  fundChange: true,
  refundReason: true,
  errorMessage: true,
  createTime: true,
  updateTime: false
})

const configurableColumns = allColumns.filter(col => col.key !== 'action')
const visibleColumns = computed(() =>
  allColumns.filter(col => col.key === 'action' || columnVisibility[col.key])
)
const toggleColumn = (key) => { columnVisibility[key] = !columnVisibility[key] }

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

const detailVisible = ref(false)
const currentRecord = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await queryRefundPage({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.code === 200) {
      tableData.value = res.data.data
      pagination.total = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleDateChange = (_, dateStrings) => {
  searchForm.startTime = dateStrings[0]
  searchForm.endTime = dateStrings[1]
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    outTradeNo: '',
    outRequestNo: '',
    refundStatus: undefined,
    startTime: '',
    endTime: ''
  })
  dateRange.value = []
  handleSearch()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleViewDetail = async (record) => {
  const res = await getRefundById(record.id)
  if (res.code === 200) {
    currentRecord.value = res.data
    detailVisible.value = true
  }
}

const handleDelete = async (id) => {
  const res = await deleteRefund(id)
  if (res.code === 200) {
    Message.success('删除成功')
    loadData()
  }
}

const getRefundStatusColor = (status) => {
  const map = {
    PENDING: 'processing',
    REFUND_SUCCESS: 'success',
    REFUND_FAILED: 'error'
  }
  return map[status] || 'default'
}

const getRefundStatusText = (status) => {
  const map = {
    PENDING: '处理中',
    REFUND_SUCCESS: '退款成功',
    REFUND_FAILED: '退款失败'
  }
  return map[status] || status
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 24px;
}

.search-form-compact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  :deep(.ant-form-item) {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s ease;
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
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
</style>
