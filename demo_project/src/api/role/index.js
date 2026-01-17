import httpRequest from '@/utils/request'

// 新增角色
export const addRole = (data) => {
  return httpRequest({
    url: '/role/add',
    method: 'POST',
    data
  })
}

// 修改角色
export const updateRole = (data) => {
  return httpRequest({
    url: '/role/update',
    method: 'PUT',
    data
  })
}

// 修改角色状态
export const updateRoleStatus = (id) => {
  return httpRequest({
    url: `/role/update/status/${id}`,
    method: 'PUT'
  })
}

// 批量删除角色
export const batchDeleteRole = (ids) => {
  return httpRequest({
    url: `/role/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 查询所有角色名称
export const queryRoleList = () => {
  return httpRequest({
    url: '/role/list',
    method: 'GET'
  })
}

// 分页查询角色数据
export const queryRoleListByPage = (pageNo, pageSize, roleDto = {}) => {
  return httpRequest({
    url: `/role/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: roleDto
  })
}

// 角色数据回显
export const echoRole = (id) => {
  return httpRequest({
    url: '/role/echo',
    method: 'GET',
    params: { id }
  })
}

// 角色分配权限
export const saveRolePermission = (roleId, permissions) => {
  return httpRequest({
    url: `/role/save/permission/${roleId}`,
    method: 'POST',
    data: permissions
  })
}