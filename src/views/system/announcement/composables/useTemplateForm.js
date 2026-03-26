import { ref, reactive } from 'vue'
import { addTemplate, updateTemplate } from '@/api/announcement/template'
import message from '@/utils/message'

export function useTemplateForm(refreshList) {
  // 新增相关
  const addDrawerVisible = ref(false)
  const addFormRef = ref(null)
  const addForm = reactive({
    name: '',
    title: '',
    content: '',
    type: 1,
    level: 1,
    description: '',
    category: 'default',
    sortOrder: 0,
    isSystem: 0
  })
  const addFormRules = {
    name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    title: [{ required: true, message: '请输入标题模板', trigger: 'blur' }],
    content: [{ required: true, message: '请输入内容模板', trigger: 'blur' }],
    type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
    level: [{ required: true, message: '请选择重要级别', trigger: 'change' }]
  }
  const addSubmitLoading = ref(false)

  // 编辑相关
  const editDrawerVisible = ref(false)
  const editFormRef = ref(null)
  const editForm = reactive({
    id: null,
    name: '',
    title: '',
    content: '',
    type: 1,
    level: 1,
    description: '',
    category: 'default',
    sortOrder: 0,
    isSystem: 0
  })
  const editFormRules = addFormRules
  const editSubmitLoading = ref(false)

  // 打开新增抽屉
  const handleAdd = () => {
    addDrawerVisible.value = true
    // 重置表单
    Object.assign(addForm, {
      name: '',
      title: '',
      content: '',
      type: 1,
      level: 1,
      description: '',
      category: 'default',
      sortOrder: 0,
      isSystem: 0
    })
    addFormRef.value?.clearValidate()
  }

  // 取消新增
  const handleAddCancel = () => {
    addDrawerVisible.value = false
  }

  // 提交新增
  const handleAddSubmit = async () => {
    try {
      await addFormRef.value?.validate()
      
      addSubmitLoading.value = true
      await addTemplate(addForm)
      
      message.success('新增模板成功')
      addDrawerVisible.value = false
      refreshList()
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return
      }
      console.error('新增模板失败:', error)
    } finally {
      addSubmitLoading.value = false
    }
  }

  // 打开编辑抽屉
  const handleEdit = (record) => {
    editDrawerVisible.value = true
    // 填充表单
    Object.assign(editForm, {
      id: record.id,
      name: record.name,
      title: record.title,
      content: record.content,
      type: record.type,
      level: record.level,
      description: record.description || '',
      category: record.category || 'default',
      sortOrder: record.sortOrder || 0,
      isSystem: record.isSystem || 0
    })
    editFormRef.value?.clearValidate()
  }

  // 取消编辑
  const handleEditCancel = () => {
    editDrawerVisible.value = false
  }

  // 提交编辑
  const handleEditSubmit = async () => {
    try {
      await editFormRef.value?.validate()
      
      editSubmitLoading.value = true
      const { id, ...data } = editForm
      await updateTemplate(id, data)
      
      message.success('更新模板成功')
      editDrawerVisible.value = false
      refreshList()
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return
      }
      console.error('更新模板失败:', error)
    } finally {
      editSubmitLoading.value = false
    }
  }

  return {
    // 新增
    addDrawerVisible,
    addForm,
    addFormRules,
    addFormRef,
    addSubmitLoading,
    handleAdd,
    handleAddCancel,
    handleAddSubmit,
    // 编辑
    editDrawerVisible,
    editForm,
    editFormRules,
    editFormRef,
    editSubmitLoading,
    handleEdit,
    handleEditCancel,
    handleEditSubmit
  }
}
