import { ref, reactive } from 'vue'
import { addSystemConfig } from '@/api/systemConfig'
import { Message } from '@/utils'

/**
 * 配置表单管理
 */
export function useConfigForm(refreshCallback) {
  // 新增配置相关
  const addDialogVisible = ref(false)
  const submitLoading = ref(false)
  const addFormRef = ref()

  const addForm = reactive({
    configKey: '',
    configName: '',
    configType: 'string',
    configValue: '',
    configGroup: '',
    configDesc: '',
    defaultValue: '',
    sortOrder: 0,
    isSystem: false
  })

  const addFormRules = {
    configKey: [
      { required: true, message: '请输入配置键', trigger: 'blur' },
      { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
    ],
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
    configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
  }

  // 编辑配置相关
  const editDialogVisible = ref(false)
  const editFormRef = ref()
  const currentConfig = ref(null)

  const editForm = reactive({
    value: null
  })

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    addDialogVisible.value = true
  }

  /**
   * 取消新增
   */
  const handleAddCancel = () => {
    addDialogVisible.value = false
    addFormRef.value?.resetFields()
  }

  /**
   * 提交新增
   */
  const handleAddSubmit = async () => {
    try {
      await addFormRef.value?.validate()
      
      submitLoading.value = true
      const response = await addSystemConfig(addForm)
      if (response.code === 200) {
        Message.success('新增配置成功')
        addDialogVisible.value = false
        addFormRef.value?.resetFields()
        if (refreshCallback) {
          await refreshCallback()
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (record) => {
    currentConfig.value = record
    editForm.value = record.configValue
    editDialogVisible.value = true
  }

  /**
   * 关闭编辑对话框
   */
  const handleEditCancel = () => {
    editDialogVisible.value = false
    currentConfig.value = null
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
    editFormRef,
    currentConfig,
    handleEdit,
    handleEditCancel
  }
}
