import httpRequest from '@/utils/request'

// 用户登录
export const login = (data) => {
  return httpRequest({
    url: '/user/login',
    method: 'POST',
    data
  })
}

// 用户退出登录
export const logout = () => {
  return httpRequest({
    url: '/user/logout',
    method: 'POST'
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return httpRequest({
    url: '/user/info',
    method: 'POST'
  })
}

// 用户注册
export const register = (data) => {
  return httpRequest({
    url: '/user/register',
    method: 'POST',
    data
  })
}

// 新增用户
export const addUser = (data) => {
  return httpRequest({
    url: '/user/add',
    method: 'POST',
    data
  })
}

// 修改用户
export const updateUser = (data) => {
  return httpRequest({
    url: '/user/update',
    method: 'PUT',
    data
  })
}

// 修改用户状态
export const updateUserStatus = (id) => {
  return httpRequest({
    url: `/user/update/status/${id}`,
    method: 'PUT'
  })
}

// 批量删除用户
export const batchDeleteUser = (ids) => {
  return httpRequest({
    url: `/user/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 分页查询用户数据
export const queryUserList = (pageNo, pageSize, userDto = {}) => {
  return httpRequest({
    url: `/user/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: userDto
  })
}

// 用户数据回显
export const echoUserById = (id) => {
  return httpRequest({
    url: `/user/echo/${id}`,
    method: 'GET'
  })
}

// 获取用户角色
export const queryUserRoles = (userId) => {
  return httpRequest({
    url: `/user/roles/${userId}`,
    method: 'GET'
  })
}

// 保存分配的用户角色
export const saveUserRoles = (username, roles) => {
  return httpRequest({
    url: `/user/save/roles/${username}`,
    method: 'POST',
    data: roles
  })
}

// 重置用户密码
export const resetUserPassword = (data) => {
  return httpRequest({
    url: '/user/reset/pwd',
    method: 'POST',
    data
  })
}