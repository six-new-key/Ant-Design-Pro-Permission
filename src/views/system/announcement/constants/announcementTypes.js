/**
 * 公告类型
 */
export const ANNOUNCEMENT_TYPES = {
  SYSTEM: 1,      // 系统通知
  FEATURE: 2,     // 功能更新
  MAINTENANCE: 3, // 维护公告
  ACTIVITY: 4     // 活动公告
}

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { label: '系统通知', value: 1, color: 'blue' },
  { label: '功能更新', value: 2, color: 'green' },
  { label: '维护公告', value: 3, color: 'orange' },
  { label: '活动公告', value: 4, color: 'purple' }
]

/**
 * 重要级别
 */
export const ANNOUNCEMENT_LEVELS = {
  NORMAL: 1,   // 普通
  IMPORTANT: 2, // 重要
  URGENT: 3    // 紧急
}

export const ANNOUNCEMENT_LEVEL_OPTIONS = [
  { label: '普通', value: 1, color: 'default' },
  { label: '重要', value: 2, color: 'orange' },
  { label: '紧急', value: 3, color: 'red' }
]

/**
 * 状态
 */
export const ANNOUNCEMENT_STATUS = {
  DRAFT: 0,      // 草稿
  PUBLISHED: 1,  // 已发布
  REVOKED: 2     // 已撤回
}

export const ANNOUNCEMENT_STATUS_OPTIONS = [
  { label: '草稿', value: 0, color: 'default' },
  { label: '已发布', value: 1, color: 'success' },
  { label: '已撤回', value: 2, color: 'warning' }
]

/**
 * 获取类型标签
 */
export function getTypeLabel(type) {
  const option = ANNOUNCEMENT_TYPE_OPTIONS.find(opt => opt.value === type)
  return option ? option.label : type
}

/**
 * 获取类型颜色
 */
export function getTypeColor(type) {
  const option = ANNOUNCEMENT_TYPE_OPTIONS.find(opt => opt.value === type)
  return option ? option.color : 'default'
}

/**
 * 获取级别标签
 */
export function getLevelLabel(level) {
  const option = ANNOUNCEMENT_LEVEL_OPTIONS.find(opt => opt.value === level)
  return option ? option.label : level
}

/**
 * 获取级别颜色
 */
export function getLevelColor(level) {
  const option = ANNOUNCEMENT_LEVEL_OPTIONS.find(opt => opt.value === level)
  return option ? option.color : 'default'
}

/**
 * 获取状态标签
 */
export function getStatusLabel(status) {
  const option = ANNOUNCEMENT_STATUS_OPTIONS.find(opt => opt.value === status)
  return option ? option.label : status
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status) {
  const option = ANNOUNCEMENT_STATUS_OPTIONS.find(opt => opt.value === status)
  return option ? option.color : 'default'
}
