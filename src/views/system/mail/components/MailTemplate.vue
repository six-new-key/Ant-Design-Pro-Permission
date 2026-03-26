<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item>
            <a-input 
              v-model:value="searchForm.keyword" 
              placeholder="模板名称或代码"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <DictSelect 
              v-model:value="searchForm.category" 
              dict-type="mail_template_category"
              placeholder="分类"
              style="width: 180px"
              value-type="number"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-select 
              v-model:value="searchForm.status" 
              placeholder="状态"
              style="width: 180px"
              allow-clear
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                查询
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

    <!-- 表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <!-- 左侧：业务操作按钮 -->
          <a-space :size="12">
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:mail:templateAdd'">
              <template #icon><PlusOutlined /></template>
              新增模板
            </a-button>
          </a-space>
          
          <!-- 右侧：视图工具按钮 -->
          <a-space :size="12">
            <a-tooltip :title="searchVisible ? '隐藏搜索栏' : '显示搜索栏'">
              <a-button shape="circle" @click="toggleSearch">
                <template #icon>
                  <EyeOutlined v-if="searchVisible" />
                  <EyeInvisibleOutlined v-else />
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

      <a-table
        :columns="visibleColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 'max-content' }"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'templateType'">
            <a-tag :color="record.templateType === 2 ? 'blue' : 'default'">
              {{ record.templateType === 2 ? 'HTML' : '纯文本' }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'allowResend'">
            <a-tag :color="record.allowResend === 1 ? 'green' : 'red'">
              {{ record.allowResend === 1 ? '允许' : '不允许' }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-switch 
              :checked="record.status === 1" 
              checked-children="启用" 
              un-checked-children="禁用"
              @change="() => handleToggleStatus(record)"
            />
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-tooltip title="预览">
                <a-button 
                  type="link" 
                  size="small" 
                  @click="handlePreview(record)"
                >
                  <template #icon><EyeOutlined /></template>
                  预览
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <a-button 
                  type="link" 
                  size="small" 
                  @click="handleEdit(record)"
                  v-permission.disable="'system:mail:templateEdit'"
                >
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
              </a-tooltip>
              
              <a-popconfirm
                title="确定要删除这个模板吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-tooltip title="删除">
                  <a-button type="link" size="small" danger v-permission.disable="'system:mail:templateDelete'">
                    <template #icon><DeleteOutlined /></template>
                    删除
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑抽屉 -->
    <a-drawer
      :width="800"
      :open="drawerVisible"
      :closable="false"
      @close="handleDrawerClose"
    >
      <template #title>
        <div class="drawer-header">
          <span class="drawer-title">{{ drawerTitle }}</span>
          <a-space :size="12">
            <a-button @click="handleDrawerClose">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <div :style="cssVars">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
        >
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="模板代码" name="templateCode">
                <a-input 
                  v-model:value="formData.templateCode" 
                  placeholder="唯一标识，如：verification-code"
                  :disabled="!!editId"
                />
                <div class="form-tip">
                  用于API调用，创建后不可修改
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="模板名称" name="templateName">
                <a-input v-model:value="formData.templateName" placeholder="请输入模板名称" />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="分类" name="category">
                <DictSelect 
                  v-model:value="formData.category" 
                  dict-type="mail_template_category"
                  placeholder="请选择分类"
                  value-type="number"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="模板类型" name="templateType">
                <DictSelect 
                  v-model:value="formData.templateType" 
                  dict-type="mail_template_type"
                  placeholder="请选择模板类型"
                  value-type="number"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="允许重发">
                <DictSelect 
                  v-model:value="formData.allowResend" 
                  dict-type="mail_allow_resend"
                  placeholder="请选择是否允许重发"
                  value-type="number"
                />
                <div class="form-tip">
                  验证码类邮件建议设置为"不允许"
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="邮件主题" name="subjectTemplate">
            <a-input v-model:value="formData.subjectTemplate" placeholder="支持变量 {{变量名}} 或 ${变量名}" />
          </a-form-item>
          
          <a-form-item label="邮件内容" name="contentTemplate">
            <a-textarea 
              v-model:value="formData.contentTemplate" 
              placeholder="支持变量 {{变量名}} 或 ${变量名}"
              :rows="10"
            />
          </a-form-item>
          
          <a-form-item label="可用变量">
            <a-textarea 
              v-model:value="formData.variables" 
              placeholder='JSON格式，如：[{"name":"code","description":"验证码"},{"name":"username","description":"用户名"}]'
              :rows="3"
            />
            <div class="form-tip">
              JSON数组格式，每个变量包含name和description字段
            </div>
          </a-form-item>
          
          <a-form-item label="模板说明">
            <a-textarea v-model:value="formData.description" :rows="3" placeholder="请输入模板说明" />
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>

    <!-- 预览抽屉 -->
    <a-drawer
      title="模板预览"
      :width="800"
      :open="previewVisible"
      @close="previewVisible = false"
    >
      <div :style="cssVars" class="preview-content">
        <h3>邮件主题：</h3>
        <p>{{ previewData.subject }}</p>
        <h3>邮件内容：</h3>
        <div v-if="currentTemplate?.templateType === 2" v-html="previewData.content"></div>
        <pre v-else>{{ previewData.content }}</pre>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import DictSelect from '@/components/custom/DictSelect.vue'
import {
  queryTemplatePage,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  previewTemplate
} from '@/api/mail'

// CSS 变量
const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border': t.colorBorder,
    '--color-bg-layout': t.colorBgLayout,
    '--border-radius': `${t.borderRadius}px`,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
  }
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: undefined,
  status: undefined
})

