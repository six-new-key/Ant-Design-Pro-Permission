import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { addAnnouncement, updateAnnouncement } from '@/api/announcement'

/**
 * 公告表单 Composable
 */
export function useAnnouncementForm(loadList) {
  // 新增表单
  const addDrawerVisible = ref(false)
  const addFormRef = ref()
  const addForm = reactive({
    title: '',
    content: '',
    type: 1,
    level: 1
  })

  const addFormRules = {
    title: [
      { required: true, message: '请输入公告标题', trigger: 'blur' },
      { max: 200, message: '标题最多200个字符', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入公告内容', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '请选择公告类型', trigger: 'change' }
    ],
    level: [
      { required: true, message: '请选择重要级别', trigger: 'change' }
    ]
  }

  const addSubmitLoading = ref(false)

  const handleAdd = () => {
    addDrawerVisible.value = true
    Object.assign(addForm, {
      title: '',
      content: '',
      type: 1,
      level: 1
    })
  }

  const handleAddCancel = () => {
    addDrawerVisible.value = false
    addFormRef.value?.resetFields()
  }

  const handleAddSubmit = async () => {
    try {
      await addFormRef.value?.validate()
      addSubmitLoading.value = true

      await addAnnouncement(addForm)
      message.success('新增公告成功')
      addDrawerVisible.value = false
      await loadList()
    } catch (error) {
      console.error('新增公告失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      addSubmitLoading.value = false
    }
  }

  // 编辑表单
  const editDrawerVisible = ref(false)
  const editFormRef = ref()
  const editForm = reactive({
    title: '',
    content: '',
    type: 1,
    level: 1
  })

  const editFormRules = {
    title: [
      { required: true, message: '请输入公告标题', trigger: 'blur' },
      { max: 200, message: '标题最多200个字符', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入公告内容', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '请选择公告类型', trigger: 'change' }
    ],
    level: [
      { required: true, message: '请选择重要级别', trigger: 'change' }
    ]
  }

  const currentAnnouncement = ref(null)
  const editSubmitLoading = ref(false)

  const handleEdit = (record) => {
    currentAnnouncement.value = record
    Object.assign(editForm, {
      title: record.title,
      content: record.content,
      type: record.type,
      level: record.level
    })
    editDrawerVisible.value = true
  }

  const handleEditCancel = () => {
    editDrawerVisible.value = false
    editFormRef.value?.resetFields()
    currentAnnouncement.value = null
  }

  const handleEditSubmit = async () => {
    try {
      await editFormRef.value?.validate()
      editSubmitLoading.value = true

      await updateAnnouncement(currentAnnouncement.value.id, editForm)
      message.success('更新公告成功')
      editDrawerVisible.value = false
      await loadList()
    } catch (error) {
      console.error('更新公告失败:', error)
      // 响应拦截器已统一处理错误提示
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
    currentAnnouncement,
    editSubmitLoading,
    handleEdit,
    handleEditCancel,
    handleEditSubmit
  }
}
