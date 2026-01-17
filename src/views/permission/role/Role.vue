<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <a-card :bordered="false" class="search-card">
      <div class="search-form">
        <div class="search-form-left">
          <a-form layout="inline" :model="searchForm" ref="searchFormRef">
            <a-form-item name="name">
              <a-input v-model:value="searchForm.name" placeholder="请输入角色名称" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="code">
              <a-input v-model:value="searchForm.code" placeholder="请输入角色编码" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="status">
              <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 200px">
                <a-select-option value="1">启用</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
        <div class="search-form-right">
          <a-space>
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
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="table-header-actions">
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <PlusOutlined />
            </template>
            新增
          </a-button>
          <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            <template #icon>
              <DeleteOutlined />
            </template>
            删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
          </a-button>
        </div>
      </template>

      <a-table
        ref="tableRef"
        :dataSource="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 1000, y: tableMaxHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" :disabled="record.id === 1" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-popconfirm title="确认删除该角色吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small" :disabled="record.id === 1">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
              <a-button type="link" size="small" :disabled="record.id === 1" style="color: #52c41a" @click="handleAssignPermission(record)">
                 <template #icon>
                  <UserOutlined />
                 </template>
                 分配权限
              </a-button>
              <a-popconfirm
                :title="`确定要${record.status === 1 ? '禁用' : '启用'}角色 &quot;${record.name}&quot; 吗？`"
                @confirm="handleToggleStatus(record)"
              >
                <a-button type="link" :class="record.status === 1 ? 'warning-text' : 'success-text'" size="small" :disabled="record.id === 1">
                   <template #icon>
                     <component :is="record.status === 1 ? 'PoweroffOutlined' : 'CheckCircleOutlined'" />
                   </template>
                   {{ record.status === 1 ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:open="roleDialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="700px"
      @ok="handleRoleSubmit"
      @cancel="roleDialogVisible = false"
      :confirmLoading="submitLoading"
      centered
    >
      <div :style="cssVars">
        <a-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" layout="vertical" class="role-form">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="角色名称" name="name">
                <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="角色编码" name="code">
                <a-input v-model:value="roleForm.code" placeholder="请输入角色编码" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="状态" name="status">
                <a-radio-group v-model:value="roleForm.status">
                  <a-radio :value="1">启用</a-radio>
                  <a-radio :value="0">禁用</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>

    <!-- 权限分配组件 -->
    <PermissionAssignDialog
      v-model:visible="permissionDialogVisible"
      :roleInfo="currentRole"
      :allPermissions="allPermissions"
      :rolePermissions="currentRolePermissions"
      @save-success="handlePermissionSaveSuccess"
    />
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
  UserOutlined,
  PoweroffOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import {
  addRole,
  updateRole,
  batchDeleteRole,
  updateRoleStatus,
  queryRoleListByPage,
  echoRole
} from '@/api/role'
import { queryMenuListWithPermission, queryRoleMenuList } from '@/api/menu'
import PermissionAssignDialog from '@/components/core/PermissionAssignDialog.vue'

const { useToken } = theme
const { token } = useToken()

/**
 * 特别说明：为什么不直接使用 v-bind('token.xxx')？
 * 
 * 参见 User.vue 中的说明。
 * 为了解决 Ant Design Vue Modal 组件 Teleport 导致的 CSS 变量继承问题。
 */
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-success': t.colorSuccess,
    '--color-warning': t.colorWarning,
    '--color-error': t.colorError,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder
  }
})

// ==================== 响应式数据定义 ====================
const loading = ref(false)
const submitLoading = ref(false)

const tableData = ref([])
const selectedRowKeys = ref([])

const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)

const isEdit = ref(false)
const currentRole = ref({})

const allPermissions = ref([])
const currentRolePermissions = ref([])

const isFullscreen = ref(false)

const roleFormRef = ref()
const searchFormRef = ref()

