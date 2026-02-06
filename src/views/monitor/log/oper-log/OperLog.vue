<template>
  <div class="operlog-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" style="margin-bottom: 16px;">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="操作模块">
          <a-input
            v-model:value="searchForm.title"
            placeholder="请输入操作模块"
            allow-clear
            style="width: 200px;"
          />
        </a-form-item>
        <a-form-item label="操作人员">
          <a-input
            v-model:value="searchForm.operName"
            placeholder="请输入操作人员"
            allow-clear
            style="width: 200px;"
          />
        </a-form-item>
        <a-form-item label="操作状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px;"
          >
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="0">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作时间">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
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

    <!-- 表格区域 -->
    <a-card :bordered="false">
      <div style="margin-bottom: 16px;">
        <a-space>
          <a-button
            type="primary"
            danger
            :disabled="!hasSelected"
            @click="handleBatchDelete"
          >
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
          <a-button danger @click="handleClean">
            <template #icon><ClearOutlined /></template>
            清空
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
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
            <span>{{ record.costTime }}ms</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
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
      title="操作日志详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="操作模块">
          {{ detailData.title }}
        </a-descriptions-item>
        <a-descriptions-item label="业务类型">
          {{ getBusinessTypeText(detailData.businessType) }}
        </a-descriptions-item>
        <a-descriptions-item label="请求方式">
          {{ detailData.requestMethod }}
        </a-descriptions-item>
        <a-descriptions-item label="操作人员">
          {{ detailData.operName }}
        </a-descriptions-item>
        <a-descriptions-item label="操作地址" :span="2">
          {{ detailData.operUrl }}
        </a-descriptions-item>
        <a-descriptions-item label="操作IP">
          {{ detailData.operIp }}
        </a-descriptions-item>
        <a-descriptions-item label="操作地点">
          {{ detailData.operLocation }}
        </a-descriptions-item>
        <a-descriptions-item label="操作状态">
          <a-tag :color="detailData.status === 1 ? 'success' : 'error'">
            {{ detailData.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="消耗时间">
          {{ detailData.costTime }}ms
        </a-descriptions-item>
        <a-descriptions-item label="操作时间" :span="2">
          {{ detailData.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="方法名称" :span="2">
          {{ detailData.method }}
        </a-descriptions-item>
        <a-descriptions-item label="请求参数" :span="2">
          <div style="max-height: 200px; overflow-y: auto;">
            <pre>{{ detailData.operParam || '无' }}</pre>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="返回结果" :span="2">
          <div style="max-height: 200px; overflow-y: auto;">
            <pre>{{ detailData.jsonResult || '无' }}</pre>
          </div>
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.errorMsg" label="错误信息" :span="2">
          <div style="max-height: 200px; overflow-y: auto; color: red;">
            <pre>{{ detailData.errorMsg }}</pre>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import { getOperLogList, deleteOperLog, cleanOperLog } from '@/api/operlog'

// 搜索表单
const searchForm = reactive({
  title: '',
  operName: '',
  status: undefined,
  dateRange: []
})

// 表格数据
const dataSource = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

// 表格列配置
const columns = [
  {
    title: '日志编号',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '操作模块',
    dataIndex: 'title',
    key: 'title',
    width: 120
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    key: 'businessType',
    width: 100
  },
  {
    title: '请求方式',
    dataIndex: 'requestMethod',
    key: 'requestMethod',
    width: 100
  },
  {
    title: '操作人员',
    dataIndex: 'operName',
    key: 'operName',
    width: 120
  },
  {
    title: '操作IP',
    dataIndex: 'operIp',
    key: 'operIp',
    width: 140
  },
  {
    title: '操作地点',
    dataIndex: 'operLocation',
    key: 'operLocation',
    width: 150
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '消耗时间',
    dataIndex: 'costTime',
    key: 'costTime',
    width: 100
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100
  }
]

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 详情弹窗
const detailVisible = ref(false)
const detailData = ref({})

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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      title: searchForm.title,
      operName: searchForm.operName,
      status: searchForm.status
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.beginTime = searchForm.dateRange[0].format('YYYY-MM-DD')
      params.endTime = searchForm.dateRange[1].format('YYYY-MM-DD')
    }

    const res = await getOperLogList(params)
    if (res.code === 200) {
      dataSource.value = res.data.records
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
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

// 刷新
const handleRefresh = () => {
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
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
    onOk: async () => {
      try {
        const res = await deleteOperLog(selectedRowKeys.value)
        if (res.code === 200) {
          message.success('删除成功')
          selectedRowKeys.value = []
          loadData()
        }
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 清空
const handleClean = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有操作日志吗？此操作不可恢复！',
    okText: '确定',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await cleanOperLog()
        if (res.code === 200) {
          message.success('清空成功')
          loadData()
        }
      } catch (error) {
        message.error('清空失败')
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.operlog-container {
  padding: 16px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
