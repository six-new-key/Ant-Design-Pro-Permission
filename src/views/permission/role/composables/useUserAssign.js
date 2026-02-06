import { ref, reactive, computed } from 'vue'
import { Message } from '@/utils'
import { 
  queryAssignedUsers, 
  queryUnassignedUsers, 
  batchAssignUsers, 
  batchUnassignUsers 
} from '@/api/role'

/**
 * 用户分配管理
 */
export function useUserAssign(fetchRoleList) {
  // 主抽屉状态
  const assignDrawerVisible = ref(false)
  const currentRole = ref({})
  
  // 已分配用户列表
  const assignedUsers = ref([])
  const assignedLoading = ref(false)
  const assignedSelectedRowKeys = ref([])
  const assignedPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50']
  })
  
  // 已分配用户搜索条件
  const assignedSearchForm = reactive({
    userName: '',
    status: undefined
  })
  
  // 二级抽屉状态
  const addDrawerVisible = ref(false)
  
  // 未分配用户列表
  const unassignedUsers = ref([])
  const unassignedLoading = ref(false)
  const unassignedSelectedRowKeys = ref([])
  const unassignedPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50']
  })
  
  // 未分配用户搜索条件
  const unassignedSearchForm = reactive({
    userName: '',
    status: undefined
  })

  /**
   * 打开分配用户抽屉
   */
  const handleAssignUser = (record) => {
    // 校验角色状态
    if (record.status === 0) {
      Message.warning('禁用状态的角色不能分配用户，请先启用该角色')
      return
    }
    
    // 校验超级管理员
    if (record.code === 'admin') {
      Message.warning('超级管理员角色不允许分配用户')
      return
    }
    
    currentRole.value = record
    assignDrawerVisible.value = true
    resetAssignedSearch()
    fetchAssignedUsers()
  }

  /**
   * 加载已分配用户列表
   */
  const fetchAssignedUsers = async () => {
    assignedLoading.value = true
    try {
      const params = {
        userName: assignedSearchForm.userName ? assignedSearchForm.userName.trim() : '',
        status: assignedSearchForm.status
      }
      
      const response = await queryAssignedUsers(
        currentRole.value.id,
        assignedPagination.current,
        assignedPagination.pageSize,
        params
      )
      
      if (response.code === 200 && response.data !== null) {
        assignedUsers.value = response.data.data || []
        assignedPagination.total = response.data.total || 0
      }
    } catch (error) {
      console.error('加载已分配用户失败:', error)
      Message.error('加载已分配用户失败')
    } finally {
      assignedLoading.value = false
    }
  }

  /**
   * 已分配用户搜索
   */
  const handleAssignedSearch = () => {
    assignedPagination.current = 1
    fetchAssignedUsers()
  }

  /**
   * 重置已分配用户搜索
   */
  const resetAssignedSearch = () => {
    assignedSearchForm.userName = ''
    assignedSearchForm.status = undefined
    assignedPagination.current = 1
    assignedSelectedRowKeys.value = []
  }

  /**
   * 已分配用户表格变化
   */
  const handleAssignedTableChange = (pag) => {
    assignedPagination.current = pag.current
    assignedPagination.pageSize = pag.pageSize
    fetchAssignedUsers()
  }

  /**
   * 已分配用户行选择变化
   */
  const onAssignedSelectChange = (keys) => {
    assignedSelectedRowKeys.value = keys
  }

  /**
   * 打开添加用户抽屉
   */
  const handleOpenAddDrawer = () => {
    addDrawerVisible.value = true
    resetUnassignedSearch()
    fetchUnassignedUsers()
  }

  /**
   * 加载未分配用户列表
   */
  const fetchUnassignedUsers = async () => {
    unassignedLoading.value = true
    try {
      const params = {
        userName: unassignedSearchForm.userName ? unassignedSearchForm.userName.trim() : '',
        status: unassignedSearchForm.status
      }
      
      const response = await queryUnassignedUsers(
        currentRole.value.id,
        unassignedPagination.current,
        unassignedPagination.pageSize,
        params
      )
      
      if (response.code === 200 && response.data !== null) {
        unassignedUsers.value = response.data.data || []
        unassignedPagination.total = response.data.total || 0
      }
    } catch (error) {
      console.error('加载可分配用户失败:', error)
      Message.error('加载可分配用户失败')
    } finally {
      unassignedLoading.value = false
    }
  }

  /**
   * 未分配用户搜索
   */
  const handleUnassignedSearch = () => {
    unassignedPagination.current = 1
    fetchUnassignedUsers()
  }

  /**
   * 重置未分配用户搜索
   */
  const resetUnassignedSearch = () => {
    unassignedSearchForm.userName = ''
    unassignedSearchForm.status = undefined
    unassignedPagination.current = 1
    unassignedSelectedRowKeys.value = []
  }

  /**
   * 未分配用户表格变化
   */
  const handleUnassignedTableChange = (pag) => {
    unassignedPagination.current = pag.current
    unassignedPagination.pageSize = pag.pageSize
    fetchUnassignedUsers()
  }

  /**
   * 未分配用户行选择变化
   */
  const onUnassignedSelectChange = (keys) => {
    unassignedSelectedRowKeys.value = keys
  }

  /**
   * 批量添加用户
   */
  const handleBatchAdd = async () => {
    if (unassignedSelectedRowKeys.value.length === 0) {
      Message.warning('请选择要添加的用户')
      return
    }

    try {
      const response = await batchAssignUsers(
        currentRole.value.id,
        unassignedSelectedRowKeys.value
      )
      
      if (response.code === 200) {
        Message.success('添加成功')
        addDrawerVisible.value = false
        unassignedSelectedRowKeys.value = []
        fetchAssignedUsers()
        if (fetchRoleList) {
          fetchRoleList()
        }
      }
    } catch (error) {
      console.error('添加用户失败:', error)
    }
  }

  /**
   * 批量取消授权
   */
  const handleBatchUnassign = async () => {
    if (assignedSelectedRowKeys.value.length === 0) {
      Message.warning('请选择要取消授权的用户')
      return
    }

    try {
      const response = await batchUnassignUsers(
        currentRole.value.id,
        assignedSelectedRowKeys.value
      )
      
      if (response.code === 200) {
        Message.success('取消授权成功')
        assignedSelectedRowKeys.value = []
        fetchAssignedUsers()
        if (fetchRoleList) {
          fetchRoleList()
        }
      }
    } catch (error) {
      console.error('取消授权失败:', error)
    }
  }

  /**
   * 关闭主抽屉
   */
  const handleCloseAssignDrawer = () => {
    assignDrawerVisible.value = false
    assignedSelectedRowKeys.value = []
    resetAssignedSearch()
  }

  /**
   * 关闭二级抽屉
   */
  const handleCloseAddDrawer = () => {
    addDrawerVisible.value = false
    unassignedSelectedRowKeys.value = []
    resetUnassignedSearch()
  }

  // 计算属性：批量取消授权按钮是否禁用
  const unassignDisabled = computed(() => assignedSelectedRowKeys.value.length === 0)
  
  // 计算属性：确定添加按钮是否禁用
  const addDisabled = computed(() => unassignedSelectedRowKeys.value.length === 0)

  return {
    // 主抽屉
    assignDrawerVisible,
    currentRole,
    assignedUsers,
    assignedLoading,
    assignedSelectedRowKeys,
    assignedPagination,
    assignedSearchForm,
    handleAssignUser,
    fetchAssignedUsers,
    handleAssignedSearch,
    resetAssignedSearch,
    handleAssignedTableChange,
    onAssignedSelectChange,
    handleCloseAssignDrawer,
    
    // 二级抽屉
    addDrawerVisible,
    unassignedUsers,
    unassignedLoading,
    unassignedSelectedRowKeys,
    unassignedPagination,
    unassignedSearchForm,
    handleOpenAddDrawer,
    fetchUnassignedUsers,
    handleUnassignedSearch,
    resetUnassignedSearch,
    handleUnassignedTableChange,
    onUnassignedSelectChange,
    handleCloseAddDrawer,
    
    // 操作
    handleBatchAdd,
    handleBatchUnassign,
    unassignDisabled,
    addDisabled
  }
}
