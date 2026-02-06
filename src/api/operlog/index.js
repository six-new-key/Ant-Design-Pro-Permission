import request from '@/utils/request'

/**
 * 分页查询操作日志列表
 */
export function getOperLogList(params) {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params
  })
}

/**
 * 查询操作日志详情
 */
export function getOperLogDetail(id) {
  return request({
    url: `/monitor/operlog/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除操作日志
 */
export function deleteOperLog(ids) {
  return request({
    url: `/monitor/operlog/${ids.join(',')}`,
    method: 'delete'
  })
}

/**
 * 清空操作日志
 */
export function cleanOperLog() {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete'
  })
}