// 列配置
const allColumns = [
  { title: '模板代码', dataIndex: 'templateCode', key: 'templateCode', width: 180, ellipsis: true },
  { title: '模板名称', dataIndex: 'templateName', key: 'templateName', width: 200, ellipsis: true },
  { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
  { title: '模板类型', key: 'templateType', width: 100 },
  { title: '允许重发', key: 'allowResend', width: 100 },
  { title: '使用次数', dataIndex: 'useCount', key: 'useCount', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 300, fixed: 'right' }
]

// 列显示控制
const columnVisibility = reactive({
  templateCode: true,
  templateName: true,
  category: true,
  templateType: true,
  allowResend: true,
  useCount: true,
  status: true,
  createTime: true
})

const configurableColumns = allColumns.filter(col => col.key !== 'action')

const visibleColumns = computed(() => {
  return allColumns.filter(col => {
    if (col.key === 'action') return true
    return columnVisibility[col.key]
  })
})

const toggleColumn = (key) => {
  columnVisibility[key] = !columnVisibility[key]
}

// 表格数据
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  showLessItems: true
})

// 抽屉
const drawerVisible = ref(false)
const drawerTitle = ref('新增模板')
const formRef = ref()
const formData = reactive({
  templateCode: '',
  templateName: '',
  category: undefined,
  templateType: 2,
  subjectTemplate: '',
  contentTemplate: '',
  variables: '',
  description: '',
  status: 1,
  allowResend: 1
})

const formRules = {
  templateCode: [{ required: true, message: '请输入模板代码', trigger: 'blur' }],
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  subjectTemplate: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
  contentTemplate: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }]
}

const submitLoading = ref(false)
const editId = ref(null)

// 预览
const previewVisible = ref(false)
const previewData = reactive({
  subject: '',
  content: ''
})
const currentTemplate = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await queryTemplatePage({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.code === 200) {
      tableData.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: undefined,
    status: undefined
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新增
const handleAdd = () => {
  drawerTitle.value = '新增模板'
  editId.value = null
  Object.assign(formData, {
    templateCode: '',
    templateName: '',
    category: undefined,
    templateType: 2,
    subjectTemplate: '',
    contentTemplate: '',
    variables: '',
    description: '',
    allowResend: 1
  })
  drawerVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  drawerTitle.value = '编辑模板'
  editId.value = record.id
  Object.assign(formData, {
    templateCode: record.templateCode,
    templateName: record.templateName,
    category: record.category,
    templateType: record.templateType,
    subjectTemplate: record.subjectTemplate,
    contentTemplate: record.contentTemplate,
    variables: record.variables,
    description: record.description,
    allowResend: record.allowResend
  })
  drawerVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const api = editId.value ? updateTemplate : addTemplate
    const params = editId.value ? [editId.value, formData] : [formData]
    
    const res = await api(...params)
    if (res.code === 200) {
      Message.success(editId.value ? '更新成功' : '新增成功')
      handleDrawerClose()
      loadData()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false
  formRef.value?.resetFields()
}

// 删除
const handleDelete = async (id) => {
  try {
    const res = await deleteTemplate(id)
    if (res.code === 200) {
      Message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 切换状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  Modal.confirm({
    title: '确认操作',
    content: `确定要${statusText}该模板吗？`,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        const res = await toggleTemplateStatus(record.id, newStatus)
        if (res.code === 200) {
          Message.success('状态更新成功')
          loadData()
        }
      } catch (error) {
        console.error('状态更新失败:', error)
      }
    }
  })
}

// 预览
const handlePreview = async (record) => {
  currentTemplate.value = record
  try {
    const res = await previewTemplate(record.id, {})
    if (res.code === 200) {
      previewData.subject = res.data.subject
      previewData.content = res.data.content
      previewVisible.value = true
    }
  } catch (error) {
    console.error('预览失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
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

.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s ease;
}

.search-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }
  
  pre {
    background: var(--color-bg-layout);
    padding: 12px;
    border-radius: var(--border-radius);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.form-tip {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-top: 4px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
