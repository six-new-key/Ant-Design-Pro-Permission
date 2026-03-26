<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" ref="searchFormRef" class="search-form-compact">
          <a-form-item name="status">
            <DictSelect 
              v-model:value="searchForm.status" 
              dict-type="ip_rule_status" 
              placeholder="请选择状态" 
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
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:iprule:add'">
              <template #icon><PlusOutlined /></template>
              新增
            </a-button>
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete" v-permission.disable="'system:iprule:remove'">
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
                  <template #icon>
                    <SettingOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-dropdown>

            <a-dropdown placement="bottomRight">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="refresh" @click="handleRefreshCache" v-if="hasPermission('system:iprule:refresh')">
                    <SyncOutlined />
                    <span style="margin-left: 8px;">刷新缓存</span>
                  </a-menu-item>
                  <a-menu-item key="import" @click="handleImport" v-if="hasPermission('system:iprule:import')">
                    <UploadOutlined />
                    <span style="margin-left: 8px;">导入</span>
                  </a-menu-item>
                  <a-menu-item key="export" @click="handleExport" v-if="hasPermission('system:iprule:export')">
                    <DownloadOutlined />
                    <span style="margin-left: 8px;">导出</span>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-tooltip title="更多操作">
                <a-button shape="circle">
                  <template #icon>
                    <MoreOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

      <a-table ref="tableRef" :dataSource="tableData" :columns="visibleColumns" :loading="loading" :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" row-key="id"
        @change="handleTableChange" :scroll="{ x: 'max-content' }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'banType'">
            <a-tag :color="record.banType === 2 ? 'orange' : 'blue'">
              {{ record.banType === 2 ? '自动' : '手动' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-switch 
              :checked="record.status === 1" 
              checked-children="启用" 
              un-checked-children="禁用"
              @change="() => handleToggleStatus(record)"
            />
          </template>
          <template v-if="column.key === 'operation'">
            <a-space :size="8">
              <a-tooltip title="编辑">
                <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:iprule:edit'">
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
              </a-tooltip>
              <a-popconfirm title="确认删除该IP黑名单吗？" @confirm="handleDelete(record)" v-permission.disable="'system:iprule:remove'">
                <a-tooltip title="删除">
                  <a-button type="link" danger size="small">
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

    <!-- 新增/编辑IP黑名单弹窗 -->
    <a-modal
      v-model:open="ipBlacklistDialogVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ isEdit ? '编辑IP黑名单' : '新增IP黑名单' }}</span>
          <a-space :size="12">
            <a-button @click="ipBlacklistDialogVisible = false">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="handleIpBlacklistSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
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
        </a-form>
      </div>
    </a-modal>

    <!-- 导入IP黑名单弹窗 -->
    <a-modal
      v-model:open="importDialogVisible"
      width="500px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">导入</span>
          <a-space :size="12">
            <a-button @click="handleDownloadTemplate" v-permission.disable="'system:iprule:importTemplate'">
              <template #icon><DownloadOutlined /></template>
              下载模板
            </a-button>
            <a-button @click="handleImportCancel">取消</a-button>
            <a-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-upload-dragger
          v-model:file-list="importFileList"
          :before-upload="beforeUpload"
          @change="handleFileChange"
          accept=".xlsx,.xls"
          multiple
          :max-count="5">
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p class="ant-upload-hint">
            支持 .xls 和 .xlsx 格式，最多上传 5 个文件
          </p>
        </a-upload-dragger>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Modal, theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SyncOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  MoreOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import { usePermission } from '@/utils/usePermission'
import {
  queryIpBlacklistList,
  addIpBlacklist,
  updateIpBlacklist,
  batchDeleteIpBlacklist,
  echoIpBlacklist,
  refreshIpBlacklistCache,
  updateIpBlacklistStatus
} from '@/api/iprule'
import { useIpBlacklistImportExport } from './composables/useIpBlacklistImportExport'

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

const searchVisible = ref(true)
const columnVisibility = ref({
  id: true,
  ip: true,
  banType: true,
  status: true,
  reason: true,
  createTime: true
})

const ipBlacklistFormRef = ref()
const searchFormRef = ref()

// ==================== 表单数据定义 ====================
const searchForm = reactive({
  status: undefined
})

const ipBlacklistForm = reactive({
  id: null,
  ip: '',
  reason: ''
})

// ==================== 分页配置 ====================
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

// ==================== 表格列配置 ====================
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180,
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
  ]
}

// ==================== 业务方法定义 ====================
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

const toggleColumn = (key) => {
  columnVisibility.value[key] = !columnVisibility.value[key]
}

const visibleColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'operation') return true
    return columnVisibility.value[col.key] !== false
  })
})

const configurableColumns = computed(() => {
  return columns.filter(col => col.key !== 'operation')
})


const fetchIpBlacklistList = async () => {
  loading.value = true
  const data = {
    status: searchForm.status !== undefined ? searchForm.status : undefined,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  }

  const response = await queryIpBlacklistList(data)
  if (response.code === 200 && response.data !== null) {
    tableData.value = response.data.data || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

// ==================== 导入导出功能 ====================
const {
  exportLoading,
  handleExport,
  importDialogVisible,
  importFileList,
  importLoading,
  updateSupport,
  handleImport,
  handleDownloadTemplate,
  beforeUpload,
  handleFileChange,
  handleImportSubmit,
  handleImportCancel
} = useIpBlacklistImportExport(fetchIpBlacklistList, searchForm)

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
    ipBlacklistDialogVisible.value = true
  }
}

const handleToggleStatus = (record) => {
  const action = record.status === 1 ? '禁用' : '启用'
  const okType = record.status === 1 ? 'danger' : 'primary'

  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}该IP黑名单吗？`,
    okText: '确定',
    cancelText: '取消',
    okType,
    centered: true,
    onOk: async () => {
      const response = await updateIpBlacklistStatus(record.id)
      if (response.code === 200) {
        Message.success(`${action}成功`)
        fetchIpBlacklistList()
      }
    }
  })
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
    reason: ''
  })
}

onMounted(() => {
  fetchIpBlacklistList()
})
</script>

<style scoped lang="scss">
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

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
</style>
