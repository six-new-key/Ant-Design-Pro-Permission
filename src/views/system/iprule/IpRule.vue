<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <a-card :bordered="false" class="search-card">
      <div class="search-form">
        <div class="search-form-left">
          <a-form layout="inline" :model="searchForm" ref="searchFormRef">
            <a-form-item name="status">
              <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 200px">
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
        <div class="search-form-right">
          <a-space :size="20">
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
        </div>
      </div>
    </a-card>

    <!-- 数据表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <div class="left">
            <a-space :size="20">
              <a-button type="primary" @click="handleAdd">
                <template #icon>
                  <PlusOutlined />
                </template>
                新增
              </a-button>
              <a-button @click="handleRefreshCache">
                <template #icon>
                  <SyncOutlined />
                </template>
                刷新缓存
              </a-button>
            </a-space>
          </div>
          <div class="right">
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
              <template #icon>
                <DeleteOutlined />
              </template>
              删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
            </a-button>
          </div>
        </div>
      </template>

      <a-table ref="tableRef" :dataSource="tableData" :columns="columns" :loading="loading" :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" row-key="id"
        @change="handleTableChange" :scroll="{ x: 1000, y: tableMaxHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'banType'">
            <a-tag :color="record.banType === 2 ? 'orange' : 'blue'">
              {{ record.banType === 2 ? '自动' : '手动' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'default'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-popconfirm title="确认删除该IP黑名单吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑IP黑名单弹窗 -->
    <a-modal v-model:open="ipBlacklistDialogVisible" :title="isEdit ? '编辑IP黑名单' : '新增IP黑名单'" width="600px"
      @ok="handleIpBlacklistSubmit" @cancel="ipBlacklistDialogVisible = false" :confirmLoading="submitLoading" centered>
      <a-form ref="ipBlacklistFormRef" :model="ipBlacklistForm" :rules="ipBlacklistFormRules" layout="vertical"
        class="ip-blacklist-form">
        <a-form-item label="IP地址" name="ip" class="form-item">
          <a-input v-model:value="ipBlacklistForm.ip" placeholder="支持单个IP（如：192.168.1.100）或CIDR格式（如：192.168.1.0/24）"
            allow-clear />
          <div class="form-tip">
            支持精确IP匹配和CIDR网段格式
          </div>
        </a-form-item>

        <a-form-item label="原因" name="reason" class="form-item">
          <a-textarea v-model:value="ipBlacklistForm.reason" placeholder="请输入加入黑名单的原因（如：恶意攻击、暴力破解等）" :rows="3"
            allow-clear />
          <div class="form-tip">
            建议填写原因，方便后续管理
          </div>
        </a-form-item>

        <a-form-item label="状态" name="status" class="form-item">
          <a-radio-group v-model:value="ipBlacklistForm.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { Modal, theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import {
  queryIpBlacklistList,
  addIpBlacklist,
  updateIpBlacklist,
  batchDeleteIpBlacklist,
  echoIpBlacklist,
  refreshIpBlacklistCache
} from '@/api/iprule'

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
    '--color-text-secondary': t.colorTextSecondary,
    '--color-text-tertiary': t.colorTextTertiary,
    '--color-border': t.colorBorder,
  }
})

// ==================== 响应式数据定义 ====================
const loading = ref(false)
const submitLoading = ref(false)

const tableData = ref([])
const selectedRowKeys = ref([])

const ipBlacklistDialogVisible = ref(false)
const isEdit = ref(false)

const isFullscreen = ref(false)

const ipBlacklistFormRef = ref()
const searchFormRef = ref()

// ==================== 表单数据定义 ====================
const searchForm = reactive({
  status: undefined
})

const ipBlacklistForm = reactive({
  id: null,
  ip: '',
  reason: '',
  status: 1
})

// ==================== 分页配置 ====================
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// ==================== 表格列配置 ====================
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    fixed: 'left'
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 200
  },
  {
    title: '封禁类型',
    dataIndex: 'banType',
    key: 'banType',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '原因',
    dataIndex: 'reason',
    key: 'reason',
    width: 300,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'operation',
    width: 180,
    fixed: 'right'
  }
]

// ==================== 表单验证规则 ====================
const ipBlacklistFormRules = {
  ip: [
    { required: true, message: 'IP地址不能为空', trigger: 'blur' },
    {
      validator: async (_rule, value) => {
        if (!value) return Promise.resolve()

        // 验证单个IP格式
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        // 验证CIDR格式
        const cidrPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/

        if (!ipPattern.test(value) && !cidrPattern.test(value)) {
          return Promise.reject('请输入正确的IP地址或CIDR格式（如：192.168.1.0/24）')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// ==================== 计算属性 ====================
const tableMaxHeight = computed(() => {
  return isFullscreen.value ? undefined : '420px'
})

// ==================== 业务方法定义 ====================
const fetchIpBlacklistList = async () => {
  loading.value = true
  const params = {
    status: searchForm.status !== undefined ? searchForm.status : ''
  }

  const response = await queryIpBlacklistList(pagination.current, pagination.pageSize, params)
  if (response.code === 200 && response.data !== null) {
    tableData.value = response.data.data || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

const handleSearch = () => {
  pagination.current = 1
  fetchIpBlacklistList()
}

const handleReset = () => {
  searchForm.status = undefined
  pagination.current = 1
  fetchIpBlacklistList()
}

const handleAdd = () => {
  isEdit.value = false
  resetIpBlacklistForm()
  ipBlacklistDialogVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  const response = await echoIpBlacklist(record.id)
  if (response.code === 200) {
    // 只赋值需要的字段，避免提交多余字段
    ipBlacklistForm.id = response.data.id
    ipBlacklistForm.ip = response.data.ip
    ipBlacklistForm.reason = response.data.reason
    ipBlacklistForm.status = response.data.status
    ipBlacklistDialogVisible.value = true
  }
}

const handleDelete = async (record) => {
  const response = await batchDeleteIpBlacklist([record.id])
  if (response.code === 200) {
    Message.success('删除成功')
    fetchIpBlacklistList()
  }
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的IP黑名单')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条IP黑名单吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      const response = await batchDeleteIpBlacklist(selectedRowKeys.value)
      if (response.code === 200) {
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchIpBlacklistList()
      }
    }
  })
}

const handleRefreshCache = async () => {
  loading.value = true
  const response = await refreshIpBlacklistCache()
  if (response.code === 200) {
    Message.success('缓存刷新成功')
  }
  loading.value = false
}

const handleIpBlacklistSubmit = () => {
  ipBlacklistFormRef.value.validate().then(async () => {
    submitLoading.value = true
    const apiMethod = isEdit.value ? updateIpBlacklist : addIpBlacklist
    const response = await apiMethod(ipBlacklistForm)

    if (response.code === 200) {
      Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
      ipBlacklistDialogVisible.value = false
      fetchIpBlacklistList()
    }
    submitLoading.value = false
  }).catch(() => {
    // validation failed
  })
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchIpBlacklistList()
}

const resetIpBlacklistForm = () => {
  Object.assign(ipBlacklistForm, {
    id: null,
    ip: '',
    reason: '',
    status: 1
  })
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  fetchIpBlacklistList()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  isFullscreen.value = !!document.fullscreenElement
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form-left {
  flex: 1;
}

.search-form-right {
  margin-left: 16px;
}

.table-header-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
</style>
