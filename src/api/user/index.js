import {request} from "@/utils";

//请求前缀
const PREFIX = "/user";

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function querySelf() {
  return request({
    url: `${PREFIX}/info`,
    method: "GET"
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

// 修改用户状态
export function updateUserStatus(id) {
  return request({
    url: `${PREFIX}/status/${id}`,
    method: 'PUT'
  })
}

// 批量删除用户
export function batchDeleteUser(ids) {
  return request({
    url: `${PREFIX}/batch/remove`,
    method: 'DELETE',
    data: ids
  })
}

// 分页查询用户数据
export function queryUserList(pageNo, pageSize, userDto = {}) {
  return request({
    url: `${PREFIX}/list`,
    method: 'GET',
    params: {
      pageNo,
      pageSize,
      ...userDto
    }
  })
}

// 用户数据回显
export function echoUserById(id) {
  return request({
    url: `${PREFIX}/echo/${id}`,
    method: 'GET'
  })
}

// 获取用户角色
export function queryUserRoles(userId) {
  return request({
    url: `${PREFIX}/roles/${userId}`,
    method: 'GET'
  })
}

// 保存分配的用户角色
export function saveUserRoles(userId, roles) {
  return request({
    url: `${PREFIX}/roles/${userId}`,
    method: 'PUT',
    data: { roles }
  })
}

// 重置用户密码
export function resetUserPassword(id, password) {
  return request({
    url: `${PREFIX}/password/${id}`,
    method: 'PUT',
    data: { password }
  })
}

// 踢人下线
export function kickoutUser(id) {
  return request({
    url: `${PREFIX}/kickout/${id}`,
    method: 'POST'
  })
}
