import { request } from "@/utils";

const PREFIX = "/role";

/**
 * 新增角色
 * @param {Object} data - 角色数据 { name, code }
 * @returns {Promise}
 */
export function addRole(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

/**
 * 修改角色
 * @param {Object} data - 角色数据 { id, name, code }
 * @returns {Promise}
 */
export function updateRole(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

/**
 * 修改角色状态
 * @param {Number} id - 角色ID
 * @returns {Promise}
 */
export function updateRoleStatus(id) {
  return request({
    url: `${PREFIX}/status/${id}`,
    method: 'PUT'
  })
}

/**
 * 批量删除角色
 * @param {Array} ids - 角色ID列表
 * @returns {Promise}
 */
export function batchDeleteRole(ids) {
  return request({
    url: `${PREFIX}/batch/remove`,
    method: 'DELETE',
    data: ids
  })
}

/**
 * 查询所有角色名称
 * @returns {Promise}
 */
export function queryRoleList() {
  return request({
    url: `${PREFIX}/all`,
    method: 'GET'
  })
}

/**
 * 分页查询角色数据
 * @param {Number} pageNo - 当前页
 * @param {Number} pageSize - 每页数量
 * @param {Object} roleDto - 查询条件 { name, code, status }
 * @returns {Promise}
 */
export function queryRoleListByPage(pageNo, pageSize, roleDto = {}) {
  return request({
    url: `${PREFIX}/list`,
    method: 'GET',
    params: {
      pageNo,
      pageSize,
      ...roleDto
    }
  })
}

/**
 * 角色数据回显
 * @param {Number} id - 角色ID
 * @returns {Promise}
 */
export function echoRole(id) {
  return request({
    url: `${PREFIX}/${id}`,
    method: 'GET'
  })
}

/**
 * 角色分配权限
 * @param {Number} roleId - 角色ID
 * @param {Array} permissions - 权限ID列表
 * @returns {Promise}
 */
export function saveRolePermission(roleId, permissions) {
  return request({
    url: `${PREFIX}/permission/${roleId}`,
    method: 'PUT',
    data: permissions
  })
}

/**
 * 分页查询角色已分配的用户列表
 * @param {Number} roleId - 角色ID
 * @param {Number} pageNo - 当前页
 * @param {Number} pageSize - 每页数量
 * @param {Object} queryDto - 查询条件 { userName, status }
 * @returns {Promise}
 */
export function queryAssignedUsers(roleId, pageNo, pageSize, queryDto = {}) {
  return request({
    url: `${PREFIX}/assigned/users`,
    method: 'GET',
    params: {
      roleId,
      pageNo,
      pageSize,
      ...queryDto
    }
  })
}

/**
 * 分页查询角色未分配的用户列表
 * @param {Number} roleId - 角色ID
 * @param {Number} pageNo - 当前页
 * @param {Number} pageSize - 每页数量
 * @param {Object} queryDto - 查询条件 { userName, status }
 * @returns {Promise}
 */
export function queryUnassignedUsers(roleId, pageNo, pageSize, queryDto = {}) {
  return request({
    url: `${PREFIX}/unassigned/users`,
    method: 'GET',
    params: {
      roleId,
      pageNo,
      pageSize,
      ...queryDto
    }
  })
}

/**
 * 批量添加用户到角色
 * @param {Number} roleId - 角色ID
 * @param {Array} userIds - 用户ID列表
 * @returns {Promise}
 */
export function batchAssignUsers(roleId, userIds) {
  return request({
    url: `${PREFIX}/assign/users/${roleId}`,
    method: 'POST',
    data: { userIds }
  })
}

/**
 * 批量取消用户授权
 * @param {Number} roleId - 角色ID
 * @param {Array} userIds - 用户ID列表
 * @returns {Promise}
 */
export function batchUnassignUsers(roleId, userIds) {
  return request({
    url: `${PREFIX}/unassign/users/${roleId}`,
    method: 'DELETE',
    data: { userIds }
  })
}
