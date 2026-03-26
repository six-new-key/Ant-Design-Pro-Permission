/**
 * 模板分类常量
 */

// 模板分类枚举
export const TEMPLATE_CATEGORIES = {
  DEFAULT: 'default',
  NOTICE: 'notice',
  ACTIVITY: 'activity',
  MAINTENANCE: 'maintenance',
  EMERGENCY: 'emergency'
}

// 模板分类选项
export const TEMPLATE_CATEGORY_OPTIONS = [
  { label: '默认', value: 'default', color: 'default' },
  { label: '通知类', value: 'notice', color: 'blue' },
  { label: '活动类', value: 'activity', color: 'purple' },
  { label: '维护类', value: 'maintenance', color: 'orange' },
  { label: '紧急类', value: 'emergency', color: 'red' }
]

// 获取分类标签
export const getCategoryLabel = (category) => {
  const option = TEMPLATE_CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option ? option.label : '未知'
}

// 获取分类颜色
export const getCategoryColor = (category) => {
  const option = TEMPLATE_CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option ? option.color : 'default'
}
