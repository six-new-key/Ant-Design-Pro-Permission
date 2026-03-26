<template>
  <div class="config-management" :style="cssVars">
    <!-- 操作栏 -->
    <a-card :bordered="false" class="action-card">
      <a-space :size="12">
        <a-button type="primary" @click="handleAdd" v-permission.disable="'system:config:add'">
          <template #icon><PlusOutlined /></template>
          新增配置
        </a-button>
        <a-button @click="handleRefreshCache" :loading="refreshLoading" v-permission.disable="'system:config:refresh_cache'">
          <template #icon><SyncOutlined /></template>
          刷新缓存
        </a-button>
        <a-button v-if="filterFeatureCode" @click="handleResetFilter">
          <template #icon><CloseCircleOutlined /></template>
          重置过滤
        </a-button>
      </a-space>
    </a-card>

    <!-- 分组折叠面板 -->
    <a-collapse v-model:activeKey="activeKeys" class="config-collapse" :bordered="false">
      <a-collapse-panel 
        v-for="group in filteredTreeData" 
        :key="group.groupCode">
        <template #header>
          <div class="collapse-header">
            <span class="group-name">{{ group.groupName }}</span>
            <span class="group-desc">{{ group.groupDesc || '' }}</span>
          </div>
        </template>
        
        <!-- 功能列表 -->
        <div class="features-container">
          <div 
            v-for="feature in group.features" 
            :key="feature.featureCode" 
            :id="`feature-${feature.featureCode}`"
            class="feature-item"
            :class="{ 'highlight-feature': filterFeatureCode === feature.featureCode }">
            <!-- 功能头部 -->
            <div class="feature-header">
              <div class="feature-info">
                <span class="feature-name">{{ feature.featureName }}</span>
                <span class="feature-desc">{{ feature.featureDesc }}</span>
              </div>
              <a-switch 
                :checked="feature.enabled === 1" 
                @change="() => handleFeatureToggle(feature)"
                checked-children="启用" 
                un-checked-children="禁用" />
            </div>

            <!-- 配置表格 -->
            <div class="config-table-wrapper">
              <a-table 
                v-if="feature.configs && feature.configs.length > 0"
                :dataSource="feature.configs" 
                :columns="columns" 
                :pagination="false"
                :loading="loading"
                :class="{ 'disabled-table': feature.enabled !== 1 }"
                row-key="id"
                size="middle"
                :scroll="{ x: 'max-content' }"
                class="config-table">
                
                <template #bodyCell="{ column, record }">
                  <!-- 配置名称 -->
                  <template v-if="column.key === 'configName'">
                    <div class="config-name-cell">
                      <div class="name">{{ record.configName }}</div>
                      <div class="key">{{ record.configKey }}</div>
                    </div>
                  </template>

                  <!-- 配置类型 -->
                  <template v-if="column.key === 'configType'">
                    <a-tag :color="getTypeColor(record.configType)">
                      {{ getTypeLabel(record.configType) }}
                    </a-tag>
                  </template>

                  <!-- 当前值 -->
                  <template v-if="column.key === 'configValue'">
                    <div class="config-value-cell">
                      <span v-if="record.configType === 'number'">
                        {{ record.configValue }}
                        <span v-if="record.configMeta?.unit" class="unit">{{ record.configMeta.unit }}</span>
                      </span>
                      <span v-else-if="record.configType === 'select'">
                        {{ getSelectLabel(record) }}
                      </span>
                      <span v-else>{{ record.configValue }}</span>
                    </div>
                  </template>

                  <!-- 默认值 -->
                  <template v-if="column.key === 'defaultValue'">
                    <span class="default-value">{{ record.defaultValue || '-' }}</span>
                  </template>

                  <!-- 系统内置 -->
                  <template v-if="column.key === 'isSystem'">
                    <a-tag :color="record.isSystem ? 'blue' : 'default'">
                      {{ record.isSystem ? '是' : '否' }}
                    </a-tag>
                  </template>

                  <!-- 排序 -->
                  <template v-if="column.key === 'sortOrder'">
                    <a-tag color="purple">{{ record.sortOrder }}</a-tag>
                  </template>

                  <!-- 描述 -->
                  <template v-if="column.key === 'configDesc'">
                    <span class="config-desc">{{ record.configDesc }}</span>
                  </template>

                  <!-- 操作 -->
                  <template v-if="column.key === 'action'">
                    <a-space :size="8">
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="handleEdit(record)"
                        :disabled="feature.enabled !== 1" v-permission.disable="'system:config:update'">
                        <template #icon><EditOutlined /></template>
                        编辑
                      </a-button>
                      <a-popconfirm 
                        title="确认删除吗？" 
                        @confirm="handleDelete(record)"
                        :disabled="feature.enabled !== 1 || record.isSystem">
                        <a-button 
                          type="link" 
                          size="small" 
                          danger
                          :disabled="feature.enabled !== 1 || record.isSystem" v-permission.disable="'system:config:remove'">
                          <template #icon><DeleteOutlined /></template>
                          删除
                        </a-button>
                      </a-popconfirm>
                    </a-space>
                  </template>
                </template>
              </a-table>

              <!-- 无配置提示 -->
              <a-empty v-else description="暂无配置项" :image="simpleImage" class="empty-placeholder" />
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <!-- 新增/编辑配置抽屉 -->
    <a-drawer
      v-model:open="dialogVisible"
      width="600"
      placement="right"
      :closable="false"
      :body-style="{ paddingBottom: '24px' }">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ dialogTitle }}</span>
          <a-space :size="12">
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</a-button>
          </a-space>
        </div>
      </template>
      
      <a-form 
        ref="formRef" 
        layout="vertical"
        :model="form" 
        :rules="formRules"
        :style="cssVars"
        class="config-form">
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="configKey">
              <template #label>
                <span>配置键</span>
                <a-tooltip title="配置键用于后端读取配置，新增后需在 SystemCacheConstant 类中定义常量" placement="top">
                  <QuestionCircleOutlined style="margin-left: 4px; color: #999; cursor: help;" />
                </a-tooltip>
              </template>
              <a-input v-model:value="form.configKey" placeholder="如：new_config_key" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配置名称" name="configName">
              <a-input v-model:value="form.configName" placeholder="请输入配置名称" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配置类型" name="configType">
              <a-select v-model:value="form.configType" placeholder="请选择配置类型">
                <a-select-option v-for="opt in CONFIG_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属功能" name="featureCode">
              <a-select v-model:value="form.featureCode" placeholder="请选择所属功能">
                <a-select-option v-for="feature in featureList" :key="feature.featureCode" :value="feature.featureCode">
                  {{ feature.featureName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配置值" name="configValue">
              <DynamicConfigInput 
                v-model="form.configValue"
                :type="form.configType"
                :meta="form.configMeta" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="默认值" name="defaultValue">
              <DynamicConfigInput 
                v-model="form.defaultValue"
                :type="form.configType"
                :meta="form.configMeta" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="form.sortOrder" placeholder="数字越小越靠前" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="系统内置" name="isSystem">
              <DictRadio 
                v-model:value="form.isSystem" 
                dict-type="yes_no" 
                value-type="number"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="配置描述" name="configDesc">
              <a-textarea v-model:value="form.configDesc" placeholder="请输入配置描述（可选）" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 元数据配置区域 -->
        <a-divider style="margin: 16px 0">元数据配置（可选）</a-divider>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="输入提示文本">
              <a-input v-model:value="form.configMeta.placeholder" placeholder='例如：请输入配置值' />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 数字类型元数据 -->
        <template v-if="form.configType === CONFIG_TYPES.NUMBER">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="最小值">
                <a-input-number v-model:value="form.configMeta.min" placeholder="最小值" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="最大值">
                <a-input-number v-model:value="form.configMeta.max" placeholder="最大值" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="单位">
                <a-input v-model:value="form.configMeta.unit" placeholder="如：分钟、次" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </template>

        <!-- 长文本类型元数据 -->
        <template v-if="form.configType === CONFIG_TYPES.TEXT">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="文本行数">
                <a-input-number v-model:value="form.configMeta.rows" :min="2" :max="20" placeholder="默认4行" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </template>

        <!-- 下拉选择类型元数据 -->
        <template v-if="form.configType === CONFIG_TYPES.SELECT">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="选择模式">
                <DictSelect 
                  v-model:value="form.configMeta.mode" 
                  dict-type="config_select_mode" 
                  placeholder="请选择"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="选项配置">
                <div v-for="(opt, index) in form.configMeta.options" :key="index" class="option-item">
                  <a-space style="width: 100%">
                    <a-input v-model:value="opt.label" placeholder="显示文本" style="width: 200px" />
                    <a-input v-model:value="opt.value" placeholder="实际值" style="width: 200px" />
                    <a-button type="link" danger @click="form.configMeta.options.splice(index, 1)">删除</a-button>
                  </a-space>
                </div>
                <a-button type="dashed" block @click="form.configMeta.options.push({ label: '', value: '' })">
                  + 添加选项
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </template>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue'
import { theme } from 'ant-design-vue'
import { PlusOutlined, SyncOutlined, CloseCircleOutlined, QuestionCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import { useSystemConfigRefactor } from '../composables/useSystemConfigRefactor'
import { useConfigForm } from '../composables/useConfigForm'
import { useConfigOperations } from '../composables/useConfigOperations'
import { CONFIG_TYPES, CONFIG_TYPE_OPTIONS, CONFIG_TYPE_COLORS, CONFIG_TYPE_LABELS } from '../constants/configTypes'
import DynamicConfigInput from './DynamicConfigInput.vue'

const { token } = theme.useToken()

// CSS 变量映射
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-text-tertiary': t.colorTextTertiary,
    '--color-primary': t.colorPrimary,
    '--color-primary-bg': t.colorPrimaryBg,
    '--color-primary-border': t.colorPrimaryBorder,
    '--color-border': t.colorBorder,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
    '--color-bg-container': t.colorBgContainer
  }
})

