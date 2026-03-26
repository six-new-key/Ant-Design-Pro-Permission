import request from '@/utils/request'

/**
 * 分页查询公告
 */
export function getAnnouncementPage(data) {
  return request({
    url: '/announcement/page',
    method: 'post',
    data
  })
}

/**
 * 查询公告详情
 */
export function getAnnouncementDetail(id) {
  return request({
    url: `/announcement/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增公告
 */
export function addAnnouncement(data) {
  return request({
    url: '/announcement/add',
    method: 'post',
    data
  })
}

/**
 * 更新公告
 */
export function updateAnnouncement(id, data) {
  return request({
    url: `/announcement/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除公告（支持批量）
 */
export function deleteAnnouncement(ids) {
  // 如果是单个ID，转换为数组
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/announcement/delete',
    method: 'delete',
    data: idArray
  })
}

/**
 * 发布公告
 */
export function publishAnnouncement(id) {
  return request({
    url: `/announcement/publish/${id}`,
    method: 'put'
  })
}

/**
 * 撤回公告
 */
export function revokeAnnouncement(id) {
  return request({
    url: `/announcement/revoke/${id}`,
    method: 'put'
  })
}

/**
 * 切换置顶状态
 */
export function toggleAnnouncementTop(id, isTop) {
  return request({
    url: `/announcement/top/${id}`,
    method: 'put',
    params: { isTop }
  })
}
