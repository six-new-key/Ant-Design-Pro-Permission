<template>
  <div class="feature-management" :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" class="search-form-compact">
          <a-form-item>
            <a-select
              v-model:value="filterGroupCode"
              placeholder="筛选分组"
              style="width: 180px"
              allow-clear
              @change="handleGroupFilter">
              <a-select-option v-for="group in groupList" :key="group.groupCode" :value="group.groupCode">
                {{ group.groupName }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="keyword"
              placeholder="搜索功能名称或代码"
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
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:config:feature_add'">
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

    <!-- 功能表格 -->
    <a-table
      :dataSource="featureList"
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
        <!-- 功能代码 -->
        <template v-if="column.key === 'featureCode'">
          <a-tag color="blue">{{ record.featureCode }}</a-tag>
        </template>

        <!-- 所属分组 -->
        <template v-if="column.key === 'groupCode'">
          <a-tag color="cyan">{{ getGroupName(record.groupCode) }}</a-tag>
        </template>

        <!-- 启用状态 -->
        <template v-if="column.key === 'enabled'">
          <a-switch 
            :checked="record.enabled === 1" 
            @change="(checked) => handleToggleStatus(record, checked)"
            checked-children="启用" 
            un-checked-children="禁用" />
        </template>

        <!-- 系统内置 -->
        <template v-if="column.key === 'isSystem'">
          <a-tag :color="record.isSystem === 1 ? 'blue' : 'default'">
            {{ record.isSystem === 1 ? '是' : '否' }}
          </a-tag>
        </template>

        <!-- 排序 -->
        <template v-if="column.key === 'sortOrder'">
          <a-tag color="purple">{{ record.sortOrder }}</a-tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <a-space :size="8">
            <a-button type="link" size="small" @click="handleJumpToConfig(record)">
              <template #icon><EyeOutlined /></template>
              查看配置
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:config:feature_update'">
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-popconfirm title="确认删除吗？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission.disable="'system:config:feature_remove'">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    </a-card>

    <!-- 新增对话框 -->
    <a-modal
      v-model:open="addDialogVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered>
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">新增功能</span>
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
            <a-form-item name="featureCode">
              <template #label>
                <span>功能代码</span>
                <a-tooltip title="功能代码用于后端识别，新增后需在 SystemCacheConstant 类中定义常量" placement="top">
                  <QuestionCircleOutlined style="margin-left: 4px; color: #999; cursor: help;" />
                </a-tooltip>
              </template>
              <a-input v-model:value="addForm.featureCode" placeholder="如：ip_blacklist" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="功能名称" name="featureName">
              <a-input v-model:value="addForm.featureName" placeholder="如：IP黑名单" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属分组" name="groupCode">
              <a-select v-model:value="addForm.groupCode" placeholder="请选择所属分组">
                <a-select-option v-for="group in groupList" :key="group.groupCode" :value="group.groupCode">
                  {{ group.groupName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="addForm.sortOrder" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="系统内置" name="isSystem">
              <DictRadio 
                v-model:value="addForm.isSystem" 
                dict-type="yes_no" 
                value-type="number"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="功能描述" name="featureDesc">
              <a-textarea v-model:value="addForm.featureDesc" placeholder="请输入功能描述（可选）" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 编辑对话框 -->
    <a-modal
      v-model:open="editDialogVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered>
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">编辑功能</span>
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
            <a-form-item name="featureCode">
              <template #label>
                <span>功能代码</span>
                <a-tooltip title="功能代码用于后端识别，修改后需在 SystemCacheConstant 类中同步更新常量" placement="top">
                  <QuestionCircleOutlined style="margin-left: 4px; color: #999; cursor: help;" />
                </a-tooltip>
              </template>
              <a-input v-model:value="editForm.featureCode" placeholder="如：ip_blacklist" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="功能名称" name="featureName">
              <a-input v-model:value="editForm.featureName" placeholder="如：IP黑名单" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属分组" name="groupCode">
              <a-select v-model:value="editForm.groupCode" placeholder="请选择所属分组">
                <a-select-option v-for="group in groupList" :key="group.groupCode" :value="group.groupCode">
                  {{ group.groupName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="editForm.sortOrder" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="系统内置" name="isSystem">
              <DictRadio 
                v-model:value="editForm.isSystem" 
                dict-type="yes_no" 
                value-type="number"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="功能描述" name="featureDesc">
              <a-textarea v-model:value="editForm.featureDesc" placeholder="请输入功能描述（可选）" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useFeatureManagement } from '../composables/useFeatureManagement'

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
  filterGroupCode.value = null
  loadFeatureList()
}

// 定义 props 和 emit
const props = defineProps({
  filterGroupCode: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['jump-to-config'])

const {
  loading,
  featureList,
  groupList,
  total,
  pageNo,
  pageSize,
  keyword,
  filterGroupCode,
  loadFeatureList,
  handlePageChange,
  handleSearch,
  handleGroupFilter,
  getGroupName,
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
  handleDelete,
  handleToggleStatus
} = useFeatureManagement()

// 监听外部传入的过滤参数
watch(() => props.filterGroupCode, (newVal) => {
  if (newVal) {
    filterGroupCode.value = newVal
    loadFeatureList()
  }
}, { immediate: true })

// 跳转到配置管理
const handleJumpToConfig = (record) => {
  emit('jump-to-config', record.featureCode)
}

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180
  },
  {
    title: '功能代码',
    dataIndex: 'featureCode',
    key: 'featureCode',
    width: 150
  },
  {
    title: '功能名称',
    dataIndex: 'featureName',
    key: 'featureName',
    width: 150
  },
  {
    title: '功能描述',
    dataIndex: 'featureDesc',
    key: 'featureDesc',
    width: 200,
    ellipsis: true
  },
  {
    title: '所属分组',
    dataIndex: 'groupCode',
    key: 'groupCode',
    width: 120
  },
  {
    title: '启用状态',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 100,
    align: 'center'
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 80,
    align: 'center'
  },
  {
    title: '系统内置',
    dataIndex: 'isSystem',
    key: 'isSystem',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    fixed: 'right'
  }
]

// 列显隐控制
const columnVisibility = ref({
  id: true,
  featureCode: true,
  featureName: true,
  featureDesc: true,
  groupCode: true,
  enabled: true,
  sortOrder: true,
  isSystem: true
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
  loadFeatureList()
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

.feature-management {
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