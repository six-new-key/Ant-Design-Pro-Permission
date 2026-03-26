<template>
  <div :style="cssVars">
    <a-card :bordered="false">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <!-- 发送方式 -->
        <a-form-item label="发送方式">
          <a-segmented 
            v-model:value="sendMode" 
            :options="sendModeOptions"
            size="large"
          />
        </a-form-item>

        <!-- 邮件服务提供商 -->
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="邮件服务提供商">
              <DictSelect 
                v-model:value="formData.providerType" 
                :dict-type="DICT_TYPES.MAIL_PROVIDER"
                placeholder="请选择服务提供商（不选则使用默认）"
                allow-clear
              />
              <div class="form-tip">
                不选择则使用系统默认配置的服务提供商
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 默认模式 -->
        <template v-if="sendMode === 'default'">
          <a-row :gutter="24">
            <!-- 内容来源 -->
            <a-col :span="12">
              <a-form-item label="内容来源">
                <a-radio-group v-model:value="useTemplate" @change="handleUseTemplateChange">
                  <a-radio :value="false">直接输入</a-radio>
                  <a-radio :value="true">使用模板</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>

            <!-- 选择模板 -->
            <a-col :span="12" v-if="useTemplate">
              <a-form-item label="选择模板">
                <a-select 
                  v-model:value="formData.templateId" 
                  placeholder="请选择邮件模板"
                  @change="handleTemplateChange"
                >
                  <a-select-option 
                    v-for="template in templateList" 
                    :key="template.id" 
                    :value="template.id"
                  >
                    <div class="template-option">
                      <span>{{ template.templateName }}</span>
                      <a-tag size="small" :color="template.templateType === 2 ? 'blue' : 'default'">
                        {{ template.templateType === 2 ? 'HTML' : '文本' }}
                      </a-tag>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 收件人 -->
          <a-form-item label="收件人" name="recipients">
            <a-select
              v-model:value="formData.recipients"
              mode="tags"
              placeholder="请输入收件人邮箱，按回车添加多个"
              :token-separators="[',', ';', ' ']"
            >
              <template #suffixIcon>
                <UserOutlined />
              </template>
            </a-select>
            <div class="form-tip">
              支持输入多个邮箱，用逗号、分号或空格分隔
              <a-button type="link" size="small" @click="showUserSelect" class="link-button">
                从用户列表选择
              </a-button>
            </div>
          </a-form-item>

          <!-- 不使用模板：直接输入 -->
          <template v-if="!useTemplate">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="邮件类型">
                  <a-radio-group v-model:value="formData.mailType">
                    <a-radio value="html">HTML</a-radio>
                    <a-radio value="text">纯文本</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="邮件主题" name="subject">
                  <a-input 
                    v-model:value="formData.subject" 
                    placeholder="请输入邮件主题"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="邮件内容" name="content">
              <a-textarea 
                v-model:value="formData.content" 
                placeholder="请输入邮件内容"
                :rows="10"
                show-count
              />
            </a-form-item>
          </template>

          <!-- 使用模板：填写参数 -->
          <template v-if="useTemplate && currentTemplate">
            <a-form-item label="模板参数">
              <a-card size="small" :bordered="false" class="template-params-card">
                <div v-if="templateVariables.length > 0">
                  <a-row :gutter="16">
                    <a-col 
                      :span="12" 
                      v-for="variable in templateVariables" 
                      :key="variable.name"
                      class="template-param-col"
                    >
                      <div class="param-label">
                        {{ variable.description || variable.name }}
                      </div>
                      <a-input 
                        v-model:value="formData.templateParams[variable.name]" 
                        :placeholder="`请输入${variable.description || variable.name}`"
                      />
                    </a-col>
                  </a-row>
                </div>
                <a-empty v-else description="该模板无需参数" :image="simpleImage" />
              </a-card>
            </a-form-item>
          </template>
        </template>

        <!-- 个性化模式 -->
        <template v-if="sendMode === 'personalized'">
          <!-- 选择模板 -->
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="选择模板">
                <a-select 
                  v-model:value="formData.templateId" 
                  placeholder="请选择邮件模板"
                  @change="handleTemplateChange"
                >
                  <a-select-option 
                    v-for="template in templateList" 
                    :key="template.id" 
                    :value="template.id"
                  >
                    <div class="template-option">
                      <span>{{ template.templateName }}</span>
                      <a-tag size="small" :color="template.templateType === 2 ? 'blue' : 'default'">
                        {{ template.templateType === 2 ? 'HTML' : '文本' }}
                      </a-tag>
                    </div>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 收件人列表卡片 -->
          <a-card :bordered="false" v-if="currentTemplate" class="recipient-card">
            <template #title>
              <div class="table-header-actions">
                <!-- 左侧：操作按钮 -->
                <a-space :size="12">
                  <a-button type="primary" @click="addRecipient">
                    <template #icon><PlusOutlined /></template>
                    添加收件人
                  </a-button>
                  <a-button @click="showBatchImport">
                    <template #icon><ImportOutlined /></template>
                    批量导入
                  </a-button>
                </a-space>
                
                <!-- 右侧：工具按钮 -->
                <a-space :size="12">
                  <a-tooltip title="清空列表">
                    <a-button 
                      shape="circle" 
                      danger
                      :disabled="personalizedRecipients.length === 0"
                      @click="handleClearRecipients"
                    >
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-tooltip>
                </a-space>
              </div>
            </template>

            <!-- 收件人表格 -->
            <a-table
              :columns="recipientColumns"
              :data-source="personalizedRecipients"
              :pagination="false"
              :scroll="{ x: 'max-content' }"
              row-key="email"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'email'">
                  <a-input 
                    v-model:value="record.email" 
                    placeholder="请输入邮箱"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-tooltip title="删除">
                    <a-button 
                      type="link" 
                      danger 
                      size="small"
                      @click="removeRecipient(index)"
                    >
                      <template #icon><DeleteOutlined /></template>
                      删除
                    </a-button>
                  </a-tooltip>
                </template>
                <template v-else>
                  <!-- 动态变量列 -->
                  <a-input 
                    v-model:value="record.variables[column.key]" 
                    :placeholder="`请输入${column.title}`"
                  />
                </template>
              </template>

              <template #emptyText>
                <a-empty :image="simpleImage" description="暂无收件人">
                  <template #description>
                    <div class="empty-description">
                      <p class="empty-text">暂无收件人</p>
                      <p class="empty-hint">请点击"添加收件人"或"批量导入"添加</p>
                    </div>
                  </template>
                </a-empty>
              </template>
            </a-table>
          </a-card>
        </template>

        <!-- 操作按钮 -->
        <a-form-item>
          <a-space :size="12">
            <a-button 
              type="primary" 
              @click="handleSend" 
              :loading="sendLoading"
            >
              <template #icon><SendOutlined /></template>
              发送邮件
            </a-button>
            <a-button 
              v-if="(sendMode === 'default' && useTemplate && currentTemplate) || (sendMode === 'default' && !useTemplate && formData.mailType === 'html') || (sendMode === 'personalized' && currentTemplate)"
              @click="sendMode === 'personalized' ? handlePersonalizedPreview() : handlePreview()"
            >
              <template #icon><EyeOutlined /></template>
              预览邮件
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 预览抽屉 -->
    <a-drawer
      title="邮件预览"
      :width="800"
      :open="previewVisible"
      @close="previewVisible = false"
    >
      <div :style="cssVars" class="preview-content">
        <h3>邮件主题：</h3>
        <p>{{ previewData.subject }}</p>
        <h3>邮件内容：</h3>
        <div v-html="previewData.content"></div>
      </div>
    </a-drawer>

    <!-- 批量导入模态框 -->
    <a-modal
      :width="600"
      :open="batchImportVisible"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div class="drawer-header">
          <span class="drawer-title">批量导入收件人</span>
          <a-space :size="12">
            <a-button @click="batchImportVisible = false">取消</a-button>
            <a-button type="primary" @click="handleBatchImport">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-alert
          type="info"
          show-icon
          class="import-alert"
        >
          <template #message>导入格式说明</template>
          <template #description>
            <div>请按JSON格式输入，每个收件人一行。</div>
            <div class="batch-import-hint">
              当前模板需要的字段：
              <a-tag v-for="variable in templateVariables" :key="variable.name" size="small" class="variable-tag">
                {{ variable.description || variable.name }}
              </a-tag>
            </div>
          </template>
        </a-alert>
        <a-textarea
          v-model:value="batchImportData"
          placeholder="请输入JSON格式的收件人数据"
          :rows="12"
        />
      </div>
    </a-modal>

    <!-- 用户选择抽屉 -->
    <UserSelectDrawer 
      v-model:visible="userSelectVisible" 
      @confirm="handleUserSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { theme, Empty, Modal } from 'ant-design-vue'
