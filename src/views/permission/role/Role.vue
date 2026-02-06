<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <div class="search-form">
          <div class="search-form-left">
            <a-form layout="inline" :model="searchForm">
              <a-form-item name="name">
                <a-input v-model:value="searchForm.name" placeholder="请输入角色名称" allow-clear style="width: 200px" />
              </a-form-item>
              <a-form-item name="code">
                <a-input v-model:value="searchForm.code" placeholder="请输入角色编码" allow-clear style="width: 200px" />
              </a-form-item>
              <a-form-item name="status">
                <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 200px">
                  <a-select-option v-for="item in statusDict" :key="item.value" :value="item.value">
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
    </transition>

    <!-- 数据表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <a-space :size="12">
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
                  <template #icon>
                    <SettingOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

      <a-table
        :dataSource="tableData"
        :columns="visibleColumns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange, getCheckboxProps }"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content', y: tableMaxHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-switch 
              :checked="record.status === 1" 
              :disabled="record.code === 'admin'"
              checked-children="启用" 
              un-checked-children="禁用"
              @change="() => handleToggleStatus(record)"
            />
          </template>
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" :disabled="record.code === 'admin'" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" :disabled="record.status === 0 || record.code === 'admin'" style="color: #52c41a" @click="handleAssignPermission(record)">
                数据权限
              </a-button>
              <a-button type="link" size="small" :disabled="record.status === 0 || record.code === 'admin'" style="color: #1890ff" @click="handleAssignUser(record)">
                分配用户
              </a-button>
              <a-popconfirm title="确认删除该角色吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small" :disabled="record.code === 'admin'">
                  删除
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

    <!-- 用户分配抽屉 -->
    <UserAssignDrawer
      :visible="assignDrawerVisible"
      :roleInfo="currentRoleForUser"
      :dataSource="assignedUsers"
      :loading="assignedLoading"
      :selectedRowKeys="assignedSelectedRowKeys"
      :pagination="assignedPagination"
      :searchForm="assignedSearchForm"
      :unassignDisabled="unassignDisabled"
      :addDrawerVisible="addDrawerVisible"
      :unassignedUsers="unassignedUsers"
      :unassignedLoading="unassignedLoading"
      :unassignedSelectedRowKeys="unassignedSelectedRowKeys"
      :unassignedPagination="unassignedPagination"
      :unassignedSearchForm="unassignedSearchForm"
      :addDisabled="addDisabled"
      @close="handleCloseAssignDrawer"
      @search="handleAssignedSearch"
      @reset="resetAssignedSearch"
      @selectChange="onAssignedSelectChange"
      @tableChange="handleAssignedTableChange"
      @openAdd="handleOpenAddDrawer"
      @unassign="handleBatchUnassign"
      @closeAdd="handleCloseAddDrawer"
      @unassignedSearch="handleUnassignedSearch"
      @resetUnassigned="resetUnassignedSearch"
      @unassignedSelectChange="onUnassignedSelectChange"
      @unassignedTableChange="handleUnassignedTableChange"
      @confirmAdd="handleBatchAdd"
    />
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
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import PermissionAssignDialog from '@/components/core/PermissionAssignDialog.vue'
import UserAssignDrawer from './components/UserAssignDrawer.vue'

// Composables
import { useDict } from './composables/useDict'
import { useRoleTable } from './composables/useRoleTable'
import { useRoleSearch } from './composables/useRoleSearch'
import { useRoleForm } from './composables/useRoleForm'
import { useRoleOperations } from './composables/useRoleOperations'
import { usePermissionAssign } from './composables/usePermissionAssign'
import { useTableSettings } from './composables/useTableSettings'
import { useUserAssign } from './composables/useUserAssign'

// Styles
import './styles/role.scss'

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

// ==================== 组合各个功能模块 ====================

// 字典数据
const {
  statusDict,
  fetchDictData
} = useDict()

// 搜索功能（先创建，获取 reactive searchForm）
const {
  searchForm,
  handleSearch,
  handleReset
} = useRoleSearch(null, null) // 先传 null，后面通过闭包访问

// 表格功能（传入 searchForm）
const {
  loading,
  tableData,
  selectedRowKeys,
  pagination,
  columns,
  tableMaxHeight,
  fetchRoleList,
  onSelectChange,
  getCheckboxProps,
  handleTableChange
} = useRoleTable(searchForm)

// 更新 useRoleSearch 中的依赖
handleSearch.fetchRoleList = fetchRoleList
handleSearch.pagination = pagination
handleReset.fetchRoleList = fetchRoleList
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

// 角色表单
const {
  roleDialogVisible,
  submitLoading,
  isEdit,
  roleFormRef,
  roleForm,
  roleFormRules,
  handleAdd,
  handleEdit,
  handleRoleSubmit
} = useRoleForm(fetchRoleList)

// 角色操作
const {
  handleDelete,
  handleBatchDelete,
  handleToggleStatus
} = useRoleOperations(fetchRoleList, selectedRowKeys)

// 权限分配
const {
  permissionDialogVisible,
  currentRole,
  allPermissions,
  currentRolePermissions,
  loadAllPermissions,
  handleAssignPermission,
  handlePermissionSaveSuccess
} = usePermissionAssign(fetchRoleList)

// 用户分配
const {
  assignDrawerVisible,
  currentRole: currentRoleForUser,
  assignedUsers,
  assignedLoading,
  assignedSelectedRowKeys,
  assignedPagination,
  assignedSearchForm,
  handleAssignUser,
  fetchAssignedUsers,
  handleAssignedSearch,
  resetAssignedSearch,
  handleAssignedTableChange,
  onAssignedSelectChange,
  handleCloseAssignDrawer,
  addDrawerVisible,
  unassignedUsers,
  unassignedLoading,
  unassignedSelectedRowKeys,
  unassignedPagination,
  unassignedSearchForm,
  handleOpenAddDrawer,
  fetchUnassignedUsers,
  handleUnassignedSearch,
  resetUnassignedSearch,
  handleUnassignedTableChange,
  onUnassignedSelectChange,
  handleCloseAddDrawer,
  handleBatchAdd,
  handleBatchUnassign,
  unassignDisabled,
  addDisabled
} = useUserAssign(fetchRoleList)

// ==================== 初始化 ====================
onMounted(() => {
  fetchDictData()
  fetchRoleList()
  loadAllPermissions()
})
</script>
