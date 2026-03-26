import request from '@/utils/request'

/**
 * 分页查询在线用户
 * @param {Object} data - 查询参数
 * @param {number} data.pageNo - 页码
 * @param {number} data.pageSize - 页大小
 * @param {number} data.userId - 用户ID
 * @param {string} data.username - 用户名
 * @returns {Promise}
 */
export function getOnlineUsers(data) {
  return request({
    url: '/monitor/online/users',
    method: 'post',
    data
  })
}

/**
 * 强制用户下线
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function forceLogout(userId) {
  return request({
    url: `/monitor/online/users/kickout/${userId}`,
    method: 'delete'
  })
}
