/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 清理空 HTML
 * @param {string} html - HTML 内容
 * @returns {string} 清理后的内容
 */
export function cleanEmptyHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // 只有空段落标签，返回空字符串
  const emptyPatterns = [
    '<p><br></p>',
    '<p></p>',
    '<p><br/></p>',
    '<p> </p>'
  ]

  const trimmed = html.trim()
  if (emptyPatterns.includes(trimmed)) {
    return ''
  }

  return html
}

/**
 * 转换链接 URL
 * @param {string} url - 原始 URL
 * @returns {string} 转换后的 URL
 */
export function parseLinkUrl(url) {
  if (!url) return url

  // 如果不是以 http:// 或 https:// 开头，自动添加 http://
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    return `http://${url}`
  }

  return url
}

/**
 * 转换图片 URL
 * @param {string} src - 原始图片地址
 * @returns {string} 转换后的地址
 */
export function parseImageSrc(src) {
  if (!src) return src

  // 如果不是以 http:// 或 https:// 开头，自动添加 http://
  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/') && !src.startsWith('data:')) {
    return `http://${src}`
  }

  return src
}

/**
 * 转换视频 URL
 * @param {string} src - 原始视频地址
 * @returns {string} 转换后的地址
 */
export function parseVideoSrc(src) {
  if (!src) return src

  // 如果不是以 http:// 或 https:// 开头，自动添加 http://
  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/')) {
    return `http://${src}`
  }

  return src
}

/**
 * 深度合并对象
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} 合并后的对象
 */
export function deepMerge(target, source) {
  if (!source) return target
  if (!target) return source

  const result = { ...target }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (Array.isArray(sourceValue)) {
      result[key] = sourceValue
    } else if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(targetValue || {}, sourceValue)
    } else {
      result[key] = sourceValue
    }
  })

  return result
}

/**
 * 提取纯文本
 * @param {string} html - HTML 内容
 * @returns {string} 纯文本
 */
export function extractText(html) {
  if (!html) return ''

  // 创建临时 DOM 元素
  const temp = document.createElement('div')
  temp.innerHTML = html

  return temp.textContent || temp.innerText || ''
}

/**
 * 截断文本
 * @param {string} text - 文本内容
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + suffix
}
