<template>
  <a-card :bordered="false">
    <template #title>
      <a-form layout="inline">
        <a-form-item>
          <a-input
            v-model:value="searchForm.jobName"
            placeholder="任务名称"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.jobGroup"
            placeholder="任务分组"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="DEFAULT">默认</a-select-option>
            <a-select-option value="SYSTEM">系统</a-select-option>
            <a-select-option value="TEST">测试</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.status"
            placeholder="任务状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
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
    </template>

    <template #extra>
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增
        </a-button>
        <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
      </a-space>
    </template>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :row-selection="rowSelection"
      :scroll="{ x: 1500 }"
      row-key="jobId"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 任务状态 -->
        <template v-if="column.key === 'status'">
          <a-switch
            :checked="record.status === 1"
            :checked-children="'正常'"
            :un-checked-children="'禁用'"
            @change="(checked) => handleStatusChange(record, checked)"
          />
        </template>

        <!-- 操作 -->
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">
              删除
            </a-button>
            <a-button type="link" size="small" style="color: #52c41a;" @click="handleRun(record)">
              执行
            </a-button>
            <a-button type="link" size="small" @click="handleViewLog(record)">
              日志
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="formVisible"
      :title="formTitle"
      :width="590"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="任务名称" name="jobName">
              <a-input v-model:value="formData.jobName" placeholder="请输入任务名称" style="width: 250px" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="任务分组" name="jobGroup">
              <a-select v-model:value="formData.jobGroup" placeholder="请选择任务分组" style="width: 250px">
                <a-select-option value="DEFAULT">默认</a-select-option>
                <a-select-option value="SYSTEM">系统</a-select-option>
                <a-select-option value="TEST">测试</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
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
                style="width: 530px"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="Cron表达式" name="cronExpression">
              <a-input
                v-model:value="formData.cronExpression"
                placeholder="请输入Cron执行表达式"
                style="width: 530px"
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

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="执行策略" name="misfirePolicy">
              <a-select v-model:value="formData.misfirePolicy" style="width: 250px">
                <a-select-option :value="1">立即执行</a-select-option>
                <a-select-option :value="2">执行一次</a-select-option>
                <a-select-option :value="3">放弃执行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="并发执行" name="concurrent">
              <a-select v-model:value="formData.concurrent" style="width: 250px">
                <a-select-option :value="0">允许</a-select-option>
                <a-select-option :value="1">禁止</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <a-textarea
                v-model:value="formData.remark"
                placeholder="请输入备注"
                :rows="3"
                style="width: 530px"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Cron表达式生成器 -->
    <a-modal
      v-model:open="cronVisible"
      title="Cron表达式生成器"
      :width="950"
      :body-style="{ maxHeight: '550px', overflowY: 'auto', padding: '20px 24px' }"
      @ok="handleCronConfirm"
      @cancel="cronVisible = false"
    >
      <CronGenerator v-model:value="cronExpression" />
    </a-modal>
  </a-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { useJobTable } from './composables/useJobTable'
import { useJobForm } from './composables/useJobForm'
import { useJobOperations } from './composables/useJobOperations'
import CronGenerator from './components/CronGenerator.vue'

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

// 表格相关
const {
  loading,
  dataSource,
  pagination,
  searchForm,
  columns,
  selectedRowKeys,
  loadData,
  handleSearch,
  handleReset,
  handleTableChange
} = useJobTable()

// 表单相关
const {
  formRef,
  formVisible,
  formTitle,
  formData,
  formRules,
  openAddForm,
  openEditForm,
  handleSubmit,
  handleCancel
} = useJobForm(loadData)

// 操作相关
const {
  handleDelete,
  handleBatchDelete,
  handleChangeStatus,
  handleRun,
  handleViewLog
} = useJobOperations(loadData, selectedRowKeys)

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

// 是否有选中项
const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 新增
const handleAdd = () => {
  openAddForm()
}

// 编辑
const handleEdit = (record) => {
  openEditForm(record)
}

// 状态切换
const handleStatusChange = (record, checked) => {
  const newStatus = checked ? 1 : 0
  handleChangeStatus(record, newStatus)
}

// 初始化加载数据
onMounted(() => {
  loadData()
})
</script>
