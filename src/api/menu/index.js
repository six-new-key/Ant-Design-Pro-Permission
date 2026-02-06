import { request } from "@/utils";

const PREFIX = "/menu";

/**
 * 新增菜单
 * @param {Object} data - 菜单数据
 */
export function addMenu(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

/**
 * 修改菜单
 * @param {Object} data - 菜单数据
 */
export function updateMenu(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

/**
 * 修改菜单状态
 * @param {Number} id - 菜单ID
 */
export function updateMenuStatus(id) {
  return request({
    url: `${PREFIX}/status/${id}`,
    method: 'PUT'
  })
}

/**
 * 删除菜单
 * @param {Number} id - 菜单ID
 */
export function deleteMenu(id) {
  return request({
    url: `${PREFIX}/remove`,
    method: 'DELETE',
    params: { id }
  })
}

/**
 * 查询所有菜单数据
 */
export function queryMenuList() {
  return request({
    url: PREFIX,
    method: 'GET'
  })
}

/**
 * 模糊查询菜单数据
 * @param {Object} data - 查询条件
 */
export function queryMenuListByLike(data) {
  return request({
    url: `${PREFIX}/search`,
    method: 'POST',
    data
  })
}

/**
 * 菜单数据回显
 * @param {Number} id - 菜单ID
 */
export function getMenuById(id) {
  return request({
    url: `${PREFIX}/${id}`,
    method: 'GET'
  })
}

/**
 * 分配权限时获取菜单树形数据
 */
export function queryMenuListWithPermission() {
  return request({
    url: `${PREFIX}/permission`,
    method: 'GET'
  })
}

/**
 * 查询角色的权限数据
 * @param {Number} id - 角色ID
 */
export function queryRoleMenuList(id) {
  return request({
    url: `${PREFIX}/query/role/permissions`,
    method: 'GET',
    params: { id }
  })
}
