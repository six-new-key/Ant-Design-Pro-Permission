import request from '@/utils/request'

/**
 * 分页查询在线用户
 * @param {Object} params - 查询参数
 * @param {number} params.pageNo - 页码
 * @param {number} params.pageSize - 页大小
 * @param {number} params.userId - 用户ID
 * @param {string} params.username - 用户名
 * @returns {Promise}
 */
export function getOnlineUsers(params) {
  return request({
    url: '/monitor/online/users',
    method: 'get',
    params
  })
}

/**
 * 强制用户下线
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function forceLogout(userId) {
  return request({
    url: `/monitor/online/users/${userId}`,
    method: 'delete'
  })
}
