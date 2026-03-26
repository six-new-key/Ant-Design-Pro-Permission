import request from '@/utils/request'

/**
 * 查询所有功能（用于下拉框和配置管理）
 */
export function getFeatureList() {
  return request({
    url: '/system_feature/list',
    method: 'get'
  })
}

/**
 * 分页查询功能
 */
export function getFeaturePage(pageNo, pageSize, keyword, groupCode) {
  return request({
    url: '/system_feature/page',
    method: 'get',
    params: { pageNo, pageSize, keyword, groupCode }
  })
}

/**
 * 切换功能开关
 */
export function toggleFeature(featureCode, enabled) {
  return request({
    url: `/system_feature/toggle/${featureCode}`,
    method: 'put',
    params: { enabled }
  })
}

/**
 * 新增功能
 */
export function addFeature(data) {
  return request({
    url: '/system_feature/add',
    method: 'post',
    data
  })
}

/**
 * 更新功能
 */
export function updateFeature(id, data) {
  return request({
    url: `/system_feature/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除功能
 */
export function deleteFeature(id) {
  return request({
    url: `/system_feature/delete/${id}`,
    method: 'delete'
  })
}
