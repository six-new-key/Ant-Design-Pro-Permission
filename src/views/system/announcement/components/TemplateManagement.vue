<template>
  <div class="template-management" :style="cssVars">
    <!-- 搜索和筛选区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" class="search-form-compact">
          <a-form-item>
            <a-input
              v-model:value="keyword"
              placeholder="请输入模板名称"
              allow-clear
              style="width: 180px"
              @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item>
            <DictSelect
              v-model:value="filterCategory"
              dict-type="template_category"
              placeholder="请选择分类"
              allow-clear
              style="width: 180px"
              @change="handleCategoryFilter"
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
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:announcement:template_add'">
              <template #icon><PlusOutlined /></template>
              新增
            </a-button>
            <a-button 
              type="primary" 
              danger 
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchDelete" v-permission.disable="'system:announcement:template_remove'">
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
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>
    
    <!-- 模板列表 -->
    <a-table
      :dataSource="templateList"
      :columns="visibleColumns"
      :loading="loading"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: getCheckboxProps
      }"
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
        <!-- 模板名称 -->
        <template v-if="column.key === 'name'">
          <div>
            <span>{{ record.name }}</span>
            <a-tag v-if="record.isSystem === 1" color="blue" style="margin-left: 8px" size="small">
              系统
            </a-tag>
          </div>
        </template>
        
        <!-- 分类 -->
        <template v-if="column.key === 'category'">
          <a-tag :color="getCategoryColor(record.category)">
            {{ getCategoryLabel(record.category) }}
          </a-tag>
        </template>
        
        <!-- 类型 -->
        <template v-if="column.key === 'type'">
          <a-tag :color="getTypeColor(record.type)">
            {{ getTypeLabel(record.type) }}
          </a-tag>
        </template>
        
        <!-- 级别 -->
        <template v-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)">
            {{ getLevelLabel(record.level) }}
          </a-tag>
        </template>
        
        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <a-space :size="8">
            <a-button type="link" size="small" @click="handlePreview(record)">
              <template #icon><EyeOutlined /></template>
              预览
            </a-button>
            <a-button type="link" size="small" @click="handleCopy(record)" v-permission.disable="'system:announcement:template_copy'">
              <template #icon><CopyOutlined /></template>
              复制
            </a-button>
            <a-button 
              type="link" 
              size="small" 
              :disabled="record.isSystem === 1 && !isAdmin"
              @click="handleEdit(record)" v-permission.disable="'system:announcement:template_update'">
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-popconfirm 
              title="确认删除吗？" 
              @confirm="handleDelete(record)"
              :disabled="record.isSystem === 1 && !isAdmin">
              <a-button 
                type="link" 
                size="small" 
                danger 
                :disabled="record.isSystem === 1 && !isAdmin" v-permission.disable="'system:announcement:template_remove'">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    </a-card>
    
    <!-- 新增/编辑抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      width="800"
      placement="right"
      :closable="false"
      :body-style="{ paddingBottom: '24px' }">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ drawerTitle }}</span>
          <a-space :size="12">
            <a-button @click="handleDrawerClose">取消</a-button>
            <a-button type="primary" @click="handleDrawerSubmit" :loading="submitLoading">提交</a-button>
          </a-space>
        </div>
      </template>
      
      <a-form 
        ref="currentFormRef" 
        layout="vertical"
        :model="form" 
        :rules="formRules">
        
        <a-form-item label="模板名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入模板名称" :maxlength="100" show-count />
        </a-form-item>
        
        <a-form-item label="模板描述" name="description">
          <a-textarea 
            v-model:value="form.description" 
            placeholder="请输入模板描述"
            :rows="2"
            :maxlength="500"
            show-count />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="公告类型" name="type">
              <DictSelect 
                v-model:value="form.type" 
                dict-type="announcement_type" 
                placeholder="请选择公告类型"
                value-type="number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="重要级别" name="level">
              <DictSelect 
                v-model:value="form.level" 
                dict-type="announcement_level" 
                placeholder="请选择重要级别"
                value-type="number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="模板分类" name="category">
              <DictSelect 
                v-model:value="form.category" 
                dict-type="template_category" 
                placeholder="请选择分类"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="排序值" name="sortOrder">
          <a-input-number 
            v-model:value="form.sortOrder" 
            placeholder="数值越大越靠前"
            :min="0"
            :max="9999"
            style="width: 100%" />
        </a-form-item>
        
        <!-- 是否系统模板（仅管理员可见） -->
        <a-form-item v-if="isAdmin" label="是否系统模板" name="isSystem">
          <DictRadio 
            v-model:value="form.isSystem" 
            dict-type="yes_no" 
            value-type="number"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px;">
            系统模板带"系统"标签，普通用户不能编辑和删除
          </div>
        </a-form-item>
        
        <a-form-item name="title">
          <template #label>
            <span>标题模板</span>
            <a-tooltip :title="variableTooltip">
              <QuestionCircleOutlined style="margin-left: 4px; color: #999;" />
            </a-tooltip>
          </template>
          <a-input v-model:value="form.title" placeholder="请输入标题模板" :maxlength="200" show-count />
        </a-form-item>
        
        <a-form-item name="content">
          <template #label>
            <span>内容模板</span>
            <a-tooltip :title="variableTooltip">
              <QuestionCircleOutlined style="margin-left: 4px; color: #999;" />
            </a-tooltip>
          </template>
          <WangEditor 
            v-model="form.content" 
            placeholder="请输入内容模板"
            :height="400" />
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 预览抽屉 -->
    <a-drawer
      v-model:open="previewVisible"
      title="模板预览"
      width="900"
      placement="right"
      @close="handleClosePreview">
      <div v-if="previewTemplate" class="template-preview">
        <a-descriptions bordered :column="2" size="small" :labelStyle="{ width: '100px', minWidth: '100px' }">
          <a-descriptions-item label="模板名称" :span="2">
            <span>{{ previewTemplate.name }}</span>
            <a-tag v-if="previewTemplate.isSystem === 1" color="blue" style="margin-left: 8px" size="small">
              系统
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="模板分类">
            <a-tag :color="getCategoryColor(previewTemplate.category)">
              {{ getCategoryLabel(previewTemplate.category) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="公告类型">
            <a-tag :color="getTypeColor(previewTemplate.type)">
              {{ getTypeLabel(previewTemplate.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="重要级别">
            <a-tag :color="getLevelColor(previewTemplate.level)">
              {{ getLevelLabel(previewTemplate.level) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="使用次数">
            {{ previewTemplate.useCount }} 次
          </a-descriptions-item>
          <a-descriptions-item label="排序值">
            {{ previewTemplate.sortOrder }}
          </a-descriptions-item>
          <a-descriptions-item label="模板描述" :span="2">
            {{ previewTemplate.description || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="标题模板" :span="2">
            <div class="preview-text">{{ previewedTitle }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="内容模板" :span="2">
            <div style="border: 1px solid #ccc;">
              <Editor
                style="height: 500px; overflow-y: auto;"
                v-model="previewHtml"
                :defaultConfig="previewEditorConfig"
                mode="default"
                @onCreated="handlePreviewCreated"
              />
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { computed, onMounted, ref, shallowRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, SearchOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useUserStore } from '@/stores/modules/user'
import { useTemplateList } from '../composables/useTemplateList'
import { useTemplateForm } from '../composables/useTemplateForm'
import { useTemplateOps } from '../composables/useTemplateOps'
import { 
  ANNOUNCEMENT_TYPE_OPTIONS, 
  ANNOUNCEMENT_LEVEL_OPTIONS,
  getTypeLabel,
  getTypeColor,
  getLevelLabel,
  getLevelColor
} from '../constants/announcementTypes'
import { 
  TEMPLATE_CATEGORY_OPTIONS,
  getCategoryLabel,
  getCategoryColor
} from '../constants/templateCategories'
import { replaceTemplateVariables, getVariableDescription } from '../utils/templateVariables'
import WangEditor from '@/components/WangEditor/index.vue'

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

// 获取用户信息
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 列表逻辑
const {
  loading,
  templateList,
  total,
  pageNo,
  pageSize,
  keyword,
  filterCategory,
  loadTemplateList,
  handlePageChange,
  handleCategoryFilter
} = useTemplateList()

// 搜索
const handleSearch = () => {
  pageNo.value = 1
  loadTemplateList()
}

// 重置
const handleReset = () => {
  keyword.value = ''
  filterCategory.value = null
  loadTemplateList()
}

// 表单逻辑
const {
  addDrawerVisible,
  addForm,
  addFormRules,
  addFormRef,
  addSubmitLoading,
  handleAdd,
  handleAddCancel,
  handleAddSubmit,
  editDrawerVisible,
  editForm,
  editFormRules,
  editFormRef,
  editSubmitLoading,
  handleEdit,
  handleEditCancel,
  handleEditSubmit
} = useTemplateForm(loadTemplateList)

// 操作逻辑
const {
  handleDelete,
  handleBatchDelete: batchDeleteFn,
  handleCopy,
  handlePreview,
  previewVisible,
  previewTemplate,
  handleClosePreview
} = useTemplateOps(loadTemplateList)

// 表格行选择
const selectedRowKeys = ref([])

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 禁用系统模板的复选框（非管理员）
const getCheckboxProps = (record) => {
  if (record.isSystem === 1 && !isAdmin.value) {
    return {
      disabled: true
    }
  }
  return {}
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条模板吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      await batchDeleteFn(selectedRowKeys.value)
      selectedRowKeys.value = []
    }
  })
}

// 统一的抽屉状态
const drawerVisible = computed({
  get: () => addDrawerVisible.value || editDrawerVisible.value,
  set: (val) => {
    addDrawerVisible.value = val
    editDrawerVisible.value = val
  }
})

const drawerTitle = computed(() => addDrawerVisible.value ? '新增模板' : '编辑模板')
const currentFormRef = computed(() => addDrawerVisible.value ? addFormRef.value : editFormRef.value)
const form = computed(() => addDrawerVisible.value ? addForm : editForm)
const formRules = computed(() => addDrawerVisible.value ? addFormRules : editFormRules)
const submitLoading = computed(() => addDrawerVisible.value ? addSubmitLoading.value : editSubmitLoading.value)

const handleDrawerClose = () => {
  if (addDrawerVisible.value) {
    handleAddCancel()
  } else {
    handleEditCancel()
  }
}

const handleDrawerSubmit = async () => {
  if (addDrawerVisible.value) {
    await handleAddSubmit()
  } else {
    await handleEditSubmit()
  }
}

// 变量提示
const variableTooltip = computed(() => {
  return '支持变量：' + getVariableDescription()
})

// 预览时替换变量
const previewedTitle = computed(() => {
  if (!previewTemplate.value) return ''
  return replaceTemplateVariables(previewTemplate.value.title)
})

const previewedContent = computed(() => {
  if (!previewTemplate.value) return ''
  return replaceTemplateVariables(previewTemplate.value.content)
})

// 预览编辑器实例
const previewEditorRef = shallowRef()
const previewHtml = ref('')

// 预览编辑器配置
const previewEditorConfig = {
  readOnly: true,
  scroll: true
}

// 预览编辑器创建
const handlePreviewCreated = (editor) => {
  previewEditorRef.value = editor
  editor.disable() // 禁用编辑
}

// 监听预览内容变化，更新编辑器
watch(previewedContent, (newContent) => {
  previewHtml.value = newContent
})

// 监听预览抽屉打开，初始化内容
watch(previewVisible, (visible) => {
  if (visible && previewedContent.value) {
    previewHtml.value = previewedContent.value
  } else if (!visible) {
    // 关闭时清空内容
    previewHtml.value = ''
    if (previewEditorRef.value) {
      previewEditorRef.value.destroy()
      previewEditorRef.value = null
    }
  }
})

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180,
    ellipsis: true
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 120,
    align: 'center'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    align: 'center'
  },
  {
    title: '级别',
    dataIndex: 'level',
    key: 'level',
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
    title: '使用次数',
    dataIndex: 'useCount',
    key: 'useCount',
    width: 100,
    align: 'center'
  },
  {
    title: '模板描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
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
  name: true,
  category: true,
  type: true,
  level: true,
  sortOrder: true,
  useCount: true,
  description: true
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
  loadTemplateList()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (previewEditorRef.value) {
    previewEditorRef.value.destroy()
  }
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

.template-management {
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

  .preview-text {
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>