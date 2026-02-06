<template>
  <div :style="cssVars" class="system-config-container">
    <!-- 配置管理卡片 -->
    <a-card :bordered="false" title="系统配置管理" class="config-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增配置
          </a-button>
          <a-button @click="handleRefreshCache" :loading="refreshLoading">
            <template #icon><SyncOutlined /></template>
            刷新缓存
          </a-button>
        </a-space>
      </template>

      <!-- 配置分组展示 -->
      <a-collapse v-model:activeKey="activeKeys" class="config-collapse" ghost>
      <a-collapse-panel 
        v-for="group in configGroups" 
        :key="group.code"
        :header="`${group.name} (${group.configs.length})`">
        
        <a-table 
          :dataSource="group.configs" 
          :columns="columns" 
          :pagination="false"
          :loading="loading"
          row-key="id"
          :scroll="{ x: 1600 }">
          
          <template #bodyCell="{ column, record }">
            <!-- ID -->
            <template v-if="column.key === 'id'">
              <span>{{ record.id }}</span>
            </template>

            <!-- 配置名称 -->
            <template v-if="column.key === 'configName'">
              <div class="config-name">
                <span>{{ record.configName }}</span>
              </div>
            </template>

            <!-- 配置键 -->
            <template v-if="column.key === 'configKey'">
              <a-tag color="blue">{{ record.configKey }}</a-tag>
            </template>

            <!-- 配置类型 -->
            <template v-if="column.key === 'configType'">
              <a-tag :color="getTypeColor(record.configType)">
                {{ getTypeLabel(record.configType) }}
              </a-tag>
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
              
              <!-- 数字类型 -->
              <span v-else-if="record.configType === 'number'" class="config-value">
                {{ record.configValue }} <span class="unit">{{ getUnit(record.configKey) }}</span>
              </span>
              
              <!-- 文本类型 -->
              <span v-else class="config-value">{{ record.configValue }}</span>
            </template>

            <!-- 默认值 -->
            <template v-if="column.key === 'defaultValue'">
              <span v-if="record.defaultValue" class="default-value">
                {{ record.defaultValue }}
                <span v-if="record.configType === 'number'" class="unit">{{ getUnit(record.configKey) }}</span>
              </span>
              <span v-else class="empty-text">-</span>
            </template>

            <!-- 配置说明 -->
            <template v-if="column.key === 'configDesc'">
              <a-tooltip v-if="record.configDesc" :title="record.configDesc">
                <span class="config-desc-text">{{ record.configDesc }}</span>
              </a-tooltip>
              <span v-else class="empty-text">-</span>
            </template>

            <!-- 排序 -->
            <template v-if="column.key === 'sortOrder'">
              <a-tag color="purple">{{ record.sortOrder }}</a-tag>
            </template>

            <!-- 系统内置 -->
            <template v-if="column.key === 'isSystem'">
              <a-tag v-if="record.isSystem" color="blue">是</a-tag>
              <a-tag v-else color="default">否</a-tag>
            </template>

            <!-- 创建时间 -->
            <template v-if="column.key === 'createTime'">
              <span class="time-text">{{ record.createTime }}</span>
            </template>

            <!-- 更新时间 -->
            <template v-if="column.key === 'updateTime'">
              <span class="time-text">{{ record.updateTime }}</span>
            </template>

            <!-- 操作 -->
            <template v-if="column.key === 'operation'">
              <a-space>
                <a-button 
                  v-if="record.configType !== 'boolean'" 
                  type="link" 
                  size="small" 
                  @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button 
                  v-if="!record.isSystem"
                  type="link" 
                  size="small" 
                  danger
                  @click="handleDelete(record)">
                  删除
                </a-button>
                <span v-if="record.configType === 'boolean' || record.isSystem" class="empty-text">-</span>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
    </a-card>

    <!-- 新增配置弹窗 -->
    <a-modal 
      v-model:open="addDialogVisible" 
      title="新增配置" 
      width="650px"
      centered
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
      :confirmLoading="submitLoading">
      <a-form 
        ref="addFormRef" 
        layout="vertical"
        :model="addForm" 
        :rules="addFormRules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        class="add-form"
        >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="配置键" name="configKey">
              <a-input 
                v-model:value="addForm.configKey" 
                placeholder="如：new_config_key"
                style="width: 250px" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配置名称" name="configName">
              <a-input 
                v-model:value="addForm.configName" 
                placeholder="请输入配置名称"
                style="width: 250px" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="配置类型" name="configType">
              <a-select 
                v-model:value="addForm.configType" 
                placeholder="请选择配置类型"
                style="width: 250px">
                <a-select-option value="boolean">布尔型（开关）</a-select-option>
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配置分组" name="configGroup">
              <a-select 
                v-model:value="addForm.configGroup" 
                placeholder="请选择配置分组"
                style="width: 250px">
                <a-select-option value="security">安全防护</a-select-option>
                <a-select-option value="login">登录控制</a-select-option>
                <a-select-option value="rate_limit">限流控制</a-select-option>
                <a-select-option value="ip_blacklist">IP黑名单</a-select-option>
                <a-select-option value="business">业务参数</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="配置值" name="configValue">
              <a-input 
                v-if="addForm.configType === 'string'"
                v-model:value="addForm.configValue" 
                placeholder="请输入配置值"
                style="width: 250px" />
              <a-input-number 
                v-else-if="addForm.configType === 'number'"
                v-model:value="addForm.configValue" 
                placeholder="请输入配置值"
                style="width: 250px" />
              <a-select 
                v-else-if="addForm.configType === 'boolean'"
                v-model:value="addForm.configValue" 
                placeholder="请选择"
                style="width: 250px">
                <a-select-option value="true">启用</a-select-option>
                <a-select-option value="false">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="默认值" name="defaultValue">
              <a-input 
                v-model:value="addForm.defaultValue" 
                placeholder="请输入默认值（可选）"
                style="width: 250px" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number 
                v-model:value="addForm.sortOrder" 
                placeholder="数字越小越靠前"
                :min="0"
                style="width: 250px" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="系统内置" name="isSystem">
              <a-switch 
                v-model:checked="addForm.isSystem"
                checked-children="是"
                un-checked-children="否"
                style="width: 60px" />
              <span style="margin-left: 8px; color: var(--color-text-tertiary); font-size: 12px">
                系统内置配置不可删除
              </span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="配置描述" name="configDesc" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-textarea 
                v-model:value="addForm.configDesc" 
                placeholder="请输入配置描述（可选）"
                :rows="2"
                style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 编辑配置弹窗 -->
    <a-modal 
      v-model:open="editDialogVisible" 
      :title="`编辑配置：${currentConfig?.configName}`" 
      width="400px"
      centered
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
      :confirmLoading="editSubmitLoading">
      <a-form 
        ref="editFormRef" 
        :model="editForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        class="edit-form"
        layout="vertical"
        >
        <a-form-item label="配置值" name="value">
          <a-input 
            v-if="currentConfig?.configType === 'string'"
            v-model:value="editForm.value" 
            placeholder="请输入配置值"
            style="width: 280px" />
          <a-input-number 
            v-else-if="currentConfig?.configType === 'number'"
            v-model:value="editForm.value" 
            placeholder="请输入配置值"
            style="width: 280px" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import {
  PlusOutlined,
  SyncOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useConfigList } from './composables/useConfigList'
