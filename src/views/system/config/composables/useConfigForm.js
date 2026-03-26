import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { addSystemConfig, updateSystemConfig } from '@/api/systemConfig'

/**
 * 配置表单管理 Composable
 */
export function useConfigForm(loadData) {
  // 新增配置
  const addDialogVisible = ref(false)
  const addFormRef = ref()
  const addForm = reactive({
    featureCode: null,
    configKey: '',
    configName: '',
    configType: 'string',
    configValue: '',
    defaultValue: '',
    sortOrder: 0,
    isSystem: 0, // 改为数字
    configDesc: '',
    configMeta: {
      placeholder: '',
      min: undefined,
      max: undefined,
      unit: '',
      rows: 4,
      mode: 'single',
      options: []
    }
  })

  const addFormRules = {
    featureCode: [{ required: true, message: '请选择所属功能', trigger: 'change' }],
    configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
    configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
  }

  const submitLoading = ref(false)

  // 打开新增对话框
  const handleAdd = () => {
    addDialogVisible.value = true
    // 重置表单
    Object.assign(addForm, {
      featureCode: null,
      configKey: '',
      configName: '',
      configType: 'string',
      configValue: '',
      defaultValue: '',
      sortOrder: 0,
      isSystem: 0, // 改为数字
      configDesc: '',
      configMeta: {
        placeholder: '',
        min: undefined,
        max: undefined,
        unit: '',
        rows: 4,
        mode: 'single',
        options: []
      }
    })
  }

  // 取消新增
  const handleAddCancel = () => {
    addDialogVisible.value = false
    addFormRef.value?.resetFields()
  }

  // 提交新增
  const handleAddSubmit = async () => {
    try {
      await addFormRef.value?.validate()
      submitLoading.value = true

      // 清理元数据（移除空值）
      const cleanMeta = {}
      Object.keys(addForm.configMeta).forEach(key => {
        const value = addForm.configMeta[key]
        if (value !== '' && value !== undefined && value !== null) {
          if (key === 'options' && Array.isArray(value)) {
            // 过滤掉空选项
            const validOptions = value.filter(opt => opt.label && opt.value)
            if (validOptions.length > 0) {
              cleanMeta[key] = validOptions
            }
          } else {
            cleanMeta[key] = value
          }
        }
      })

      const data = {
        featureCode: addForm.featureCode,
        configKey: addForm.configKey,
        configName: addForm.configName,
        configType: addForm.configType,
        configValue: String(addForm.configValue),
        defaultValue: addForm.defaultValue ? String(addForm.defaultValue) : '',
        sortOrder: addForm.sortOrder,
        isSystem: addForm.isSystem,
        configDesc: addForm.configDesc,
        configMeta: Object.keys(cleanMeta).length > 0 ? cleanMeta : null
      }

      await addSystemConfig(data)
      message.success('新增配置成功')
      addDialogVisible.value = false
      await loadData()
    } catch (error) {
      console.error('新增配置失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      submitLoading.value = false
    }
  }

  // 编辑配置
  const editDialogVisible = ref(false)
  const editFormRef = ref()
  const editForm = reactive({
    featureCode: null,
    configKey: '',
    configName: '',
    configType: 'string',
    configValue: '',
    defaultValue: '',
    sortOrder: 0,
    isSystem: 0, // 改为数字
    configDesc: '',
    configMeta: {
      placeholder: '',
      min: undefined,
      max: undefined,
      unit: '',
      rows: 4,
      mode: 'single',
      options: []
    }
  })

  const editFormRules = {
    featureCode: [{ required: true, message: '请选择所属功能', trigger: 'change' }],
    configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
    configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
  }

  const currentConfig = ref(null)
  const editSubmitLoading = ref(false)

  // 打开编辑对话框
  const handleEdit = (record) => {
    currentConfig.value = record
    
    // 填充表单数据
    Object.assign(editForm, {
      featureCode: record.featureCode || null,
      configKey: record.configKey,
      configName: record.configName,
      configType: record.configType,
      configValue: record.configValue,
      defaultValue: record.defaultValue || '',
      sortOrder: record.sortOrder,
      isSystem: record.isSystem,
      configDesc: record.configDesc || '',
      configMeta: {
        placeholder: record.configMeta?.placeholder || '',
        min: record.configMeta?.min,
        max: record.configMeta?.max,
        unit: record.configMeta?.unit || '',
        rows: record.configMeta?.rows || 4,
        mode: record.configMeta?.mode || 'single',
        options: record.configMeta?.options || []
      }
    })

    editDialogVisible.value = true
  }

  // 取消编辑
  const handleEditCancel = () => {
    editDialogVisible.value = false
    editFormRef.value?.resetFields()
    currentConfig.value = null
  }

  // 提交编辑
  const handleEditSubmit = async () => {
    try {
      await editFormRef.value?.validate()
      editSubmitLoading.value = true

      // 清理元数据（移除空值）
      const cleanMeta = {}
      Object.keys(editForm.configMeta).forEach(key => {
        const value = editForm.configMeta[key]
        if (value !== '' && value !== undefined && value !== null) {
          if (key === 'options' && Array.isArray(value)) {
            // 过滤掉空选项
            const validOptions = value.filter(opt => opt.label && opt.value)
            if (validOptions.length > 0) {
              cleanMeta[key] = validOptions
            }
          } else {
            cleanMeta[key] = value
          }
        }
      })

      const data = {
        featureCode: editForm.featureCode,
        configKey: editForm.configKey,
        configName: editForm.configName,
        configType: editForm.configType,
        configValue: String(editForm.configValue),
        defaultValue: editForm.defaultValue ? String(editForm.defaultValue) : '',
        sortOrder: editForm.sortOrder,
        isSystem: editForm.isSystem,
        configDesc: editForm.configDesc,
        configMeta: Object.keys(cleanMeta).length > 0 ? cleanMeta : null
      }

      await updateSystemConfig(currentConfig.value.id, data)
      message.success('更新配置成功')
      editDialogVisible.value = false
      await loadData()
    } catch (error) {
      console.error('更新配置失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      editSubmitLoading.value = false
    }
  }

  return {
    // 新增相关
    addDialogVisible,
    addForm,
    addFormRules,
    addFormRef,
    submitLoading,
    handleAdd,
    handleAddCancel,
    handleAddSubmit,
    
    // 编辑相关
    editDialogVisible,
    editForm,
    editFormRules,
    editFormRef,
    currentConfig,
    editSubmitLoading,
    handleEdit,
    handleEditCancel,
    handleEditSubmit
  }
}
