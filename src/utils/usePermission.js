/**
 * 权限判断 Composable
 * 
 * 在组件中使用：
 * import { usePermission } from '@/utils/usePermission'
 * 
 * const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isAdmin } = usePermission()
 * 
 * if (hasPermission('permission:menu:remove')) {
 *   // 有权限
 * }
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import * as permissionUtils from '@/utils/permission'

export function usePermission() {
  const userStore = useUserStore()
  
  // 获取用户权限和角色
  const permissions = computed(() => userStore.permissions || [])
  const roles = computed(() => userStore.roles || [])
  
  /**
   * 检查是否有指定权限
   */
  const hasPermission = (permission) => {
    return permissionUtils.hasPermission(permission, permissions.value)
  }
  
  /**
   * 检查是否有任意一个权限（OR 逻辑）
   */
  const hasAnyPermission = (permissionList) => {
    return permissionUtils.hasAnyPermission(permissionList, permissions.value)
  }
  
  /**
   * 检查是否有所有权限（AND 逻辑）
   */
  const hasAllPermissions = (permissionList) => {
    return permissionUtils.hasAllPermissions(permissionList, permissions.value)
  }
  
  /**
   * 检查是否有指定角色
   */
  const hasRole = (role) => {
    return permissionUtils.hasRole(role, roles.value)
  }
  
  /**
   * 检查是否有任意一个角色（OR 逻辑）
   */
  const hasAnyRole = (roleList) => {
    return permissionUtils.hasAnyRole(roleList, roles.value)
  }
  
  /**
   * 检查是否为管理员
   */
  const isAdmin = computed(() => {
    return permissionUtils.isAdmin(roles.value)
  })
  
  return {
    // 权限列表
    permissions,
    roles,
    
    // 权限判断方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 角色判断方法
    hasRole,
    hasAnyRole,
    isAdmin
  }
}
