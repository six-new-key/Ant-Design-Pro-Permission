import request from '@/utils/request'

//请求前缀
const PREFIX = "/monitor/login_log";

/**
 * 分页查询登录日志列表
 */
export function getLoginLogList(data) {
  return request({
    url: `${PREFIX}/list`,
    method: 'post',
    data
  })
}

/**
 * 查询登录日志详情
 */
export function getLoginLogDetail(id) {
  return request({
    url: `${PREFIX}/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除登录日志
 */
export function deleteLoginLog(ids) {
  return request({
    url: `${PREFIX}/remove`,
    method: 'delete',
    data: ids
  })
}

/**
 * 清空登录日志
 */
export function cleanLoginLog() {
  return request({
    url: `${PREFIX}/clean`,
    method: 'delete'
  })
}

/**
 * 导出登录日志
 */
export function exportLoginLog(data) {
  return request({
    url: `${PREFIX}/export`,
    method: 'post',
    data,
    responseType: 'blob'
  })
}
