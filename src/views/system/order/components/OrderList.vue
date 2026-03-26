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
            <DictSelect
              v-model:value="searchForm.channel"
              :dict-type="DICT_TYPES.PAYMENT_CHANNEL"
              placeholder="支付渠道"
              style="width: 140px"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-select
              v-model:value="searchForm.tradeStatus"
              placeholder="交易状态"
              style="width: 140px"
              allow-clear
            >
              <a-select-option value="WAIT_BUYER_PAY">等待付款</a-select-option>
              <a-select-option value="TRADE_SUCCESS">支付成功</a-select-option>
              <a-select-option value="TRADE_CLOSED">已关闭</a-select-option>
              <a-select-option value="TRADE_FINISHED">已完成</a-select-option>
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
          <span class="card-title">订单列表</span>
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
          <template v-if="column.key === 'channel'">
            <a-tag :color="record.channel === 'alipay' ? 'blue' : 'green'">
              {{ record.channel === 'alipay' ? '支付宝' : '微信支付' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'tradeStatus'">
            <a-tag :color="getTradeStatusColor(record.tradeStatus)">
              {{ getTradeStatusText(record.tradeStatus) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'amount'">
            <span style="color: var(--color-error); font-weight: 600;">
              ¥{{ record.amount }}
            </span>
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
                title="确定要删除这条订单吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger v-permission.disable="'system:order:delete'">
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
          <span class="drawer-title">订单详情</span>
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
          <a-descriptions-item label="订单ID">{{ currentRecord.id }}</a-descriptions-item>
          <a-descriptions-item label="商户订单号">{{ currentRecord.outTradeNo }}</a-descriptions-item>
          <a-descriptions-item label="用户ID">{{ currentRecord.userId }}</a-descriptions-item>
          <a-descriptions-item label="渠道交易号">{{ currentRecord.tradeNo || '-' }}</a-descriptions-item>
          <a-descriptions-item label="订单标题">{{ currentRecord.subject }}</a-descriptions-item>
          <a-descriptions-item label="订单描述">{{ currentRecord.body || '-' }}</a-descriptions-item>
          <a-descriptions-item label="订单金额">
            <span style="color: var(--color-error); font-weight: 600;">¥{{ currentRecord.amount }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="支付渠道">
            <a-tag :color="currentRecord.channel === 'alipay' ? 'blue' : 'green'">
              {{ currentRecord.channel === 'alipay' ? '支付宝' : '微信支付' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="支付产品">{{ currentRecord.product }}</a-descriptions-item>
          <a-descriptions-item label="交易状态">
            <a-tag :color="getTradeStatusColor(currentRecord.tradeStatus)">
              {{ getTradeStatusText(currentRecord.tradeStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="支付时间">{{ currentRecord.payTime || '-' }}</a-descriptions-item>
          <a-descriptions-item label="关闭时间">{{ currentRecord.closeTime || '-' }}</a-descriptions-item>
          <a-descriptions-item label="备注">{{ currentRecord.remark || '-' }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentRecord.createTime }}</a-descriptions-item>
          <a-descriptions-item label="二维码链接" v-if="currentRecord.qrCode">
            <a :href="currentRecord.qrCode" target="_blank">{{ currentRecord.qrCode }}</a>
          </a-descriptions-item>
          <a-descriptions-item label="支付跳转链接" v-if="currentRecord.payUrl">
            <a :href="currentRecord.payUrl" target="_blank">{{ currentRecord.payUrl }}</a>
          </a-descriptions-item>
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
import DictSelect from '@/components/custom/DictSelect.vue'
import { DICT_TYPES } from '@/constants/dictTypes'
import { queryOrderPage, getOrderById, deleteOrder } from '@/api/payment'

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
  channel: undefined,
  tradeStatus: undefined,
  startTime: '',
  endTime: ''
})
const dateRange = ref([])

const allColumns = [
  { title: '商户订单号', dataIndex: 'outTradeNo', key: 'outTradeNo', width: 220, ellipsis: true, fixed: 'left' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 180 },
  { title: '渠道交易号', dataIndex: 'tradeNo', key: 'tradeNo', width: 220, ellipsis: true },
  { title: '订单标题', dataIndex: 'subject', key: 'subject', width: 180, ellipsis: true },
  { title: '金额', key: 'amount', width: 100 },
  { title: '支付渠道', key: 'channel', width: 100 },
  { title: '支付产品', dataIndex: 'product', key: 'product', width: 120 },
  { title: '交易状态', key: 'tradeStatus', width: 110 },
  { title: '支付时间', dataIndex: 'payTime', key: 'payTime', width: 180 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' }
]

const columnVisibility = reactive({
  outTradeNo: true,
  userId: true,
  tradeNo: true,
  subject: true,
  amount: true,
  channel: true,
  product: true,
  tradeStatus: true,
  payTime: true,
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
    const res = await queryOrderPage({
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
    channel: undefined,
    tradeStatus: undefined,
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
  const res = await getOrderById(record.id)
  if (res.code === 200) {
    currentRecord.value = res.data
    detailVisible.value = true
  }
}

const handleDelete = async (id) => {
  const res = await deleteOrder(id)
  if (res.code === 200) {
    Message.success('删除成功')
    loadData()
  }
}

const getTradeStatusColor = (status) => {
  const map = {
    WAIT_BUYER_PAY: 'warning',
    TRADE_SUCCESS: 'success',
    TRADE_CLOSED: 'default',
    TRADE_FINISHED: 'purple'
  }
  return map[status] || 'default'
}

const getTradeStatusText = (status) => {
  const map = {
    WAIT_BUYER_PAY: '等待付款',
    TRADE_SUCCESS: '支付成功',
    TRADE_CLOSED: '已关闭',
    TRADE_FINISHED: '已完成'
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
