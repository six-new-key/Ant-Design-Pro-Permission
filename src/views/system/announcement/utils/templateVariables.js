import dayjs from 'dayjs'

/**
 * 模板变量替换工具
 */

// 支持的变量列表
export const TEMPLATE_VARIABLES = [
  { key: '{{date}}', label: '当前日期', example: '2026-02-08', description: '格式：YYYY-MM-DD' },
  { key: '{{time}}', label: '当前时间', example: '14:30:00', description: '格式：HH:mm:ss' },
  { key: '{{datetime}}', label: '完整日期时间', example: '2026-02-08 14:30:00', description: '格式：YYYY-MM-DD HH:mm:ss' },
  { key: '{{year}}', label: '年份', example: '2026', description: '四位数年份' },
  { key: '{{month}}', label: '月份', example: '02', description: '两位数月份' },
  { key: '{{day}}', label: '日期', example: '08', description: '两位数日期' },
  { key: '{{week}}', label: '星期', example: '星期六', description: '中文星期' },
  { key: '{{title}}', label: '自定义标题', example: '[标题]', description: '用户填写的标题' },
  { key: '{{content}}', label: '自定义内容', example: '[内容]', description: '用户填写的内容' }
]

// 获取星期中文
const getWeekDay = (date) => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekDays[date.getDay()]
}

/**
 * 替换模板变量
 * @param {string} text - 模板文本
 * @param {object} customData - 自定义数据 { title, content }
 * @returns {string} 替换后的文本
 */
export const replaceTemplateVariables = (text, customData = {}) => {
  if (!text) return ''
  
  const now = new Date()
  const date = dayjs(now).format('YYYY-MM-DD')
  const time = dayjs(now).format('HH:mm:ss')
  const datetime = dayjs(now).format('YYYY-MM-DD HH:mm:ss')
  const year = dayjs(now).format('YYYY')
  const month = dayjs(now).format('MM')
  const day = dayjs(now).format('DD')
  const week = getWeekDay(now)
  
  let result = text
  
  // 替换日期时间变量
  result = result.replace(/\{\{datetime\}\}/g, datetime)
  result = result.replace(/\{\{date\}\}/g, date)
  result = result.replace(/\{\{time\}\}/g, time)
  result = result.replace(/\{\{year\}\}/g, year)
  result = result.replace(/\{\{month\}\}/g, month)
  result = result.replace(/\{\{day\}\}/g, day)
  result = result.replace(/\{\{week\}\}/g, week)
  
  // 替换自定义变量
  if (customData.title) {
    result = result.replace(/\{\{title\}\}/g, customData.title)
  } else {
    // 预览时显示示例文本
    result = result.replace(/\{\{title\}\}/g, '<span style="color: #999; font-style: italic;">[请填写标题]</span>')
  }
  
  if (customData.content) {
    result = result.replace(/\{\{content\}\}/g, customData.content)
  } else {
    // 预览时显示示例文本
    result = result.replace(/\{\{content\}\}/g, '<span style="color: #999; font-style: italic;">[请填写内容]</span>')
  }
  
  return result
}

/**
 * 获取变量说明文本
 * @returns {string} 变量说明
 */
export const getVariableDescription = () => {
  return TEMPLATE_VARIABLES.map(v => `${v.key} - ${v.label}`).join('、')
}
