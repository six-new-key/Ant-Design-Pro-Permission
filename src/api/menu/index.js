import { request } from "@/utils";

const PREFIX = "/menu";

// 新增菜单
export function addMenu(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `${PREFIX}/remove`,
    method: 'DELETE',
    params: { id }
  })
}

// 查询所有菜单数据
export function queryMenuList() {
  return request({
    url: `${PREFIX}/list`,
    method: 'GET'
  })
}

// 模糊查询菜单数据
export function queryMenuListByLike(data) {
  return request({
    url: `${PREFIX}/list/like`,
    method: 'POST',
    data
  })
}

// 菜单数据回显
export function echoMenu(id) {
  return request({
    url: `${PREFIX}/echo`,
    method: 'GET',
    params: { id }
  })
}

// 分配权限时获取菜单树形数据
export function queryMenuListWithPermission() {
  return request({
    url: `${PREFIX}/permission/list`,
    method: 'GET'
  })
}

// 查询角色的权限数据
export function queryRoleMenuList(id) {
  return request({
    url: `${PREFIX}/query/role/permissions`,
    method: 'GET',
    params: { id }
  })
}
