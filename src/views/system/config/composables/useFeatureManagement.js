import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getFeaturePage, addFeature, updateFeature, deleteFeature, toggleFeature } from '@/api/systemFeature'
import { getGroupList } from '@/api/systemConfigGroup'

/**
 * 功能管理 Composable
 */
export function useFeatureManagement() {
  const loading = ref(false)
  const featureList = ref([])
  const groupList = ref([])
  const total = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const filterGroupCode = ref(null)

  // 加载功能列表（后端分页）
  const loadFeatureList = async () => {
    loading.value = true
    try {
      const [featureRes, groupRes] = await Promise.all([
        getFeaturePage(pageNo.value, pageSize.value, keyword.value, filterGroupCode.value),
        getGroupList()
      ])
      featureList.value = featureRes.data.data || []
      total.value = featureRes.data.total || 0
      groupList.value = groupRes.data || []
    } catch (error) {
      console.error('加载功能列表失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      loading.value = false
    }
  }

  // 分页变化
  const handlePageChange = (page, size) => {
    pageNo.value = page
    pageSize.value = size
    loadFeatureList()
  }

  // 搜索
  const handleSearch = (value) => {
    keyword.value = value
    pageNo.value = 1 // 重置到第一页
    loadFeatureList()
  }

  // 分组过滤
  const handleGroupFilter = (groupCode) => {
    filterGroupCode.value = groupCode
    pageNo.value = 1 // 重置到第一页
    loadFeatureList()
  }

  // 新增功能
  const addDialogVisible = ref(false)
  const addFormRef = ref()
  const addForm = reactive({
    featureCode: '',
    featureName: '',
    featureDesc: '',
    groupCode: null,
    sortOrder: 0,
    isSystem: 0 // 默认为数字 0
  })

  const addFormRules = {
    featureCode: [
      { required: true, message: '请输入功能代码', trigger: 'blur' },
      { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
    ],
    featureName: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
    groupCode: [{ required: true, message: '请选择所属分组', trigger: 'change' }]
  }

  const submitLoading = ref(false)

  const handleAdd = () => {
    addDialogVisible.value = true
    Object.assign(addForm, {
      featureCode: '',
      featureName: '',
      featureDesc: '',
      groupCode: null,
      sortOrder: 0,
      isSystem: 0 // 默认为数字 0
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

      await addFeature(addForm)
      message.success('新增功能成功')
      addDialogVisible.value = false
      await loadFeatureList()
    } catch (error) {
      console.error('新增功能失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      submitLoading.value = false
    }
  }

  // 编辑功能
  const editDialogVisible = ref(false)
  const editFormRef = ref()
  const editForm = reactive({
    featureCode: '',
    featureName: '',
    featureDesc: '',
    groupCode: null,
    sortOrder: 0,
    isSystem: 0 // 默认为数字 0
  })

  const editFormRules = {
    featureCode: [
      { required: true, message: '请输入功能代码', trigger: 'blur' },
      { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
    ],
    featureName: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
    groupCode: [{ required: true, message: '请选择所属分组', trigger: 'change' }]
  }

  const currentFeature = ref(null)
  const editSubmitLoading = ref(false)

  const handleEdit = (record) => {
    currentFeature.value = record
    Object.assign(editForm, {
      featureCode: record.featureCode,
      featureName: record.featureName,
      featureDesc: record.featureDesc || '',
      groupCode: record.groupCode || null,
      sortOrder: record.sortOrder,
      isSystem: record.isSystem // 后端已返回 Integer 类型
    })
    editDialogVisible.value = true
  }

  const handleEditCancel = () => {
    editDialogVisible.value = false
    editFormRef.value?.resetFields()
    currentFeature.value = null
  }

  const handleEditSubmit = async () => {
    try {
      await editFormRef.value?.validate()
      editSubmitLoading.value = true

      await updateFeature(currentFeature.value.id, editForm)
      message.success('更新功能成功')
      editDialogVisible.value = false
      await loadFeatureList()
    } catch (error) {
      console.error('更新功能失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      editSubmitLoading.value = false
    }
  }

  // 删除功能
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除功能"${record.featureName}"吗？删除后该功能下的所有配置都将无法访问！`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteFeature(record.id)
          message.success('删除功能成功')
          await loadFeatureList()
        } catch (error) {
          console.error('删除功能失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 获取分组名称
  const getGroupName = (groupCode) => {
    const group = groupList.value.find(g => g.groupCode === groupCode)
    return group ? group.groupName : groupCode
  }

  // 切换功能状态
  const handleToggleStatus = async (record, checked) => {
    const action = checked ? '启用' : '禁用'
    const oldState = !checked
    
    // 构建提示内容
    const content = checked 
      ? `启用后，该功能将立即生效，相关配置项将可用。\n\n功能名称：${record.featureName}\n功能代码：${record.featureCode}`
      : `禁用后，该功能将立即失效，相关配置项将不可用。\n\n功能名称：${record.featureName}\n功能代码：${record.featureCode}\n\n⚠️ 注意：禁用可能影响系统正常运行，请谨慎操作！`
    
    try {
      // 弹框确认
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: `确认${action}功能`,
          content,
          okText: '确定',
          cancelText: '取消',
          centered: true,
          okType: checked ? 'primary' : 'danger',
          onOk: () => resolve(),
          onCancel: () => reject(new Error('用户取消'))
        })
      })
      
      // 将布尔值转换为整数 0/1
      const enabledValue = checked ? 1 : 0
      await toggleFeature(record.featureCode, enabledValue)
      message.success(`${record.featureName}已${action}`)
      
      // 刷新列表
      await loadFeatureList()
    } catch (error) {
      if (error.message !== '用户取消') {
        console.error('切换功能状态失败:', error)
        // 响应拦截器已统一处理错误提示
      }
      // 恢复原状态
      record.enabled = oldState
    }
  }

  return {
    loading,
    featureList,
    groupList,
    total,
    pageNo,
    pageSize,
    keyword,
    filterGroupCode,
    loadFeatureList,
    handlePageChange,
    handleSearch,
    handleGroupFilter,
    getGroupName,
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
    currentFeature,
    editSubmitLoading,
    handleEdit,
    handleEditCancel,
    handleEditSubmit,
    // 删除
    handleDelete,
    // 切换状态
    handleToggleStatus
  }
}
