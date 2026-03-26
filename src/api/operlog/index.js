import request from '@/utils/request'

//请求前缀
const PREFIX = "/monitor/oper_log";

/**
 * 分页查询操作日志列表
 */
export function getOperLogList(data) {
  return request({
    url: `${PREFIX}/list`,
    method: 'post',
    data
  })
}

/**
 * 查询操作日志详情
 */
export function getOperLogDetail(id) {
  return request({
    url: `${PREFIX}/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除操作日志
 */
export function deleteOperLog(ids) {
  return request({
    url: `${PREFIX}/remove`,
    method: 'delete',
    data: ids
  })
}

/**
 * 清空操作日志
 */
export function cleanOperLog() {
  return request({
    url: `${PREFIX}/clean`,
    method: 'delete'
  })
}

/**
 * 导出操作日志
 */
export function exportOperLog(data) {
  return request({
    url: `${PREFIX}/export`,
    method: 'post',
    data,
    responseType: 'blob'
  })
}
