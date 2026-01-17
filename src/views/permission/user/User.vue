<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <a-card :bordered="false" class="search-card">
      <div class="search-form">
        <div class="search-form-left">
          <a-form layout="inline" :model="searchForm" ref="searchFormRef">
            <a-form-item name="userName">
              <a-input v-model:value="searchForm.userName" placeholder="请输入用户名" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="phone">
              <a-input v-model:value="searchForm.phone" placeholder="请输入手机号" allow-clear style="width: 200px" />
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
    <a-card :bordered="false">
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

      <a-table ref="tableRef" :dataSource="tableData" :columns="columns" :loading="loading" :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }"
        row-key="id" @change="handleTableChange" :scroll="{ x: 1000, y: tableMaxHeight }">
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
              <a-popconfirm title="确认删除该用户吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small" :disabled="record.id === 1">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
              <a-dropdown :disabled="record.id === 1">
                <a-button type="text" size="small">
                  <template #icon>
                    <EllipsisOutlined />
                  </template>
                </a-button>
                <template #overlay>
                  <a-menu @click="({ key }) => handleOperationClick({ key }, record)">
                    <a-menu-item key="assignRole">分配角色</a-menu-item>
                    <a-menu-item key="resetPassword">重置密码</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="toggleStatus">{{ record.status === 1 ? '禁用' : '启用' }}</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal v-model:open="userDialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="700px" @ok="handleUserSubmit"
      @cancel="userDialogVisible = false" :confirmLoading="submitLoading" centered>
      <a-form ref="userFormRef" :model="userForm" :rules="userFormRules" layout="vertical" class="user-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="用户名" name="userName" class="form-item">
              <a-input v-model:value="userForm.userName" placeholder="请输入用户名" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email" class="form-item">
              <a-input v-model:value="userForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24" v-if="!isEdit">
          <a-col :span="12">
            <a-form-item label="密码" name="password" class="form-item">
              <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="确认密码" name="confirmPassword" class="form-item">
              <a-input-password v-model:value="userForm.confirmPassword" placeholder="请再次输入密码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="手机号" name="phone" class="form-item">
              <a-input v-model:value="userForm.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status" class="form-item">
              <a-radio-group v-model:value="userForm.status">
                <a-radio :value="1">启用</a-radio>
                <a-radio :value="0">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 角色分配弹窗 -->
    <a-modal v-model:open="roleDialogVisible" title="分配角色" width="800px" @ok="handleSaveRoles"
      @cancel="roleDialogVisible = false" :confirmLoading="roleSubmitLoading" centered>
      <div class="role-assign-content" :style="cssVars">
        <p class="assign-user-info">
          为用户 <strong>{{ currentUser.userName }}</strong> 分配角色：
        </p>
        <div class="role-layout">
          <div class="role-section">
            <h4 class="section-title">已分配角色</h4>
            <div class="role-grid">
              <div v-for="role in selectedRoles" :key="role" class="role-tag assigned">
                {{ role }}
                <CloseOutlined class="remove-icon" @click="removeRole(role)" />
              </div>
              <div v-if="selectedRoles.length === 0" class="empty-state">
                暂无已分配角色
              </div>
            </div>
          </div>
          <div class="role-section">
            <h4 class="section-title">可分配角色</h4>
            <div class="role-grid">
              <div v-for="role in availableRoles" :key="role" class="role-tag available" @click="addRole(role)">
                {{ role }}
                <PlusOutlined class="add-icon" />
              </div>
              <div v-if="availableRoles.length === 0" class="empty-state">
                暂无可分配角色
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal v-model:open="passwordDialogVisible" title="重置密码" width="500px" @ok="handlePasswordSubmit"
      @cancel="passwordDialogVisible = false" :confirmLoading="passwordSubmitLoading" centered>
      <div :style="cssVars">
        <div class="user-info-section">
          <h4 class="user-title">为用户<span class="username-display">{{ currentUser.userName }}</span>重置密码</h4>
        </div>

        <a-form ref="passwordFormRef" :model="passwordForm" :rules="passwordFormRules" layout="vertical"
          class="password-form">
          <a-form-item label="新密码" name="newPassword">
            <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" allow-clear>
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item label="确认密码" name="confirmPassword">
            <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" allow-clear>
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>
        </a-form>

        <div class="password-tips">
          <InfoCircleOutlined class="tip-icon" />
          <span class="tip-text">密码长度为6-20个字符，建议包含字母、数字和特殊字符</span>
        </div>
      </div>
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
  EllipsisOutlined,
  CloseOutlined,
  LockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import {
  queryUserList,
  addUser,
  updateUser,
  batchDeleteUser,
  updateUserStatus,
  echoUserById,
  queryUserRoles,
  saveUserRoles,
  resetUserPassword
} from '@/api/user'
import { queryRoleList } from '@/api/role'

