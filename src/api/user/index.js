import {request} from "@/utils";

//请求前缀
const PREFIX = "/user";

export function login(data) {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/login`,
    method: "POST",
    data: data,
  });
}

export function querySelf() {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/info`,
    method: "POST"
  });
}

export function logout() {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/logout`,
    method: "POST"
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
    url: `${PREFIX}/update`,
    method: 'PUT',
    data
  })
}

// 修改用户状态
export function updateUserStatus(id) {
  return request({
    url: `${PREFIX}/update/status/${id}`,
    method: 'PUT'
  })
}

// 批量删除用户
export function batchDeleteUser(ids) {
  return request({
    url: `${PREFIX}/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 分页查询用户数据
export function queryUserList(pageNo, pageSize, userDto = {}) {
  return request({
    url: `${PREFIX}/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: userDto
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
export function saveUserRoles(username, roles) {
  return request({
    url: `${PREFIX}/save/roles/${username}`,
    method: 'POST',
    data: roles
  })
}

// 重置用户密码
export function resetUserPassword(data) {
  return request({
    url: `${PREFIX}/reset/pwd`,
    method: 'POST',
    data
  })
}