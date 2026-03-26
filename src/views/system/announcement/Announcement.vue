<template>
  <div class="announcement-container" :style="cssVars">
    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- Tab 1: 公告管理 -->
        <a-tab-pane key="announcement" tab="公告管理">
          <!-- 搜索和筛选区域 -->
          <transition name="search-slide">
            <a-card :bordered="false" class="search-card" v-show="searchVisible">
              <a-form layout="inline" class="search-form-compact">
                <a-form-item>
                  <a-input
                    v-model:value="keyword"
                    placeholder="请输入公告标题"
                    allow-clear
                    style="width: 180px"
                    @pressEnter="handleSearch" />
                </a-form-item>
                <a-form-item>
                  <DictSelect
                    v-model:value="filterType"
                    dict-type="announcement_type"
                    placeholder="请选择类型"
                    allow-clear
                    value-type="number"
                    style="width: 180px"
                  />
                </a-form-item>
                <a-form-item>
                  <DictSelect
                    v-model:value="filterStatus"
                    dict-type="announcement_status"
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
                  <a-button type="primary" @click="handleAdd" v-permission.disable="'system:announcement:add'">
                    <template #icon><PlusOutlined /></template>
                    新增
                  </a-button>
                  <a-button 
                    type="primary" 
                    danger 
                    :disabled="selectedRowKeys.length === 0"
                    @click="handleBatchDelete" v-permission.disable="'system:announcement:remove'">
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
                </a-space>
              </div>
            </template>

            <!-- 公告表格 -->
            <a-table
              :dataSource="announcementList"
              :columns="visibleColumns"
              :loading="loading"
              :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: onSelectChange
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
                <!-- 标题 -->
                <template v-if="column.key === 'title'">
                  <div class="title-cell">
                    <a-tag v-if="record.isTop === 1" color="red" style="margin-right: 8px">置顶</a-tag>
                    <span>{{ record.title }}</span>
                  </div>
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

                <!-- 状态 -->
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusLabel(record.status) }}
                  </a-tag>
                </template>

                <!-- 创建时间 -->
                <template v-if="column.key === 'createTime'">
                  {{ formatDateTime(record.createTime) }}
                </template>

                <!-- 操作 -->
                <template v-if="column.key === 'action'">
                  <a-space :size="8">
                    <!-- 草稿状态 -->
                    <template v-if="record.status === 0">
                      <a-button type="link" size="small" @click="handlePreview(record)">
                        <template #icon><EyeOutlined /></template>
                        预览
                      </a-button>
                      <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:announcement:update'">
                        <template #icon><EditOutlined /></template>
                        编辑
                      </a-button>
                      <a-button type="link" size="small" @click="handlePublish(record)" v-permission.disable="'system:announcement:publish'">
                        <template #icon><SendOutlined /></template>
                        发布
                      </a-button>
                      <a-popconfirm title="确认删除吗？" @confirm="handleDelete(record)" v-permission.disable="'system:announcement:remove'">
                        <a-button type="link" size="small" danger>
                          <template #icon><DeleteOutlined /></template>
                          删除
                        </a-button>
                      </a-popconfirm>
                    </template>

                    <!-- 已发布状态 -->
                    <template v-else-if="record.status === 1">
                      <a-button type="link" size="small" @click="handlePreview(record)">
                        <template #icon><EyeOutlined /></template>
                        预览
                      </a-button>
                      <a-button type="link" size="small" @click="handleToggleTop(record)">
                        <template #icon><PushpinOutlined /></template>
                        {{ record.isTop === 1 ? '取消置顶' : '置顶' }}
                      </a-button>
                      <a-button type="link" size="small" danger @click="handleRevoke(record)" v-permission.disable="'system:announcement:revoke'">
                        <template #icon><RollbackOutlined /></template>
                        撤回
                      </a-button>
                      <a-popconfirm title="确认删除吗？" @confirm="handleDelete(record)" v-permission.disable="'system:announcement:remove'">
                        <a-button type="link" size="small" danger>
                          <template #icon><DeleteOutlined /></template>
                          删除
                        </a-button>
                      </a-popconfirm>
                    </template>

                    <!-- 已撤回状态 -->
                    <template v-else-if="record.status === 2">
                      <a-button type="link" size="small" @click="handlePreview(record)">
                        <template #icon><EyeOutlined /></template>
                        预览
                      </a-button>
                      <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:announcement:update'">
                        <template #icon><EditOutlined /></template>
                        编辑
                      </a-button>
                      <a-button type="link" size="small" @click="handlePublish(record)" v-permission.disable="'system:announcement:publish'">
                        <template #icon><SendOutlined /></template>
                        发布
                      </a-button>
                      <a-popconfirm title="确认删除吗？" @confirm="handleDelete(record)" v-permission.disable="'system:announcement:remove'">
                        <a-button type="link" size="small" danger>
                          <template #icon><DeleteOutlined /></template>
                          删除
                        </a-button>
                      </a-popconfirm>
                    </template>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>
        
        <!-- Tab 2: 模板管理 -->
        <a-tab-pane key="template" tab="模板管理">
          <TemplateManagement />
        </a-tab-pane>
      </a-tabs>
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
        
        <!-- 模板选择器（仅新增时显示） -->
        <TemplateSelector 
          v-if="addDrawerVisible"
          v-model="selectedTemplateId"
          :template-list="allTemplates"
          @template-selected="handleTemplateSelected" />
        
        <a-form-item label="公告标题" name="title">
          <a-input v-model:value="form.title" placeholder="请输入公告标题" :maxlength="200" show-count />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="公告类型" name="type">
              <DictSelect 
                v-model:value="form.type" 
                dict-type="announcement_type" 
                placeholder="请选择公告类型"
                value-type="number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="重要级别" name="level">
              <DictSelect 
                v-model:value="form.level" 
                dict-type="announcement_level" 
                placeholder="请选择重要级别"
                value-type="number"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="公告内容" name="content">
          <WangEditor 
            v-model="form.content" 
            placeholder="请输入公告内容"
            :height="400" />
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 预览抽屉 -->
    <a-drawer
      v-model:open="previewVisible"
      title="公告预览"
      width="900"
      placement="right"
      @close="handleClosePreview">
      <div v-if="previewAnnouncement" class="announcement-preview">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="公告标题" :span="2">
            <span>{{ previewAnnouncement.title }}</span>
            <a-tag v-if="previewAnnouncement.isTop === 1" color="red" style="margin-left: 8px" size="small">
              置顶
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="公告类型">
            <a-tag :color="getTypeColor(previewAnnouncement.type)">
              {{ getTypeLabel(previewAnnouncement.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="重要级别">
            <a-tag :color="getLevelColor(previewAnnouncement.level)">
              {{ getLevelLabel(previewAnnouncement.level) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(previewAnnouncement.status)">
              {{ getStatusLabel(previewAnnouncement.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(previewAnnouncement.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="公告内容" :span="2">
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
import { computed, onMounted, ref, shallowRef, watch, onBeforeUnmount } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, DeleteOutlined, EditOutlined, SendOutlined, PushpinOutlined, RollbackOutlined } from '@ant-design/icons-vue'
import { Editor } from '@wangeditor/editor-for-vue'
import { useAnnouncementList } from './composables/useAnnouncementList'
import { useAnnouncementForm } from './composables/useAnnouncementForm'
import { useAnnouncementOps } from './composables/useAnnouncementOps'
import { useTemplateList } from './composables/useTemplateList'
import { 
  ANNOUNCEMENT_TYPE_OPTIONS, 
  ANNOUNCEMENT_LEVEL_OPTIONS, 
  ANNOUNCEMENT_STATUS_OPTIONS,
  getTypeLabel,
  getTypeColor,
  getLevelLabel,
  getLevelColor,
  getStatusLabel,
  getStatusColor
} from './constants/announcementTypes'
import WangEditor from '@/components/WangEditor/index.vue'
import TemplateManagement from './components/TemplateManagement.vue'
import TemplateSelector from './components/TemplateSelector.vue'
import dayjs from 'dayjs'

const { token } = theme.useToken()

// Tab 切换
const activeTab = ref('announcement')

// 搜索栏显示状态
const searchVisible = ref(true)

const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 列表逻辑
const {
  loading,
  announcementList,
  total,
  pageNo,
  pageSize,
  keyword,
  filterType,
  filterStatus,
  loadAnnouncementList,
  handlePageChange,
  handleSearch: searchList
} = useAnnouncementList()

// 模板列表（用于下拉选择）
const {
  allTemplates,
  loadAllTemplates
} = useTemplateList()

// 搜索
const handleSearch = () => {
  searchList(keyword.value)
}

// 重置
const handleReset = () => {
  keyword.value = ''
  filterType.value = null
  filterStatus.value = null
  loadAnnouncementList()
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
} = useAnnouncementForm(loadAnnouncementList)

// 操作逻辑
const {
  handleDelete,
  handleBatchDelete: batchDeleteFn,
  handlePublish,
  handleRevoke,
  handleToggleTop
} = useAnnouncementOps(loadAnnouncementList)

// 表格行选择
const selectedRowKeys = ref([])

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条公告吗？此操作不可撤销。`,
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

// 模板选择
const selectedTemplateId = ref(null)

// 模板选择回调
const handleTemplateSelected = (templateData) => {
  if (templateData) {
    // 填充表单
    addForm.title = templateData.title
    addForm.content = templateData.content
    addForm.type = templateData.type
    addForm.level = templateData.level
  }
}

// 统一的抽屉状态
const drawerVisible = computed({
  get: () => addDrawerVisible.value || editDrawerVisible.value,
  set: (val) => {
    addDrawerVisible.value = val
    editDrawerVisible.value = val
  }
})

const drawerTitle = computed(() => addDrawerVisible.value ? '新增公告' : '编辑公告')
const currentFormRef = computed(() => addDrawerVisible.value ? addFormRef.value : editFormRef.value)
const form = computed(() => addDrawerVisible.value ? addForm : editForm)
const formRules = computed(() => addDrawerVisible.value ? addFormRules : editFormRules)
const submitLoading = computed(() => addDrawerVisible.value ? addSubmitLoading.value : editSubmitLoading.value)

const handleDrawerClose = () => {
  selectedTemplateId.value = null
  if (addDrawerVisible.value) {
    handleAddCancel()
  } else {
    handleEditCancel()
  }
}

const handleDrawerSubmit = async () => {
  if (addDrawerVisible.value) {
    await handleAddSubmit()
    selectedTemplateId.value = null
  } else {
    await handleEditSubmit()
  }
}

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
    ellipsis: true
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    ellipsis: true
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 110,
    align: 'center'
  },
  {
    title: '级别',
    dataIndex: 'level',
    key: 'level',
    width: 90,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 90,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170
  },
  {
    title: '操作',
    key: 'action',
    width: 260,
    fixed: 'right'
  }
]

// 列显示控制
const columnVisibility = ref({
  id: true,
  title: true,
  type: true,
  level: true,
  status: true,
  createTime: true
})

// 可配置的列（排除操作列）
const configurableColumns = computed(() => {
  return columns.filter(col => col.key !== 'action')
})

// 可见的列
const visibleColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'action') return true // 操作列始终显示
    return columnVisibility.value[col.key]
  })
})

// 切换列显示
const toggleColumn = (key) => {
  columnVisibility.value[key] = !columnVisibility.value[key]
}

// 格式化时间
const formatDateTime = (dateTime) => {
  return dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 预览功能
const previewVisible = ref(false)
const previewAnnouncement = ref(null)
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

// 打开预览
const handlePreview = (record) => {
  previewAnnouncement.value = record
  previewVisible.value = true
}

// 关闭预览
const handleClosePreview = () => {
  previewVisible.value = false
  previewAnnouncement.value = null
  previewHtml.value = ''
  if (previewEditorRef.value) {
    previewEditorRef.value.destroy()
    previewEditorRef.value = null
  }
}

// 监听预览公告变化，更新编辑器内容
watch(() => previewAnnouncement.value, (newAnnouncement) => {
  if (newAnnouncement && newAnnouncement.content) {
    previewHtml.value = newAnnouncement.content
  }
})

// 监听预览抽屉打开，初始化内容
watch(previewVisible, (visible) => {
  if (visible && previewAnnouncement.value && previewAnnouncement.value.content) {
    previewHtml.value = previewAnnouncement.value.content
  } else if (!visible) {
    // 关闭时清空内容
    previewHtml.value = ''
    if (previewEditorRef.value) {
      previewEditorRef.value.destroy()
      previewEditorRef.value = null
    }
  }
})

// CSS 变量映射
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border': t.colorBorder
  }
})

onMounted(() => {
  loadAnnouncementList()
  loadAllTemplates()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (previewEditorRef.value) {
    previewEditorRef.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
@import './styles/announcement.scss';
</style>
