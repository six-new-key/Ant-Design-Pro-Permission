import { request } from "@/utils";

const PREFIX = "/role";

// 新增角色
export function addRole(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

// 修改角色状态
export function updateRoleStatus(id) {
  return request({
    url: `${PREFIX}/edit/status/${id}`,
    method: 'PUT'
  })
}

// 批量删除角色
export function batchDeleteRole(ids) {
  return request({
    url: `${PREFIX}/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 查询所有角色名称
export function queryRoleList() {
  return request({
    url: `${PREFIX}/list`,
    method: 'GET'
  })
}

// 分页查询角色数据
export function queryRoleListByPage(pageNo, pageSize, roleDto = {}) {
  return request({
    url: `${PREFIX}/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: roleDto
  })
}

// 角色数据回显
export function echoRole(id) {
  return request({
    url: `${PREFIX}/echo`,
    method: 'GET',
    params: { id }
  })
}

// 角色分配权限
export function saveRolePermission(roleId, permissions) {
  return request({
    url: `${PREFIX}/save/permission/${roleId}`,
    method: 'POST',
    data: permissions
  })
}