import { DICT_TYPES } from '@/constants/dictTypes'
import { 
  SendOutlined, 
  ReloadOutlined, 
  UserOutlined, 
  PlusOutlined, 
  ImportOutlined, 
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import UserSelectDrawer from './UserSelectDrawer.vue'
import DictSelect from '@/components/custom/DictSelect.vue'
import {
  listAllEnabledTemplates,
  previewTemplate,
  sendMail
} from '@/api/mail'

// CSS 变量
const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-text-tertiary': t.colorTextTertiary,
    '--color-primary': t.colorPrimary,
    '--color-border': t.colorBorder,
    '--color-bg-container': t.colorBgContainer,
    '--color-fill-quaternary': t.colorFillQuaternary,
    '--border-radius': `${t.borderRadius}px`,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
  }
})

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

// 发送方式：default=默认, personalized=个性化
const sendMode = ref('default')
const sendModeOptions = [
  {
    label: '默认模式',
    value: 'default',
    icon: h(MailOutlined)
  },
  {
    label: '个性化模式',
    value: 'personalized',
    icon: h(TeamOutlined)
  }
]

// 是否使用模板（仅默认模式）
const useTemplate = ref(false)

// 模板列表
const templateList = ref([])
const currentTemplate = ref(null)
const templateVariables = ref([])

