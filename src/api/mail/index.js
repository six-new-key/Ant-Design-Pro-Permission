import request from '@/utils/request'

// ==================== 模板管理 ====================

/**
 * 查询所有启用的模板
 */
export function listAllEnabledTemplates() {
  return request({
    url: '/mail/template/list',
    method: 'get'
  })
}

/**
 * 分页查询模板
 */
export function queryTemplatePage(params) {
  return request({
    url: '/mail/template/page',
    method: 'get',
    params
  })
}

/**
 * 查询模板详情
 */
export function getTemplateById(id) {
  return request({
    url: `/mail/template/${id}`,
    method: 'get'
  })
}

/**
 * 新增模板
 */
export function addTemplate(data) {
  return request({
    url: '/mail/template/add',
    method: 'post',
    data
  })
}

/**
 * 更新模板
 */
export function updateTemplate(id, data) {
  return request({
    url: `/mail/template/edit/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除模板
 */
export function deleteTemplate(id) {
  return request({
    url: `/mail/template/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 切换模板状态
 */
export function toggleTemplateStatus(id, status) {
  return request({
    url: `/mail/template/toggle/${id}`,
    method: 'put',
    params: { status }
  })
}

/**
 * 预览模板
 */
export function previewTemplate(id, params) {
  return request({
    url: `/mail/template/${id}/preview`,
    method: 'post',
    data: params
  })
}

// ==================== 邮件发送 ====================

/**
 * 发送邮件（统一入口）
 */
export function sendMail(data) {
  return request({
    url: '/mail/send',
    method: 'post',
    data
  })
}

/**
 * 重新发送失败邮件
 */
export function resendMail(recordId) {
  return request({
    url: `/mail/send/resend/${recordId}`,
    method: 'post'
  })
}

/**
 * 批量重新发送邮件
 */
export function batchResendMail(recordIds) {
  return request({
    url: '/mail/send/resend/batch',
    method: 'post',
    data: recordIds
  })
}

// ==================== 发送记录 ====================

/**
 * 分页查询记录
 */
export function queryRecordPage(params) {
  return request({
    url: '/mail/record/page',
    method: 'get',
    params
  })
}

/**
 * 查询记录详情
 */
export function getRecordById(id) {
  return request({
    url: `/mail/record/${id}`,
    method: 'get'
  })
}

/**
 * 删除记录
 */
export function deleteRecord(id) {
  return request({
    url: '/mail/record/delete',
    method: 'delete',
    data: {
      ids: [id]
    }
  })
}

/**
 * 批量删除记录
 */
export function batchDeleteRecord(recordIds) {
  return request({
    url: '/mail/record/delete',
    method: 'delete',
    data: recordIds
  })
}

/**
 * 获取统计数据
 */
export function getStatistics() {
  return request({
    url: '/mail/record/statistics',
    method: 'get'
  })
}
