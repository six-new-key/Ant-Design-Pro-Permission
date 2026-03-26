import request from '@/utils/request'

/**
 * 获取服务监控信息
 */
export function getServerMonitorInfo() {
  return request({
    url: '/server/monitor',
    method: 'get'
  })
}