const { useToken } = theme
const { token } = useToken()

/**
 * 特别说明：为什么不直接使用 v-bind('token.xxx')？
 * User.vue 中的样式主要应用在 Modal 弹窗内。Ant Design Vue 的 Modal 默认使用 Teleport 
 * 将内容挂载到 document.body，脱离了组件根节点，导致无法继承组件根节点上的 v-bind CSS 变量。
 * 
 * 解决方案：使用 cssVars 将 token 映射为 CSS 变量，并通过 :style="cssVars" 
 * 显式绑定到 Modal 内容容器上，确保样式穿透生效。
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
    '--color-success-bg': t.colorSuccessBg,
    '--color-success-border': t.colorSuccessBorder,
    '--color-success-text': t.colorSuccessText,
    '--color-success-bg-hover': t.colorSuccessBgHover,
    '--color-success-border-hover': t.colorSuccessBorderHover,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder,
    '--color-primary-bg': t.colorPrimaryBg,
    '--color-primary-border': t.colorPrimaryBorder,
    '--color-error': t.colorError,
    '--color-text-tertiary': t.colorTextTertiary,
    '--color-fill-quaternary': t.colorFillQuaternary,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-warning-bg': t.colorWarningBg,
    '--color-warning-border': t.colorWarningBorder,
    '--color-warning': t.colorWarning,
  }
})

// ==================== 响应式数据定义 ====================
const loading = ref(false)
const submitLoading = ref(false)
const roleSubmitLoading = ref(false)
const passwordSubmitLoading = ref(false)

const tableData = ref([])
const selectedRowKeys = ref([])

const userDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

const isEdit = ref(false)
const currentUser = ref({})

const roleList = ref([])
const selectedRoles = ref([])

const isFullscreen = ref(false)

const userFormRef = ref()
const passwordFormRef = ref()
const searchFormRef = ref()

// ==================== 表单数据定义 ====================
const searchForm = reactive({
  userName: '',
  phone: '',
  status: undefined // antd select uses undefined for placeholder
})

const userForm = reactive({
  id: null,
  userName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  status: 1
})

const passwordForm = reactive({
  userName: '',
  newPassword: '',
  confirmPassword: ''
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
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
    width: 140
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 140
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
    width: 220,
    fixed: 'right'
  }
]

// ==================== 表单验证规则 ====================
const userFormRules = {
  userName: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: async (_rule, value) => {
        if (value !== userForm.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

const passwordFormRules = {
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: async (_rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// ==================== 计算属性 ====================
const tableMaxHeight = computed(() => {
  return isFullscreen.value ? undefined : '420px'
})

const availableRoles = computed(() => {
  return roleList.value.filter(role => !selectedRoles.value.includes(role))
})

// ==================== 业务方法定义 ====================
const fetchUserList = async () => {
  loading.value = true
  const params = {
    userName: searchForm.userName ? searchForm.userName.trim() : '',
    phone: searchForm.phone ? searchForm.phone.trim() : '',
    status: searchForm.status !== undefined ? Number(searchForm.status) : ''
  }

  const response = await queryUserList(pagination.current, pagination.pageSize, params)
  if (response.code === 200 && response.data !== null) {
    tableData.value = response.data.data || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

const fetchRoleList = async () => {
  const response = await queryRoleList()
  if (response.code === 200) {
    roleList.value = response.data || []
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.phone = ''
  searchForm.status = undefined
  pagination.current = 1
  fetchUserList()
}

const handleAdd = () => {
  isEdit.value = false
  resetUserForm()
  userDialogVisible.value = true
}

const handleEdit = async (record) => {
  isEdit.value = true
  const response = await echoUserById(record.id)
  if (response.code === 200) {
    Object.assign(userForm, response.data)
    userDialogVisible.value = true
  }
}

const handleDelete = async (record) => {
  const response = await batchDeleteUser([record.id])
  if (response.code === 200) {
    Message.success('删除成功')
    fetchUserList()
  }
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的用户')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      const response = await batchDeleteUser(selectedRowKeys.value)
      if (response.code === 200) {
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchUserList()
      }
    }
  })
}

const handleToggleStatus = (record) => {
  const action = record.status === 1 ? '禁用' : '启用'
  const okType = record.status === 1 ? 'danger' : 'primary'

  Modal.confirm({
    title: '确认操作',
    content: `确定要${action}用户 "${record.userName}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: okType,
    centered: true,
    onOk: async () => {
      const response = await updateUserStatus(record.id)
      if (response.code === 200) {
        Message.success(`${action}成功`)
        fetchUserList()
      }
    }
  })
}

const handleAssignRole = async (record) => {
  currentUser.value = record
  const response = await queryUserRoles(record.id)
  if (response.code === 200) {
    selectedRoles.value = response.data || []
    roleDialogVisible.value = true
  }
}

const handleResetPassword = (record) => {
  currentUser.value = record
  passwordForm.userName = record.userName
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const handleUserSubmit = () => {
  userFormRef.value.validate().then(async () => {
    submitLoading.value = true
    const apiMethod = isEdit.value ? updateUser : addUser
    const response = await apiMethod(userForm)

    if (response.code === 200) {
      Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
      userDialogVisible.value = false
      fetchUserList()
    }
    submitLoading.value = false
  }).catch(() => {
    // validation failed
  })
}

const addRole = (role) => {
  if (!selectedRoles.value.includes(role)) {
    selectedRoles.value.push(role)
  }
}

const removeRole = (role) => {
  const index = selectedRoles.value.indexOf(role)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  }
}

const handleSaveRoles = async () => {
  roleSubmitLoading.value = true
  const response = await saveUserRoles(currentUser.value.userName, selectedRoles.value)
  if (response.code === 200) {
    Message.success('角色分配成功')
    roleDialogVisible.value = false
  }
  roleSubmitLoading.value = false
}

const handlePasswordSubmit = () => {
  passwordFormRef.value.validate().then(async () => {
    passwordSubmitLoading.value = true
    const response = await resetUserPassword({
      id: currentUser.value.id,
      password: passwordForm.newPassword
    })

    if (response.code === 200) {
      Message.success('密码重置成功')
      passwordDialogVisible.value = false
    }
    passwordSubmitLoading.value = false
  }).catch(() => {
    // validation failed
  })
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const getCheckboxProps = (record) => ({
  disabled: record.id === 1,
})

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchUserList()
}

const resetUserForm = () => {
  Object.assign(userForm, {
    id: null,
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 1
  })
}

const handleOperationClick = ({ key }, record) => {
  switch (key) {
    case 'toggleStatus':
      handleToggleStatus(record)
      break
    case 'assignRole':
      handleAssignRole(record)
      break
    case 'resetPassword':
      handleResetPassword(record)
      break
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  fetchUserList()
  fetchRoleList()
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

/* 表格头部操作区域样式 */
.table-header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 角色分配弹窗样式 */
.role-assign-content {
  padding: 0;
}

