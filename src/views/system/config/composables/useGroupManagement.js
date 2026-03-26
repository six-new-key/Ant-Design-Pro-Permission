import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getGroupPage, addGroup, updateGroup, deleteGroup } from '@/api/systemConfigGroup'

/**
 * 分组管理 Composable
 */
export function useGroupManagement() {
  const loading = ref(false)
  const groupList = ref([])
  const total = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')

  // 加载分组列表（后端分页）
  const loadGroupList = async () => {
    loading.value = true
    try {
      const res = await getGroupPage(pageNo.value, pageSize.value, keyword.value)
      groupList.value = res.data.data || []
      total.value = res.data.total || 0
    } catch (error) {
      console.error('加载分组列表失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      loading.value = false
    }
  }

  // 分页变化
  const handlePageChange = (page, size) => {
    pageNo.value = page
    pageSize.value = size
    loadGroupList()
  }

  // 搜索
  const handleSearch = (value) => {
    keyword.value = value
    pageNo.value = 1 // 重置到第一页
    loadGroupList()
  }

  // 新增分组
  const addDialogVisible = ref(false)
  const addFormRef = ref()
  const addForm = reactive({
    groupCode: '',
    groupName: '',
    groupDesc: '',
    sortOrder: 0
  })

  const addFormRules = {
    groupCode: [
      { required: true, message: '请输入分组代码', trigger: 'blur' },
      { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
    ],
    groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
  }

  const submitLoading = ref(false)

  const handleAdd = () => {
    addDialogVisible.value = true
    Object.assign(addForm, {
      groupCode: '',
      groupName: '',
      groupDesc: '',
      sortOrder: 0
    })
  }

  const handleAddCancel = () => {
    addDialogVisible.value = false
    addFormRef.value?.resetFields()
  }

  const handleAddSubmit = async () => {
    try {
      await addFormRef.value?.validate()
      submitLoading.value = true

      await addGroup(addForm)
      message.success('新增分组成功')
      addDialogVisible.value = false
      await loadGroupList()
    } catch (error) {
      console.error('新增分组失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      submitLoading.value = false
    }
  }

  // 编辑分组
  const editDialogVisible = ref(false)
  const editFormRef = ref()
  const editForm = reactive({
    groupCode: '',
    groupName: '',
    groupDesc: '',
    sortOrder: 0
  })

  const editFormRules = {
    groupCode: [
      { required: true, message: '请输入分组代码', trigger: 'blur' },
      { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
    ],
    groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
  }

  const currentGroup = ref(null)
  const editSubmitLoading = ref(false)

  const handleEdit = (record) => {
    currentGroup.value = record
    Object.assign(editForm, {
      groupCode: record.groupCode,
      groupName: record.groupName,
      groupDesc: record.groupDesc || '',
      sortOrder: record.sortOrder
    })
    editDialogVisible.value = true
  }

  const handleEditCancel = () => {
    editDialogVisible.value = false
    editFormRef.value?.resetFields()
    currentGroup.value = null
  }

  const handleEditSubmit = async () => {
    try {
      await editFormRef.value?.validate()
      editSubmitLoading.value = true

      await updateGroup(currentGroup.value.id, editForm)
      message.success('更新分组成功')
      editDialogVisible.value = false
      await loadGroupList()
    } catch (error) {
      console.error('更新分组失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      editSubmitLoading.value = false
    }
  }

  // 删除分组
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分组"${record.groupName}"吗？删除后该分组下的所有功能和配置都将无法访问！`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteGroup(record.id)
          message.success('删除分组成功')
          await loadGroupList()
        } catch (error) {
          console.error('删除分组失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  return {
    loading,
    groupList,
    total,
    pageNo,
    pageSize,
    keyword,
    loadGroupList,
    handlePageChange,
    handleSearch,
    // 新增
    addDialogVisible,
    addForm,
    addFormRules,
    addFormRef,
    submitLoading,
    handleAdd,
    handleAddCancel,
    handleAddSubmit,
    // 编辑
    editDialogVisible,
    editForm,
    editFormRules,
    editFormRef,
    currentGroup,
    editSubmitLoading,
    handleEdit,
    handleEditCancel,
    handleEditSubmit,
    // 删除
    handleDelete
  }
}
