/**
 * 下载文件工具函数
 */

/**
 * 下载Blob文件
 * @param {Blob} blob - 文件Blob对象
 * @param {string} filename - 文件名
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 从响应头中获取文件名
 * @param {Object} headers - 响应头对象
 * @returns {string} 文件名
 */
export function getFileNameFromHeaders(headers) {
  const contentDisposition = headers['content-disposition']
  if (contentDisposition) {
    // 尝试匹配 filename*=UTF-8''xxx 格式
    let matches = contentDisposition.match(/filename\*=UTF-8''(.+)/)
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1])
    }
    
    // 尝试匹配 filename="xxx" 格式
    matches = contentDisposition.match(/filename="?([^";\n]+)"?/)
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1])
    }
  }
  return null
}

/**
 * 下载Excel文件
 * @param {Blob} blob - 文件Blob对象
 * @param {Object} headers - 响应头对象
 * @param {string} defaultName - 默认文件名
 */
export function downloadExcel(blob, headers, defaultName = 'export.xlsx') {
  const filename = getFileNameFromHeaders(headers) || defaultName
  downloadBlob(blob, filename)
}

/**
 * 通用文件下载函数
 * @param {Blob|Response} response - 响应对象或Blob对象
 * @param {string} defaultName - 默认文件名
 */
export function downloadFile(response, defaultName = 'download.xlsx') {
  // 如果是Blob对象，直接下载
  if (response instanceof Blob) {
    downloadBlob(response, defaultName)
    return
  }
  
  // 如果是响应对象，提取Blob和headers
  if (response && response.data instanceof Blob) {
    const filename = getFileNameFromHeaders(response.headers) || defaultName
    downloadBlob(response.data, filename)
    return
  }
  
  // 兼容处理：如果response就是Blob数据
  downloadBlob(response, defaultName)
}