// 表单数据
const formRef = ref()
const formData = reactive({
  providerType: undefined,
  templateId: undefined,
  recipients: [],
  subject: '',
  content: '',
  mailType: 'html',
  templateParams: {}
})

const formRules = {
  recipients: [
    { required: true, message: '请输入收件人邮箱', trigger: 'change' },
    { 
      validator: (rule, value) => {
        if (!value || value.length === 0) {
          return Promise.reject('请输入收件人邮箱')
        }
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        for (const email of value) {
          if (!emailRegex.test(email)) {
            return Promise.reject(`邮箱格式不正确: ${email}`)
          }
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ],
  subject: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }]
}

const sendLoading = ref(false)

// 个性化收件人列表
const personalizedRecipients = ref([])
const recipientColumns = ref([])

// 批量导入
const batchImportVisible = ref(false)
const batchImportData = ref('')

// 用户选择
const userSelectVisible = ref(false)

// 显示用户选择抽屉
const showUserSelect = () => {
  userSelectVisible.value = true
}

// 处理用户选择
const handleUserSelect = (users) => {
  const emails = users.map(user => user.email).filter(email => email)
  formData.recipients = [...new Set([...formData.recipients, ...emails])]
}

// 预览
const previewVisible = ref(false)
const previewData = reactive({
  subject: '',
  content: ''
})

// 加载模板列表
const loadTemplates = async () => {
  try {
    const res = await listAllEnabledTemplates()
    if (res.code === 200) {
      templateList.value = res.data
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

// 使用模板变化
const handleUseTemplateChange = () => {
  if (!useTemplate.value) {
    // 取消使用模板，清空模板相关数据
    formData.templateId = undefined
    currentTemplate.value = null
    templateVariables.value = []
    formData.templateParams = {}
  }
}

// 模板变化
const handleTemplateChange = (templateId) => {
  const template = templateList.value.find(t => t.id === templateId)
  if (template) {
    currentTemplate.value = template
    
    // 解析变量
    try {
      templateVariables.value = template.variables ? JSON.parse(template.variables) : []
    } catch {
      templateVariables.value = []
    }
    
    // 重置模板参数
    formData.templateParams = {}
    
    // 如果是个性化模式，重新生成表格列
    if (sendMode.value === 'personalized') {
      generateRecipientColumns()
      // 清空收件人列表
      personalizedRecipients.value = []
    }
  }
}

// 生成个性化收件人表格列
const generateRecipientColumns = () => {
  const columns = [
    {
      title: '收件人邮箱',
      key: 'email',
      width: 200,
      fixed: 'left'
    }
  ]
  
  // 根据模板变量动态生成列
  templateVariables.value.forEach(variable => {
    columns.push({
      title: variable.description || variable.name,
      key: variable.name,
      width: 150
    })
  })
  
  columns.push({
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right'
  })
  
  recipientColumns.value = columns
}

// 添加收件人
const addRecipient = () => {
  const newRecipient = {
    email: '',
    variables: {}
  }
  
  // 初始化变量
  templateVariables.value.forEach(variable => {
    newRecipient.variables[variable.name] = ''
  })
  
  personalizedRecipients.value.push(newRecipient)
}

// 删除收件人
const removeRecipient = (index) => {
  personalizedRecipients.value.splice(index, 1)
}

// 清空收件人列表
const handleClearRecipients = () => {
  Modal.confirm({
    title: '确认清空',
    content: `确定要清空所有收件人吗？当前共 ${personalizedRecipients.value.length} 个收件人。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: () => {
      personalizedRecipients.value = []
      Message.success('已清空收件人列表')
    }
  })
}

// 显示批量导入
const showBatchImport = () => {
  // 根据当前模板生成示例JSON
  if (templateVariables.value.length > 0) {
    const example = [
      { email: 'user1@qq.com' },
      { email: 'user2@qq.com' }
    ]
    
    // 为每个示例添加模板变量
    templateVariables.value.forEach(variable => {
      example[0][variable.name] = `示例${variable.description || variable.name}1`
      example[1][variable.name] = `示例${variable.description || variable.name}2`
    })
    
    batchImportData.value = JSON.stringify(example, null, 2)
  } else {
    // 没有模板变量时，也要提供邮箱示例
    const example = [
      { email: 'user1@qq.com' },
      { email: 'user2@qq.com' }
    ]
    batchImportData.value = JSON.stringify(example, null, 2)
  }
  
  batchImportVisible.value = true
}

// 批量导入
const handleBatchImport = () => {
  try {
    const data = JSON.parse(batchImportData.value)
    
    if (!Array.isArray(data)) {
      Message.error('数据格式错误，必须是数组')
      return
    }
    
    // 验证数据格式
    for (const item of data) {
      if (!item.email) {
        Message.error('每个收件人必须包含email字段')
        return
      }
    }
    
    // 转换数据格式
    const newRecipients = data.map(item => {
      const { email, ...rest } = item
      return {
        email,
        variables: rest
      }
    })
    
    personalizedRecipients.value = newRecipients
    batchImportVisible.value = false
    Message.success(`成功导入 ${newRecipients.length} 个收件人`)
  } catch (error) {
    Message.error('JSON格式错误，请检查输入')
  }
}

// 预览
const handlePreview = async () => {
  if (sendMode.value === 'default' && !useTemplate.value) {
    // 默认模式-不使用模板：直接显示用户输入的内容
    if (!formData.subject) {
      Message.warning('请先输入邮件主题')
      return
    }
    if (!formData.content) {
      Message.warning('请先输入邮件内容')
      return
    }
    
    previewData.subject = formData.subject
    previewData.content = formData.content
    previewVisible.value = true
    
  } else if (sendMode.value === 'default' && useTemplate.value) {
    // 默认模式-使用模板：调用后端预览接口
    if (!currentTemplate.value) {
      Message.warning('请先选择模板')
      return
    }
    
    try {
      const res = await previewTemplate(currentTemplate.value.id, formData.templateParams)
      if (res.code === 200) {
        previewData.subject = res.data.subject
        previewData.content = res.data.content
        previewVisible.value = true
      }
    } catch (error) {
      console.error('预览失败:', error)
    }
  }
}

// 个性化模式预览
const handlePersonalizedPreview = async () => {
  if (!currentTemplate.value) {
    Message.warning('请先选择模板')
    return
  }
  
  // 使用空参数预览模板（显示原始模板内容）
  try {
    const res = await previewTemplate(currentTemplate.value.id, {})
    if (res.code === 200) {
      previewData.subject = res.data.subject
      previewData.content = res.data.content
      previewVisible.value = true
    }
  } catch (error) {
    console.error('预览失败:', error)
  }
}

// 发送
const handleSend = async () => {
  try {
    await formRef.value.validate()
    
    // 构建发送数据
    const sendData = {}
    
    if (sendMode.value === 'personalized') {
      // 个性化模式
      if (!formData.templateId) {
        Message.warning('请选择邮件模板')
        return
      }
      
      if (personalizedRecipients.value.length === 0) {
        Message.warning('请至少添加一个收件人')
        return
      }
      
      // 验证邮箱格式
      const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
      for (const recipient of personalizedRecipients.value) {
        if (!recipient.email) {
          Message.error('请填写所有收件人的邮箱')
          return
        }
        if (!emailRegex.test(recipient.email)) {
          Message.error(`邮箱格式不正确: ${recipient.email}`)
          return
        }
      }
      
      // 根据templateId查找templateCode
      const template = templateList.value.find(t => t.id === formData.templateId)
      if (!template) {
        Message.error('模板不存在')
        return
      }
      
      sendData.templateCode = template.templateCode
      sendData.recipientList = personalizedRecipients.value
      sendData.providerType = formData.providerType
      
    } else {
      // 默认模式
      if (useTemplate.value) {
        // 使用模板
        if (!formData.templateId) {
          Message.warning('请选择邮件模板')
          return
        }
        
        // 根据templateId查找templateCode
        const template = templateList.value.find(t => t.id === formData.templateId)
        if (!template) {
          Message.error('模板不存在')
          return
        }
        
        sendData.templateCode = template.templateCode
        sendData.recipients = formData.recipients
        sendData.variables = formData.templateParams
        sendData.providerType = formData.providerType
        
      } else {
        // 不使用模板（临时邮件）
        sendData.recipients = formData.recipients
        sendData.subject = formData.subject
        sendData.content = formData.content
        sendData.isHtml = formData.mailType === 'html'
        sendData.providerType = formData.providerType
      }
    }
    
    sendLoading.value = true
    
    // 调用发送接口
    const res = await sendMail(sendData)
    
    if (res.code === 200) {
      if (sendMode.value === 'personalized') {
        Message.success(`个性化邮件发送任务已提交，共 ${personalizedRecipients.value.length} 个收件人`)
      } else if (formData.recipients.length === 1) {
        Message.success('邮件发送任务已提交')
      } else {
        Message.success(`批量发送任务已提交，共 ${formData.recipients.length} 个收件人`)
      }
      handleReset()
    }
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    sendLoading.value = false
  }
}

// 重置
const handleReset = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    providerType: undefined,
    templateId: undefined,
    recipients: [],
    subject: '',
    content: '',
    mailType: 'html',
    templateParams: {}
  })
  sendMode.value = 'default'
  useTemplate.value = false
  currentTemplate.value = null
  templateVariables.value = []
  personalizedRecipients.value = []
  recipientColumns.value = []
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
.template-params-card {
  background: var(--color-bg-container);
}

.empty-description {
  color: var(--color-text-secondary);
}

.empty-text {
  margin: 0;
}

.empty-hint {
  margin: 4px 0 0 0;
  font-size: 12px;
}

.batch-import-hint {
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.mode-description {
  margin-top: 32px;
  padding: 12px 16px;
  background: var(--color-fill-quaternary);
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.form-tip {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  margin-top: 4px;
}

.link-button {
  padding: 0;
  margin-left: 8px;
}

.template-option {
  display: flex;
  justify-content: space-between;
}

.template-param-col {
  margin-bottom: 16px;
}

.param-label {
  margin-bottom: 4px;
  font-weight: 500;
}

.recipient-card {
  margin-bottom: 24px;
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

.import-alert {
  margin-bottom: 16px;
}

.variable-tag {
  margin: 2px;
}

.preview-content {
  h3 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.ant-radio-button-wrapper) {
  .anticon {
    margin-right: 6px;
  }
}
</style>
