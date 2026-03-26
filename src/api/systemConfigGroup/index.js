import request from '@/utils/request'

/**
 * 查询所有分组（用于下拉框和配置管理）
 */
export function getGroupList() {
  return request({
    url: '/system_config_group/list',
    method: 'get'
  })
}

/**
 * 分页查询分组
 */
export function getGroupPage(pageNo, pageSize, keyword) {
  return request({
    url: '/system_config_group/page',
    method: 'get',
    params: { pageNo, pageSize, keyword }
  })
}

/**
 * 新增分组
 */
export function addGroup(data) {
  return request({
    url: '/system_config_group/add',
    method: 'post',
    data
  })
}

/**
 * 更新分组
 */
export function updateGroup(id, data) {
  return request({
    url: `/system_config_group/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分组
 */
export function deleteGroup(id) {
  return request({
    url: `/system_config_group/delete/${id}`,
    method: 'delete'
  })
}
