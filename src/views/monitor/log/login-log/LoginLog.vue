<template>
  <div class="logininfor-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" style="margin-bottom: 16px;">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="登录账号">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入登录账号"
            allow-clear
            style="width: 200px;"
          />
        </a-form-item>
        <a-form-item label="登录IP">
          <a-input
            v-model:value="searchForm.ipaddr"
            placeholder="请输入登录IP"
            allow-clear
            style="width: 200px;"
          />
        </a-form-item>
        <a-form-item label="登录状态">
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
        <a-form-item label="登录时间">
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
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
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
import { getLoginLogList, deleteLoginLog, cleanLoginLog } from '@/api/logininfor'

// 搜索表单
const searchForm = reactive({
  username: '',
  ipaddr: '',
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
    title: '登录账号',
    dataIndex: 'username',
    key: 'username',
    width: 150
  },
  {
    title: '登录IP',
    dataIndex: 'ipaddr',
    key: 'ipaddr',
    width: 150
  },
  {
    title: '登录地点',
    dataIndex: 'loginLocation',
    key: 'loginLocation',
    width: 150
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
    width: 120
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
    width: 120
  },
  {
    title: '登录状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '提示消息',
    dataIndex: 'msg',
    key: 'msg',
    width: 150
  },
  {
    title: '登录时间',
    dataIndex: 'loginTime',
    key: 'loginTime',
    width: 180
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      username: searchForm.username,
      ipaddr: searchForm.ipaddr,
      status: searchForm.status
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.beginTime = searchForm.dateRange[0].format('YYYY-MM-DD')
      params.endTime = searchForm.dateRange[1].format('YYYY-MM-DD')
    }

    const res = await getLoginLogList(params)
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
  searchForm.username = ''
  searchForm.ipaddr = ''
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

// 批量删除
const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
    onOk: async () => {
      try {
        const res = await deleteLoginLog(selectedRowKeys.value)
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
    content: '确定要清空所有登录日志吗？此操作不可恢复！',
    okText: '确定',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await cleanLoginLog()
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
.logininfor-container {
  padding: 16px;
}
</style>
