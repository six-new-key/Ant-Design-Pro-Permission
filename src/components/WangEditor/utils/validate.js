/**
 * 验证工具函数
 */

/**
 * 验证 HTML 内容
 * @param {string} html - HTML 内容
 * @returns {boolean} 是否有效
 */
export function validateHtml(html) {
  if (typeof html !== 'string') {
    return false
  }
  return true
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大大小（字节）
 * @returns {boolean} 是否符合要求
 */
export function validateFileSize(file, maxSize) {
  if (!file || !file.size) {
    return false
  }
  return file.size <= maxSize
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string[]} allowedTypes - 允许的类型列表
 * @returns {boolean} 是否符合要求
 */
export function validateFileType(file, allowedTypes) {
  if (!file || !file.type) {
    return false
  }

  if (!allowedTypes || allowedTypes.length === 0) {
    return true
  }

  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // 通配符匹配，如 'image/*'
      const prefix = type.slice(0, -2)
      return file.type.startsWith(prefix)
    }
    return file.type === type
  })
}

/**
 * 验证 URL
 * @param {string} url - URL 地址
 * @returns {boolean} 是否有效
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    // 相对路径也认为是有效的
    return url.startsWith('/') || url.startsWith('./')
  }
}

/**
 * 验证链接
 * @param {string} url - 链接地址
 * @returns {boolean|string} true 表示通过，字符串表示错误信息
 */
export function validateLink(url) {
  if (!url) {
    return '链接不能为空'
  }

  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    return '链接必须以 http://, https:// 或 / 开头'
  }

  return true
}

/**
 * 验证图片链接
 * @param {string} src - 图片地址
 * @returns {boolean|string} true 表示通过，字符串表示错误信息
 */
export function validateImageSrc(src) {
  if (!src) {
    return '图片地址不能为空'
  }

  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/') && !src.startsWith('data:')) {
    return '图片地址必须以 http://, https://, / 或 data: 开头'
  }

  return true
}

/**
 * 验证视频链接
 * @param {string} src - 视频地址
 * @returns {boolean|string} true 表示通过，字符串表示错误信息
 */
export function validateVideoSrc(src) {
  if (!src) {
    return '视频地址不能为空'
  }

  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/')) {
    return '视频地址必须以 http://, https:// 或 / 开头'
  }

  return true
}