// ==================== 表单数据定义 ====================
const searchForm = reactive({
  name: '',
  code: '',
  status: undefined
})

const roleForm = reactive({
  id: null,
  name: '',
  code: '',
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
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '角色编码',
    dataIndex: 'code',
    key: 'code',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
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
    width: 280,
    fixed: 'right'
  }
]

// ==================== 表单验证规则 ====================
const roleFormRules = {
  name: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度为2-20个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '角色编码不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '角色编码长度为2-20个字符', trigger: 'blur' }
  ]
}

// ==================== 计算属性 ====================
const tableMaxHeight = computed(() => {
  return isFullscreen.value ? undefined : '420px'
})

// ==================== 业务方法定义 ====================
/**
 * 加载所有权限数据
 */
const loadAllPermissions = async () => {
  try {
    const response = await queryMenuListWithPermission()
    if (response.code === 200) {
      allPermissions.value = response.data || []
    }
  } catch (error) {
    console.error('加载权限数据失败:', error)
    Message.error('加载权限数据失败')
  }
}

const fetchRoleList = async () => {
  loading.value = true
  const params = {
    name: searchForm.name ? searchForm.name.trim() : '',
    code: searchForm.code ? searchForm.code.trim() : '',
    status: searchForm.status !== undefined ? Number(searchForm.status) : null
  }

  const response = await queryRoleListByPage(pagination.current, pagination.pageSize, params)
  if (response.code === 200 && response.data !== null) {
    tableData.value = response.data.data || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

const handleSearch = () => {
  pagination.current = 1
  fetchRoleList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = undefined
  pagination.current = 1
  fetchRoleList()
}

const handleAdd = () => {
  isEdit.value = false
  resetRoleForm()
  roleDialogVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  const response = await echoRole(record.id)
  if (response.code === 200) {
    Object.assign(roleForm, response.data)
    roleDialogVisible.value = true
  }
}

const handleDelete = async (record) => {
  const response = await batchDeleteRole([record.id])
  if (response.code === 200) {
    Message.success('删除成功')
    fetchRoleList()
  }
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的角色')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个角色吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      const response = await batchDeleteRole(selectedRowKeys.value)
      if (response.code === 200) {
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchRoleList()
      }
    }
  })
}

const handleToggleStatus = async (record) => {
  const action = record.status === 1 ? '禁用' : '启用'
  // Note: Confirmation is handled by a-popconfirm in the template
  const response = await updateRoleStatus(record.id)
  if (response.code === 200) {
    Message.success(`${action}成功`)
    fetchRoleList()
  }
}

const handleAssignPermission = async (record) => {
  try {
    currentRole.value = record
    const response = await queryRoleMenuList(record.id)
    if (response.code === 200) {
      currentRolePermissions.value = response.data || []
      permissionDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取角色权限数据失败:', error)
    Message.error('获取角色权限数据失败')
  }
}

const handlePermissionSaveSuccess = () => {
  fetchRoleList()
}

const handleRoleSubmit = () => {
  roleFormRef.value.validate().then(async () => {
    submitLoading.value = true
    const apiMethod = isEdit.value ? updateRole : addRole
    const response = await apiMethod(roleForm)

    if (response.code === 200) {
      Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
      roleDialogVisible.value = false
      fetchRoleList()
    }
    submitLoading.value = false
  }).catch(() => {
    // validation failed
  })
}

const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: null,
    name: '',
    code: '',
    status: 1
  })
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const getCheckboxProps = (record) => ({
  disabled: record.id === 1,
})

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchRoleList()
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  Promise.all([
    fetchRoleList(),
    loadAllPermissions()
  ])

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
  flex-shrink: 0;
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
}

.warning-text {
  color: var(--color-warning);
}
.warning-text:hover {
  color: var(--color-warning);
  opacity: 0.8;
}

.success-text {
  color: var(--color-success);
}
.success-text:hover {
  color: var(--color-success);
  opacity: 0.8;
}
</style>
