import request from '@/utils/request'

/**
 * 分页查询登录日志列表
 */
export function getLoginLogList(params) {
  return request({
    url: '/monitor/logininfor/list',
    method: 'get',
    params
  })
}

/**
 * 查询登录日志详情
 */
export function getLoginLogDetail(id) {
  return request({
    url: `/monitor/logininfor/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除登录日志
 */
export function deleteLoginLog(ids) {
  return request({
    url: `/monitor/logininfor/${ids.join(',')}`,
    method: 'delete'
  })
}

/**
 * 清空登录日志
 */
export function cleanLoginLog() {
  return request({
    url: '/monitor/logininfor/clean',
    method: 'delete'
  })
}
