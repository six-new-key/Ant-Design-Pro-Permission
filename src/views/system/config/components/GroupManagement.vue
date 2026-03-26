<template>
  <div class="group-management" :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" class="search-form-compact">
          <a-form-item>
            <a-input
              v-model:value="keyword"
              placeholder="搜索分组名称或代码"
              allow-clear
              style="width: 180px"
              @pressEnter="handleSearch" />
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
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:config:group_add'">
              <template #icon><PlusOutlined /></template>
              新增
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
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

    <!-- 分组表格 -->
    <a-table
      :dataSource="groupList"
      :columns="visibleColumns"
      :loading="loading"
      :pagination="{
        current: pageNo,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
        showLessItems: true,
        onChange: handlePageChange,
        onShowSizeChange: handlePageChange
      }"
      :scroll="{ x: 'max-content' }"
      row-key="id">
      
      <template #bodyCell="{ column, record }">
        <!-- 分组代码 -->
        <template v-if="column.key === 'groupCode'">
          <a-tag color="blue">{{ record.groupCode }}</a-tag>
        </template>

        <!-- 排序 -->
        <template v-if="column.key === 'sortOrder'">
          <a-tag color="purple">{{ record.sortOrder }}</a-tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <a-space :size="8">
            <a-button type="link" size="small" @click="handleJumpToFeature(record)">
              <template #icon><ViewOutlined /></template>
              查看功能
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:config:group_update'">
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-popconfirm title="确认删除吗？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission.disable="'system:config:group_remove'">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    </a-card>

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="addDialogVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered>
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">新增分组</span>
          <a-space :size="12">
            <a-button @click="handleAddCancel">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="handleAddSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <a-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        layout="vertical">
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分组代码" name="groupCode">
              <a-input v-model:value="addForm.groupCode" placeholder="如：security" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分组名称" name="groupName">
              <a-input v-model:value="addForm.groupName" placeholder="如：安全防护" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="addForm.sortOrder" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="分组描述" name="groupDesc">
              <a-textarea v-model:value="addForm.groupDesc" placeholder="请输入分组描述（可选）" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="editDialogVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered>
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">编辑分组</span>
          <a-space :size="12">
            <a-button @click="handleEditCancel">取消</a-button>
            <a-button type="primary" :loading="editSubmitLoading" @click="handleEditSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        layout="vertical">
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分组代码" name="groupCode">
              <a-input v-model:value="editForm.groupCode" placeholder="如：security" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分组名称" name="groupName">
              <a-input v-model:value="editForm.groupName" placeholder="如：安全防护" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="editForm.sortOrder" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="分组描述" name="groupDesc">
              <a-textarea v-model:value="editForm.groupDesc" placeholder="请输入分组描述（可选）" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, EditOutlined, DeleteOutlined, EyeOutlined as ViewOutlined } from '@ant-design/icons-vue'
import { useGroupManagement } from '../composables/useGroupManagement'

const { token } = theme.useToken()

// CSS 变量映射
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder
  }
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 搜索和重置
const handleReset = () => {
  keyword.value = ''
  loadGroupList()
}

// 定义 emit
const emit = defineEmits(['jump-to-feature'])

const {
  loading,
  groupList,
  total,
  pageNo,
  pageSize,
  keyword,
  loadGroupList,
  handlePageChange,
  handleSearch,
  addDialogVisible,
  addForm,
  addFormRules,
  addFormRef,
  submitLoading,
  handleAdd,
  handleAddCancel,
  handleAddSubmit,
  editDialogVisible,
  editForm,
  editFormRules,
  editFormRef,
  editSubmitLoading,
  handleEdit,
  handleEditCancel,
  handleEditSubmit,
  handleDelete
} = useGroupManagement()

// 跳转到功能管理
const handleJumpToFeature = (record) => {
  emit('jump-to-feature', record.groupCode)
}

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180
  },
  {
    title: '分组代码',
    dataIndex: 'groupCode',
    key: 'groupCode',
    width: 150
  },
  {
    title: '分组名称',
    dataIndex: 'groupName',
    key: 'groupName',
    width: 150
  },
  {
    title: '分组描述',
    dataIndex: 'groupDesc',
    key: 'groupDesc',
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 80,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right'
  }
]

// 列显隐控制
const columnVisibility = ref({
  id: true,
  groupCode: true,
  groupName: true,
  groupDesc: true,
  sortOrder: true,
  createTime: true
})

const toggleColumn = (key) => {
  columnVisibility.value[key] = !columnVisibility.value[key]
}

const visibleColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'action') return true
    return columnVisibility.value[col.key] !== false
  })
})

const configurableColumns = computed(() => {
  return columns.filter(col => col.key !== 'action')
})

onMounted(() => {
  loadGroupList()
})
</script>

<style lang="scss" scoped>
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

.group-management {
  .search-card {
    margin-bottom: 16px;
    overflow: hidden;
    
    :deep(.ant-card-body) {
      padding-left: 0;
      padding-right: 0;
    }
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
    width: 100%;
  }
}
</style>