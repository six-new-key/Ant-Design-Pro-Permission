<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item name="jobName">
            <a-input v-model:value="searchForm.jobName" placeholder="请输入任务名称" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="jobGroup">
            <DictSelect
              v-model:value="searchForm.jobGroup"
              dict-type="job_group"
              placeholder="请选择任务分组"
              allow-clear
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect
              v-model:value="searchForm.status"
              dict-type="job_status"
              placeholder="请选择任务状态"
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
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:schedule:job_add'">
              <template #icon><PlusOutlined /></template>
              新增
            </a-button>
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete" v-permission.disable="'system:schedule:job_batch_remove'">
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

      <a-table
        :columns="visibleColumns"
        :data-source="dataSource"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        :pagination="pagination"
        :loading="loading"
        row-key="jobId"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              checked-children="正常"
              un-checked-children="禁用"
              @change="() => handleStatusChange(record)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:schedule:job_update'">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)" v-permission.disable="'system:schedule:job_remove'">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
              <a-button type="link" size="small" style="color: #52c41a;" @click="handleRun(record)" v-permission.disable="'system:schedule:job_run'">
                <template #icon><PlayCircleOutlined /></template>
                执行
              </a-button>
              <a-button type="link" size="small" @click="handleViewLog(record)">
                <template #icon><FileTextOutlined /></template>
                日志
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="formVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ formTitle }}</span>
          <a-space :size="12">
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="任务名称" name="jobName">
                <a-input v-model:value="formData.jobName" placeholder="请输入任务名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="任务分组" name="jobGroup">
                <DictSelect 
                  v-model:value="formData.jobGroup" 
                  dict-type="job_group" 
                  placeholder="请选择任务分组"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item name="invokeTarget">
                <template #label>
                  调用目标
                  <a-tooltip>
                    <template #title>
                      <div>Bean调用：systemTask.testParams('test')</div>
                      <div>Class调用：com.universal.task.SystemTask.testParams('test')</div>
                      <div>参数支持：字符串、布尔类型、长整型(L)、浮点型(D)、整型</div>
                    </template>
                    <QuestionCircleOutlined style="margin-left: 4px; color: #999;" />
                  </a-tooltip>
                </template>
                <a-input
                  v-model:value="formData.invokeTarget"
                  placeholder="Bean调用示例：systemTask.testNoParams()"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="Cron表达式" name="cronExpression">
                <a-input
                  v-model:value="formData.cronExpression"
                  placeholder="请输入Cron执行表达式"
                >
                  <template #suffix>
                    <a-button type="link" size="small" @click="showCronGenerator">
                      <template #icon><ClockCircleOutlined /></template>
                      生成表达式
                    </a-button>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="执行策略" name="misfirePolicy">
                <DictSelect 
                  v-model:value="formData.misfirePolicy" 
                  dict-type="job_misfire_policy" 
                  value-type="number"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="并发执行" name="concurrent">
                <DictSelect 
                  v-model:value="formData.concurrent" 
                  dict-type="job_concurrent" 
                  value-type="number"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="备注" name="remark">
                <a-textarea
                  v-model:value="formData.remark"
                  placeholder="请输入备注"
                  :rows="3"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>

    <!-- Cron表达式生成器 -->
    <a-modal
      v-model:open="cronVisible"
      width="950px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">Cron表达式生成器</span>
          <a-space :size="12">
            <a-button @click="cronVisible = false">取消</a-button>
            <a-button type="primary" @click="handleCronConfirm">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars" style="max-height: 550px; overflow-y: auto;">
        <CronGenerator v-model:value="cronExpression" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { getJobPage, getJobById, addJob, updateJob, deleteJob, changeStatus, runJob } from '@/api/job'
import { useRouter } from 'vue-router'
import CronGenerator from './components/CronGenerator.vue'

const router = useRouter()

const { useToken } = theme
const { token } = useToken()

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

