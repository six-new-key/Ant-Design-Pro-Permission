<template>
  <a-drawer
    :open="visible"
    :title="`为角色 &quot;${roleInfo.name}&quot; 分配用户`"
    width="800px"
    @close="handleClose"
    :destroyOnClose="true"
  >
    <!-- 搜索栏 -->
    <div class="search-section">
      <a-form layout="inline" :model="searchForm">
        <a-form-item>
          <a-input 
            v-model:value="searchForm.userName" 
            placeholder="请输入用户名" 
            allow-clear 
            style="width: 200px"
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-select 
            v-model:value="searchForm.status" 
            placeholder="请选择状态" 
            allow-clear 
            style="width: 200px"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
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
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="drawer-actions">
      <a-space :size="12">
        <a-button type="primary" :disabled="roleInfo.status === 0 || roleInfo.code === 'admin'" @click="handleOpenAdd">
          <template #icon>
            <PlusOutlined />
          </template>
          添加用户
        </a-button>
        <a-button 
          type="primary" 
          danger 
          :disabled="unassignDisabled || roleInfo.status === 0 || roleInfo.code === 'admin'"
          @click="handleUnassign"
        >
          <template #icon>
            <DeleteOutlined />
          </template>
          批量取消授权{{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
        </a-button>
      </a-space>
    </div>

    <!-- 用户列表 -->
    <a-table
      :dataSource="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      row-key="id"
      @change="handleTableChange"
      :scroll="{ y: 400 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </template>
    </a-table>

    <!-- 二级抽屉 -->
    <UserAddDrawer
      :visible="addDrawerVisible"
      :roleInfo="roleInfo"
      :dataSource="unassignedUsers"
      :loading="unassignedLoading"
      :selectedRowKeys="unassignedSelectedRowKeys"
      :pagination="unassignedPagination"
      :searchForm="unassignedSearchForm"
      :addDisabled="addDisabled"
      @close="handleCloseAdd"
      @search="handleUnassignedSearch"
      @reset="handleResetUnassigned"
      @selectChange="onUnassignedSelectChange"
      @tableChange="handleUnassignedTableChange"
      @confirm="handleConfirmAdd"
    />
  </a-drawer>
</template>

<script setup>
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import UserAddDrawer from './UserAddDrawer.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roleInfo: {
    type: Object,
    default: () => ({})
  },
  dataSource: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedRowKeys: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({})
  },
  searchForm: {
    type: Object,
    default: () => ({})
  },
  unassignDisabled: {
    type: Boolean,
    default: true
  },
  // 二级抽屉相关
  addDrawerVisible: {
    type: Boolean,
    default: false
  },
  unassignedUsers: {
    type: Array,
    default: () => []
  },
  unassignedLoading: {
    type: Boolean,
    default: false
  },
  unassignedSelectedRowKeys: {
    type: Array,
    default: () => []
  },
  unassignedPagination: {
    type: Object,
    default: () => ({})
  },
  unassignedSearchForm: {
    type: Object,
    default: () => ({})
  },
  addDisabled: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'close',
  'search',
  'reset',
  'selectChange',
  'tableChange',
  'openAdd',
  'unassign',
  'closeAdd',
  'unassignedSearch',
  'resetUnassigned',
  'unassignedSelectChange',
  'unassignedTableChange',
  'confirmAdd'
])

// 表格列配置
const columns = [
  {
    title: '用户编号',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  }
]

const handleClose = () => {
  emit('close')
}

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}

const onSelectChange = (keys) => {
  emit('selectChange', keys)
}

const handleTableChange = (pag) => {
  emit('tableChange', pag)
}

const handleOpenAdd = () => {
  emit('openAdd')
}

const handleUnassign = () => {
  Modal.confirm({
    title: '确认取消授权',
    content: `确定要取消选中的 ${props.selectedRowKeys.length} 个用户的授权吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: () => {
      emit('unassign')
    }
  })
}

const handleCloseAdd = () => {
  emit('closeAdd')
}

const handleUnassignedSearch = () => {
  emit('unassignedSearch')
}

const handleResetUnassigned = () => {
  emit('resetUnassigned')
}

const onUnassignedSelectChange = (keys) => {
  emit('unassignedSelectChange', keys)
}

const handleUnassignedTableChange = (pag) => {
  emit('unassignedTableChange', pag)
}

const handleConfirmAdd = () => {
  emit('confirmAdd')
}
</script>

<style scoped lang="scss">
.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.drawer-actions {
  margin-bottom: 16px;
  padding: 0 16px;
}
</style>