import { useConfigForm } from './composables/useConfigForm'
import { useConfigOperations } from './composables/useConfigOperations'
import './styles/config.scss'

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
    '--color-text-tertiary': t.colorTextTertiary || '#999',
    '--color-text-quaternary': t.colorTextQuaternary || '#d9d9d9',
  }
})

// 折叠面板激活的key（默认不展开）
const activeKeys = ref([])

// 配置列表管理
const { loading, configGroups, loadConfigList, getUnit } = useConfigList()

// 配置表单管理
const {
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
  editFormRef,
  currentConfig,
  handleEdit,
  handleEditCancel
} = useConfigForm(loadConfigList)

// 配置操作管理
const {
  refreshLoading,
  submitLoading: editSubmitLoading,
  handleConfigChange,
  handleEditSubmit: onEditSubmit,
  handleDelete,
  handleRefreshCache
} = useConfigOperations(loadConfigList)

// 编辑提交
const handleEditSubmit = async () => {
  await onEditSubmit(currentConfig.value, editForm, handleEditCancel)
}

// ==================== 表格列配置 ====================
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '配置名称',
    dataIndex: 'configName',
    key: 'configName',
    width: 180,
    fixed: 'left',
    ellipsis: true
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
    width: 100,
    align: 'center'
  },
  {
    title: '当前值',
    key: 'configValue',
    width: 150,
    align: 'center'
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue',
    width: 120,
    align: 'center',
    ellipsis: true
  },
  {
    title: '配置说明',
    dataIndex: 'configDesc',
    key: 'configDesc',
    width: 250,
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 70,
    align: 'center'
  },
  {
    title: '系统内置',
    dataIndex: 'isSystem',
    key: 'isSystem',
    width: 90,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 160
  },
  {
    title: '操作',
    key: 'operation',
    width: 120,
    align: 'center',
    fixed: 'right'
  }
]

/**
 * 获取配置类型颜色
 */
const getTypeColor = (type) => {
  const colorMap = {
    'boolean': 'green',
    'number': 'orange',
    'string': 'blue'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取配置类型标签
 */
const getTypeLabel = (type) => {
  const labelMap = {
    'boolean': '布尔型',
    'number': '数字',
    'string': '字符串'
  }
  return labelMap[type] || type
}

onMounted(() => {
  loadConfigList()
})
</script>