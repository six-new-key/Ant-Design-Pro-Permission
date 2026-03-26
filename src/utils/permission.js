/**
 * 权限工具函数
 * 
 * 提供权限判断的核心逻辑
 * 权限格式：'模块:功能:操作' (如 'permission:menu:remove')
 */

/**
 * 检查是否有指定权限
 * @param {string} permission - 权限标识
 * @param {Array<string>} permissions - 用户权限列表
 * @returns {boolean}
 */
export function hasPermission(permission, permissions) {
  if (!permission || !permissions) {
    return false
  }
  
  return permissions.includes(permission)
}

/**
 * 检查是否有任意一个权限（OR 逻辑）
 * @param {Array<string>} permissionList - 权限标识列表
 * @param {Array<string>} permissions - 用户权限列表
 * @returns {boolean}
 */
export function hasAnyPermission(permissionList, permissions) {
  if (!permissionList || !Array.isArray(permissionList) || permissionList.length === 0) {
    return false
  }
  
  if (!permissions || !Array.isArray(permissions)) {
    return false
  }
  
  return permissionList.some(p => hasPermission(p, permissions))
}

/**
 * 检查是否有所有权限（AND 逻辑）
 * @param {Array<string>} permissionList - 权限标识列表
 * @param {Array<string>} permissions - 用户权限列表
 * @returns {boolean}
 */
export function hasAllPermissions(permissionList, permissions) {
  if (!permissionList || !Array.isArray(permissionList) || permissionList.length === 0) {
    return false
  }
  
  if (!permissions || !Array.isArray(permissions)) {
    return false
  }
  
  return permissionList.every(p => hasPermission(p, permissions))
}

/**
 * 检查是否有指定角色
 * @param {string} role - 角色标识
 * @param {Array<Object>} roles - 用户角色列表 [{id, name, code}]
 * @returns {boolean}
 */
export function hasRole(role, roles) {
  if (!role || !roles) {
    return false
  }
  
  return roles.some(r => r.code === role)
}

/**
 * 检查是否有任意一个角色（OR 逻辑）
 * @param {Array<string>} roleList - 角色标识列表
 * @param {Array<Object>} roles - 用户角色列表
 * @returns {boolean}
 */
export function hasAnyRole(roleList, roles) {
  if (!roleList || !Array.isArray(roleList) || roleList.length === 0) {
    return false
  }
  
  if (!roles || !Array.isArray(roles)) {
    return false
  }
  
  return roleList.some(r => hasRole(r, roles))
}

/**
 * 检查是否为管理员
 * @param {Array<Object>} roles - 用户角色列表
 * @returns {boolean}
 */
export function isAdmin(roles) {
  return hasRole('admin', roles)
}
