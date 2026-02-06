import { ref } from 'vue'
import { Message } from '@/utils'
import { queryMenuListWithPermission, queryRoleMenuList } from '@/api/menu'

/**
 * 权限分配管理
 */
export function usePermissionAssign(fetchRoleList) {
  const permissionDialogVisible = ref(false)
  const currentRole = ref({})
  const allPermissions = ref([])
  const currentRolePermissions = ref([])

  /**
   * 加载所有权限数据
   */
  const loadAllPermissions = async () => {
    try {
      const response = await queryMenuListWithPermission()
      if (response.code === 200) {
        allPermissions.value = response.data || []
      }
    } catch (error) {
      console.error('加载权限数据失败:', error)
      Message.error('加载权限数据失败')
    }
  }

  /**
   * 打开权限分配弹窗
   */
  const handleAssignPermission = async (record) => {
    // 校验角色状态
    if (record.status === 0) {
      Message.warning('禁用状态的角色不能分配权限，请先启用该角色')
      return
    }
    
    // 校验超级管理员
    if (record.code === 'admin') {
      Message.warning('超级管理员角色不允许修改权限')
      return
    }
    
    try {
      currentRole.value = record
      const response = await queryRoleMenuList(record.id)
      if (response.code === 200) {
        currentRolePermissions.value = response.data || []
        permissionDialogVisible.value = true
      }
    } catch (error) {
      console.error('获取角色权限数据失败:', error)
      Message.error('获取角色权限数据失败')
    }
  }

  /**
   * 权限保存成功回调
   */
  const handlePermissionSaveSuccess = () => {
    fetchRoleList()
  }

  return {
    permissionDialogVisible,
    currentRole,
    allPermissions,
    currentRolePermissions,
    loadAllPermissions,
    handleAssignPermission,
    handlePermissionSaveSuccess
  }
}
