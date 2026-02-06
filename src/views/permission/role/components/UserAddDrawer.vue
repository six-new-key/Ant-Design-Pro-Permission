<template>
  <a-drawer
    :open="visible"
    title="添加用户"
    width="750px"
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
      <a-button 
        type="primary" 
        :disabled="addDisabled"
        @click="handleConfirm"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        确定添加{{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
      </a-button>
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
  </a-drawer>
</template>

<script setup>
import { SearchOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons-vue'

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
  'confirm'
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

const handleConfirm = () => {
  emit('confirm')
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