// 查询表单
const searchForm = reactive({
  jobName: '',
  jobGroup: undefined,
  status: undefined
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 表格列定义
const columns = [
  { title: '任务ID', dataIndex: 'jobId', key: 'jobId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', key: 'jobName', width: 150, ellipsis: true },
  { title: '任务分组', dataIndex: 'jobGroup', key: 'jobGroup', width: 120 },
  { title: '调用目标', dataIndex: 'invokeTarget', key: 'invokeTarget', width: 200, ellipsis: true },
  { title: 'Cron表达式', dataIndex: 'cronExpression', key: 'cronExpression', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 280, fixed: 'right' }
]

// 列显隐控制
const columnVisibility = ref({
  jobId: true,
  jobName: true,
  jobGroup: true,
  invokeTarget: true,
  cronExpression: true,
  status: true,
  remark: true,
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

// 表格数据
const dataSource = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])

// 分页
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

// 行选择
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 弹窗
const formVisible = ref(false)
const formTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  jobId: null,
  jobName: '',
  jobGroup: undefined,
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: 1,
  concurrent: 0,
  remark: ''
})

const formRules = {
  jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  jobGroup: [{ required: true, message: '请选择任务分组', trigger: 'change' }],
  invokeTarget: [{ required: true, message: '请输入调用目标', trigger: 'blur' }],
  cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }],
  misfirePolicy: [{ required: true, message: '请选择执行策略', trigger: 'change' }],
  concurrent: [{ required: true, message: '请选择并发执行', trigger: 'change' }]
}

// Cron生成器
const cronVisible = ref(false)
const cronExpression = ref('')

const showCronGenerator = () => {
  cronExpression.value = formData.cronExpression
  cronVisible.value = true
}

const handleCronConfirm = () => {
  formData.cronExpression = cronExpression.value
  cronVisible.value = false
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      jobName: searchForm.jobName || undefined,
      jobGroup: searchForm.jobGroup,
      status: searchForm.status
    }
    
    const res = await getJobPage(params)
    
    if (res.code === 200) {
      dataSource.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.jobName = ''
  searchForm.jobGroup = undefined
  searchForm.status = undefined
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  formTitle.value = '新增定时任务'
  formData.jobId = null
  formData.jobName = ''
  formData.jobGroup = undefined
  formData.invokeTarget = ''
  formData.cronExpression = ''
  formData.misfirePolicy = 1
  formData.concurrent = 0
  formData.remark = ''
  formVisible.value = true
}

// 编辑
const handleEdit = async (record) => {
  isEdit.value = true
  formTitle.value = '编辑定时任务'
  try {
    const res = await getJobById(record.jobId)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      formVisible.value = true
    }
  } catch (error) {
    Message.error('加载数据失败')
  }
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务"${record.jobName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await deleteJob(record.jobId)
        if (res.code === 200) {
          Message.success('删除成功')
          loadData()
        }
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的数据')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条定时任务吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await deleteJob(selectedRowKeys.value.join(','))
        if (res.code === 200) {
          Message.success('删除成功')
          selectedRowKeys.value = []
          loadData()
        }
      } catch (error) {
        Message.error('删除失败')
      }
    }
  })
}

// 状态切换
const handleStatusChange = async (record) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要${record.status === 1 ? '禁用' : '启用'}任务"${record.jobName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        const res = await changeStatus(record.jobId, record.status === 1 ? 0 : 1)
        if (res.code === 200) {
          Message.success('状态修改成功')
          loadData()
        }
      } catch (error) {
        Message.error('状态修改失败')
      }
    }
  })
}

// 执行任务
const handleRun = (record) => {
  Modal.confirm({
    title: '确认执行',
    content: `确定要立即执行任务"${record.jobName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        const res = await runJob(record.jobId)
        if (res.code === 200) {
          Message.success('任务执行成功')
        }
      } catch (error) {
        Message.error('任务执行失败')
      }
    }
  })
}

// 查看日志
const handleViewLog = (record) => {
  router.push({
    path: '/monitor/job-log',
    query: { jobId: record.jobId, jobName: record.jobName }
  })
}

// 弹窗确定
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    const api = isEdit.value ? updateJob : addJob
    const res = await api(formData)
    if (res.code === 200) {
      Message.success(isEdit.value ? '编辑成功' : '新增成功')
      formVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

// 弹窗取消
const handleCancel = () => {
  formVisible.value = false
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
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
</style>