.assign-user-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text);
}

.assign-user-info strong {
  color: var(--color-primary);
  font-weight: 600;
}

.role-layout {
  display: flex;
  gap: 24px;
  min-height: 300px;
}

.role-section {
  flex: 1;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius);
  padding: 12px;
  background: var(--color-fill-alter);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-secondary);
  padding-bottom: 8px;
}

.role-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 240px;
  overflow-y: auto;
}

.role-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.role-tag.assigned {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
  color: var(--color-success-text);
}

.role-tag.assigned:hover {
  background: var(--color-success-bg-hover);
  border-color: var(--color-success-border-hover);
}

.role-tag.available {
  background: var(--color-bg-container);
  border-color: var(--color-border);
  color: var(--color-text);
}

.role-tag.available:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

.remove-icon,
.add-icon {
  font-size: 12px;
  margin-left: 8px;
  opacity: 0.7;
}

.remove-icon:hover {
  opacity: 1;
  color: var(--color-error);
}

.add-icon:hover {
  opacity: 1;
  color: var(--color-primary);
}

.empty-state {
  width: 100%;
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

/* 密码重置弹窗样式 */
.user-info-section {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-fill-quaternary);
  border-radius: 8px;
  margin-bottom: 24px;
}

.user-title {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: normal;
  margin: 0;
}

.username-display {
  margin: 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.password-tips {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning-border);
  border-radius: 6px;
  margin-top: 16px;
}

.tip-icon {
  color: var(--color-warning);
  margin-right: 8px;
  flex-shrink: 0;
}

.tip-text {
  font-size: 13px;
  color: var(--color-warning);
  line-height: 1.4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.form-item.full-width {
  grid-column: 1 / -1;
}
</style>
