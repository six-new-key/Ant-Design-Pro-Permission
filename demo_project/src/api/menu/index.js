import httpRequest from '@/utils/request'

// 新增菜单
export const addMenu = (data) => {
  return httpRequest({
    url: '/menu/add',
    method: 'POST',
    data
  })
}

// 修改菜单
export const updateMenu = (data) => {
  return httpRequest({
    url: '/menu/update',
    method: 'PUT',
    data
  })
}

// 删除菜单
export const deleteMenu = (id) => {
  return httpRequest({
    url: '/menu/delete',
    method: 'DELETE',
    params: { id }
  })
}

// 查询所有菜单数据
export const queryMenuList = () => {
  return httpRequest({
    url: '/menu/list',
    method: 'GET'
  })
}

// 查询所有菜单数据(primeVue框架)
export const queryMenuListWithPrimeVue = () => {
  return httpRequest({
    url: '/menu/primeVue/list',
    method: 'GET'
  })
}

// 模糊查询菜单数据
export const queryMenuListByLike = (data) => {
  return httpRequest({
    url: '/menu/list/like',
    method: 'POST',
    data
  })
}

// 模糊查询菜单数据(primeVue框架)
export const queryMenuListByLikeWithPrimeVue = (data) => {
  return httpRequest({
    url: '/menu/primeVue/list/like',
    method: 'POST',
    data
  })
}

// 菜单数据回显
export const echoMenu = (id) => {
  return httpRequest({
    url: '/menu/echo',
    method: 'GET',
    params: { id }
  })
}

// 分配权限时获取菜单树形数据
export const queryMenuListWithPermission = () => {
  return httpRequest({
    url: '/menu/permission/list',
    method: 'GET'
  })
}

// 查询角色的权限数据
export const queryRoleMenuList = (id) => {
  return httpRequest({
    url: '/menu/query/role/permissions',
    method: 'GET',
    params: { id }
  })
}

// 查询角色的权限数据（适配primeVue ui框架）
export const queryRoleMenuListWithPrimeVue = (id) => {
  return httpRequest({
    url: '/menu/primeVue/query/role/permissions',
    method: 'GET',
    params: { id }
  })
}