// 定义 props 和 emit
const props = defineProps({
  filterFeatureCode: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['reset-filter'])

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const {
  loading,
  activeKeys,
  treeData,
  featureList,
  loadData,
  handleFeatureToggle
} = useSystemConfigRefactor()

// 监听外部传入的过滤参数，自动展开对应分组
watch(() => props.filterFeatureCode, (newVal) => {
  if (newVal && treeData.value.length > 0) {
    // 找到包含该功能的分组
    const targetGroup = treeData.value.find(group => 
      group.features.some(f => f.featureCode === newVal)
    )
    if (targetGroup) {
      activeKeys.value = [targetGroup.groupCode]
      // 滚动到对应位置（延迟执行，等待 DOM 更新）
      setTimeout(() => {
        const element = document.getElementById(`feature-${newVal}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }
}, { immediate: true })

// 过滤后的树形数据
const filteredTreeData = computed(() => {
  if (!props.filterFeatureCode) return treeData.value
  
  return treeData.value.map(group => ({
    ...group,
    features: group.features.filter(f => f.featureCode === props.filterFeatureCode)
  })).filter(group => group.features.length > 0)
})

// 重置过滤
const handleResetFilter = () => {
  emit('reset-filter')
}

const {
  addDialogVisible,
  addForm,
  addFormRules,
  addFormRef,
  submitLoading: addSubmitLoading,
  handleAdd: openAddDialog,
  handleAddCancel,
  handleAddSubmit,
  editDialogVisible,
  editForm,
  editFormRules,
  editFormRef,
  editSubmitLoading,
  handleEdit: openEditDialog,
  handleEditCancel,
  handleEditSubmit,
  handleDelete
} = useConfigForm(loadData)

const {
  refreshLoading,
  handleRefreshCache
} = useConfigOperations(loadData)

// 统一的对话框状态
const dialogVisible = computed({
  get: () => addDialogVisible.value || editDialogVisible.value,
  set: (val) => {
    addDialogVisible.value = val
    editDialogVisible.value = val
  }
})

const dialogTitle = computed(() => addDialogVisible.value ? '新增配置' : '编辑配置')
const formRef = computed(() => addDialogVisible.value ? addFormRef.value : editFormRef.value)
const form = computed(() => addDialogVisible.value ? addForm : editForm)
const formRules = computed(() => addDialogVisible.value ? addFormRules : editFormRules)
const submitLoading = computed(() => addDialogVisible.value ? addSubmitLoading.value : editSubmitLoading.value)

const handleAdd = () => {
  openAddDialog()
}

const handleEdit = (record) => {
  openEditDialog(record)
}

const handleCancel = () => {
  if (addDialogVisible.value) {
    handleAddCancel()
  } else {
    handleEditCancel()
  }
}

const handleSubmit = async () => {
  if (addDialogVisible.value) {
    await handleAddSubmit()
  } else {
    await handleEditSubmit()
  }
}

const columns = [
  {
    title: '配置名称',
    key: 'configName',
    width: 180
  },
  {
    title: '类型',
    key: 'configType',
    width: 90
  },
  {
    title: '当前值',
    key: 'configValue',
    width: 150
  },
  {
    title: '默认值',
    key: 'defaultValue',
    width: 120
  },
  {
    title: '系统内置',
    key: 'isSystem',
    width: 100,
    align: 'center'
  },
  {
    title: '排序',
    key: 'sortOrder',
    width: 80,
    align: 'center'
  },
  {
    title: '描述',
    key: 'configDesc',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

const getTypeColor = (type) => CONFIG_TYPE_COLORS[type] || 'default'
const getTypeLabel = (type) => CONFIG_TYPE_LABELS[type] || type

const getSelectLabel = (record) => {
  if (!record.configMeta?.options) return record.configValue
  const option = record.configMeta.options.find(opt => opt.value === record.configValue)
  return option ? option.label : record.configValue
}

onMounted(() => {
  loadData()
})
</script>


<style lang="scss" scoped>
.config-management {
  .action-card {
    margin-bottom: 16px;
  }

  .config-collapse {
    background: var(--color-bg-container);
    border-radius: var(--border-radius);
    
    :deep(.ant-collapse-item) {
      border-bottom: 1px solid var(--color-border-secondary);
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    :deep(.ant-collapse-header) {
      padding: 16px 24px !important;
      font-weight: 500;
    }
    
    :deep(.ant-collapse-content-box) {
      padding: 0 24px 24px 24px !important;
    }
  }

  .collapse-header {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .group-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text);
    }
    
    .group-desc {
      color: var(--color-text-secondary);
    }
  }

  .features-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .feature-item {
    background: var(--color-fill-alter);
    border-radius: var(--border-radius);
    padding: 16px;
    transition: all 0.3s;

    &.highlight-feature {
      background: var(--color-primary-bg);
      border: 1px solid var(--color-primary-border);
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-secondary);

      .feature-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .feature-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
        }

        .feature-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
        }
      }
    }

    .config-table-wrapper {
      background: var(--color-bg-container);
      border-radius: var(--border-radius);
      overflow: hidden;
    }

    .config-table {
      :deep(.ant-table) {
        background: transparent;
      }

      :deep(.ant-table-thead > tr > th) {
        background: var(--color-fill-alter);
        font-weight: 600;
        padding: 12px 16px;
      }

      :deep(.ant-table-tbody > tr > td) {
        padding: 12px 16px;
      }

      &.disabled-table {
        opacity: 0.6;
        pointer-events: none;
      }

      .config-name-cell {
        .name {
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 4px;
        }

        .key {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }

      .config-value-cell {
        .unit {
          margin-left: 4px;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }

      .default-value {
        color: var(--color-text-secondary);
      }

      .config-desc {
        color: var(--color-text-tertiary);
      }
    }

    .empty-placeholder {
      padding: 32px 0;
    }
  }
}

.config-form {
  .option-item {
    margin-bottom: 8px;
  }
}
</style>
