<template>
  <div :style="cssVars">
    <!-- 配置表格 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-title">
          <SettingOutlined class="title-icon" />
          <span>系统配置列表</span>
        </div>
      </template>
      <template #extra>
        <a-button @click="handleRefreshCache" :loading="refreshLoading">
          <template #icon>
            <SyncOutlined />
          </template>
          刷新缓存
        </a-button>
      </template>

      <a-table 
        :dataSource="configList" 
        :columns="columns" 
        :loading="loading"
        :pagination="false"
        row-key="id">
        <template #bodyCell="{ column, record }">
          <!-- 配置名称 -->
          <template v-if="column.key === 'configName'">
            <div class="config-name">
              <SafetyOutlined class="config-icon" />
              <span>{{ record.configName }}</span>
            </div>
          </template>

          <!-- 当前值 -->
          <template v-if="column.key === 'configValue'">
            <!-- 开关类型 -->
            <a-switch 
              v-if="record.configType === 'boolean'"
              :checked="record.configValue === 'true'" 
              :loading="record.loading"
              @change="(checked) => handleConfigChange(record, checked)"
              checked-children="启用" 
              un-checked-children="禁用" />
            
            <!-- 文本类型 -->
            <span v-else-if="record.configType === 'string'">{{ record.configValue }}</span>
            
            <!-- 数字类型 -->
            <span v-else-if="record.configType === 'number'">{{ record.configValue }}</span>
          </template>

          <!-- 操作 -->
          <template v-if="column.key === 'operation'">
            <a-button 
              v-if="record.configType !== 'boolean'" 
              type="link" 
              size="small" 
              @click="handleEdit(record)">
              <template #icon>
                <EditOutlined />
              </template>
              编辑
            </a-button>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑配置弹窗 -->
    <a-modal 
      v-model:open="editDialogVisible" 
      :title="`编辑配置：${currentConfig?.configName}`" 
      width="500px" 
      @ok="handleEditSubmit"
      @cancel="editDialogVisible = false"
      :confirmLoading="submitLoading">
      <a-form 
        ref="editFormRef" 
        :model="editForm" 
        layout="vertical">
        <a-form-item label="配置值" name="value">
          <a-input 
            v-if="currentConfig?.configType === 'string'"
            v-model:value="editForm.value" 
            placeholder="请输入配置值" />
          <a-input-number 
            v-else-if="currentConfig?.configType === 'number'"
            v-model:value="editForm.value" 
            placeholder="请输入配置值"
            style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import {
  SettingOutlined,
  SyncOutlined,
  EditOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import { getSystemConfigList, updateSystemConfig, refreshSystemConfigCache } from '@/api/systemConfig'

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
    '--color-text-secondary': t.colorTextSecondary,
  }
})

// ==================== 响应式数据定义 ====================
const loading = ref(false)
const refreshLoading = ref(false)
const submitLoading = ref(false)
const editDialogVisible = ref(false)

const editForm = reactive({
  value: null
})

const currentConfig = ref(null)
const editFormRef = ref()

// 配置列表
const configList = ref([])

// ==================== 表格列配置 ====================
const columns = [
  {
    title: '配置名称',
    dataIndex: 'configName',
    key: 'configName',
    width: 200
  },
  {
    title: '配置键',
    dataIndex: 'configKey',
    key: 'configKey',
    width: 200
  },
  {
    title: '配置类型',
    dataIndex: 'configType',
    key: 'configType',
    width: 120
  },
  {
    title: '当前值',
    key: 'configValue',
    width: 200,
    align: 'center'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    key: 'operation',
    width: 120,
    align: 'center'
  }
]

// ==================== 业务方法定义 ====================
const fetchConfig = async () => {
  loading.value = true
  try {
    const response = await getSystemConfigList()
    if (response.code === 200 && response.data) {
      configList.value = response.data.map(item => ({
        ...item,
        loading: false
      }))
    }
  } finally {
    loading.value = false
  }
}

const handleConfigChange = async (record, checked) => {
  record.loading = true
  try {
    const response = await updateSystemConfig({
      configKey: record.configKey,
      configValue: checked ? 'true' : 'false'
    })
    if (response.code === 200) {
      Message.success(`${record.configName}已${checked ? '启用' : '禁用'}`)
      record.configValue = checked ? 'true' : 'false'
    } else {
      // 失败时恢复开关状态
      record.configValue = checked ? 'false' : 'true'
    }
  } finally {
    record.loading = false
  }
}

const handleEdit = (record) => {
  currentConfig.value = record
  editForm.value = record.configValue
  editDialogVisible.value = true
}

const handleEditSubmit = async () => {
  submitLoading.value = true
  try {
    const response = await updateSystemConfig({
      configKey: currentConfig.value.configKey,
      configValue: editForm.value.toString()
    })
    if (response.code === 200) {
      Message.success('配置更新成功')
      currentConfig.value.configValue = editForm.value.toString()
      editDialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
  }
}

const handleRefreshCache = async () => {
  refreshLoading.value = true
  try {
    const response = await refreshSystemConfigCache()
    if (response.code === 200) {
      Message.success('缓存刷新成功')
      await fetchConfig()
    }
  } finally {
    refreshLoading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped lang="scss">
.table-header-title {
  display: flex;
  align-items: center;
  gap: 8px;

  .title-icon {
    font-size: 18px;
    color: var(--color-primary);
  }
}

.config-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .config-icon {
    font-size: 16px;
    color: var(--color-primary);
  }
}
</style>
