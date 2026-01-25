<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <a-card :bordered="false" class="search-card" v-show="searchVisible">
      <div class="search-form">
        <div class="search-form-left">
          <a-form layout="inline" :model="searchForm">
            <a-form-item name="userName">
              <a-input v-model:value="searchForm.userName" placeholder="请输入用户名" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="phone">
              <a-input v-model:value="searchForm.phone" placeholder="请输入手机号" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="status">
              <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 200px">
                <a-select-option v-for="item in statusDict" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="gender">
              <a-select v-model:value="searchForm.gender" placeholder="请选择性别" allow-clear style="width: 200px">
                <a-select-option v-for="item in genderDict" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
        <div class="search-form-right">
          <a-space :size="12">
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
          <a-space :size="12">
            <a-button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增
            </a-button>
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
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
            
            <a-dropdown>
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

      <a-table :dataSource="tableData" :columns="visibleColumns" :loading="loading" :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange, getCheckboxProps }" row-key="id"
        @change="handleTableChange" :scroll="{ x: 'max-content', y: tableMaxHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'gender'">
            <a-tag :color="getGenderColor(record.gender)">
              {{ getGenderLabel(record.gender) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar || '/default-avatar.svg'" :size="32" />
          </template>

          <template v-if="column.key === 'status'">
            <a-switch 
              :checked="record.status === 1" 
              :disabled="record.id === 1"
              checked-children="启用" 
              un-checked-children="禁用"
              @change="() => handleToggleStatus(record)"
            />
          </template>

          <template v-if="column.key === 'lastLoginIp'">
            <span>{{ record.lastLoginIp || '-' }}</span>
          </template>

          <template v-if="column.key === 'lastLoginTime'">
            <span>{{ record.lastLoginTime || '-' }}</span>
          </template>

          <template v-if="column.key === 'loginCount'">
            <span>{{ record.loginCount || 0 }}</span>
          </template>

          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" :disabled="record.id === 1" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" :disabled="record.id === 1" @click="handleAssignRole(record)">
                分配角色
              </a-button>
              <a-button type="link" size="small" :disabled="record.id === 1" @click="handleResetPassword(record)">
                重置密码
              </a-button>
              <a-button type="link" size="small" danger :disabled="record.id === 1" @click="handleKickout(record)">
                踢人下线
              </a-button>
              <a-popconfirm title="确认删除该用户吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small" :disabled="record.id === 1">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
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
            <a-form-item label="性别" name="gender" class="form-item">
              <a-radio-group v-model:value="userForm.gender">
                <a-radio :value="0">未知</a-radio>
                <a-radio :value="1">男</a-radio>
                <a-radio :value="2">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="头像" name="avatar" class="form-item">
              <a-upload :action="uploadUrl" :headers="uploadHeaders" list-type="picture-card" :show-upload-list="false"
                :before-upload="beforeAvatarUpload" @change="handleAvatarChange">
                <img v-if="userForm.avatar" :src="userForm.avatar"
                  style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" />
                <div v-else>
                  <PlusOutlined />
                  <div style="margin-top: 8px">上传头像</div>
                </div>
              </a-upload>
              <div style="font-size: 12px; color: #999; margin-top: 4px;">
                支持 JPG、PNG、GIF 格式，大小不超过 2MB
              </div>
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
          为用户 <strong>{{ currentUserForRole.userName }}</strong> 分配角色：
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
          <h4 class="user-title">为用户<span class="username-display">{{ currentUserForPassword.userName }}</span>重置密码</h4>
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
import { computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  LockOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

// Composables
import { useDict } from './composables/useDict'
import { useUserTable } from './composables/useUserTable'
import { useUserSearch } from './composables/useUserSearch'
import { useUserForm } from './composables/useUserForm'
import { useUserOperations } from './composables/useUserOperations'
import { useRoleAssign } from './composables/useRoleAssign'
import { usePasswordReset } from './composables/usePasswordReset'
import { useTableSettings } from './composables/useTableSettings'

// Styles
import './styles/user.scss'

const { useToken } = theme
const { token } = useToken()

/**
 * CSS 变量（用于 Modal 样式穿透）
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
    '--color-success': t.colorSuccess,
  }
})

// ==================== 组合各个功能模块 ====================

// 字典数据
const {
  statusDict,
  genderDict,
  fetchDictData,
  getGenderLabel,
  getGenderColor
} = useDict()

// 搜索功能（先创建，获取 reactive searchForm）
const {
  searchForm,
  handleSearch,
  handleReset
} = useUserSearch(null, null) // 先传 null，后面通过闭包访问

// 表格功能（传入 searchForm）
const {
  loading,
  tableData,
  selectedRowKeys,
  pagination,
  columns,
  tableMaxHeight,
  fetchUserList,
  onSelectChange,
  getCheckboxProps,
  handleTableChange
} = useUserTable(searchForm)

// 更新 useUserSearch 中的依赖
handleSearch.fetchUserList = fetchUserList
handleSearch.pagination = pagination
handleReset.fetchUserList = fetchUserList
handleReset.pagination = pagination

// 表格设置（搜索栏显隐、列显隐）
const {
  searchVisible,
  columnVisibility,
  toggleSearch,
  toggleColumn,
  getVisibleColumns,
  getConfigurableColumns
} = useTableSettings(columns)

// 获取可见的列
const visibleColumns = computed(() => getVisibleColumns())
const configurableColumns = computed(() => getConfigurableColumns())

// 用户表单
const {
  userDialogVisible,
  submitLoading,
  isEdit,
  userFormRef,
  userForm,
  userFormRules,
  uploadUrl,
  uploadHeaders,
  beforeAvatarUpload,
  handleAvatarChange,
  handleAdd,
  handleEdit,
  handleUserSubmit
} = useUserForm(fetchUserList)

// 用户操作
const {
  handleDelete,
  handleBatchDelete,
  handleToggleStatus,
  handleKickout
} = useUserOperations(fetchUserList, selectedRowKeys)

// 角色分配
const {
  roleDialogVisible,
  roleSubmitLoading,
  currentUser: currentUserForRole,
  selectedRoles,
  availableRoles,
  fetchRoleList,
  handleAssignRole,
  addRole,
  removeRole,
  handleSaveRoles
} = useRoleAssign()

// 密码重置
const {
  passwordDialogVisible,
  passwordSubmitLoading,
  currentUser: currentUserForPassword,
  passwordFormRef,
  passwordForm,
  passwordFormRules,
  handleResetPassword,
  handlePasswordSubmit
} = usePasswordReset()

// ==================== 初始化 ====================
onMounted(() => {
  fetchDictData()
  fetchUserList()
  fetchRoleList()
})
</script>
