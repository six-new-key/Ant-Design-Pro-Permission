import request from '@/utils/request'

/**
 * 分页查询模板
 */
export function getTemplatePage(params) {
  return request({
    url: '/announcement/template/page',
    method: 'get',
    params
  })
}

/**
 * 查询所有模板
 */
export function getTemplateList() {
  return request({
    url: '/announcement/template/list',
    method: 'get'
  })
}

/**
 * 查询模板详情
 */
export function getTemplateDetail(id) {
  return request({
    url: `/announcement/template/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增模板
 */
export function addTemplate(data) {
  return request({
    url: '/announcement/template/add',
    method: 'post',
    data
  })
}

/**
 * 更新模板
 */
export function updateTemplate(id, data) {
  return request({
    url: `/announcement/template/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除模板（支持批量）
 */
export function deleteTemplate(ids) {
  // 如果是单个ID，转换为数组
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/announcement/template/delete',
    method: 'delete',
    data: idArray
  })
}

/**
 * 使用模板
 */
export function useTemplate(id) {
  return request({
    url: `/announcement/template/use/${id}`,
    method: 'post'
  })
}

/**
 * 复制模板
 */
export function copyTemplate(id) {
  return request({
    url: `/announcement/template/copy/${id}`,
    method: 'post'
  })
}
