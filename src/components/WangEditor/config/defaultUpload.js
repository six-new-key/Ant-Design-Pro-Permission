/**
 * 默认上传配置
 */

// 默认图片上传配置
export const DEFAULT_IMAGE_UPLOAD_CONFIG = {
  server: '/api/upload/image',
  fieldName: 'file',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxNumberOfFiles: 10,
  allowedFileTypes: ['image/*'],
  withCredentials: true,
  timeout: 10 * 1000, // 10秒
  base64LimitSize: 5 * 1024, // 5KB 以下使用 base64
  meta: {},
  metaWithUrl: false,
  headers: {}
}

// 默认视频上传配置
export const DEFAULT_VIDEO_UPLOAD_CONFIG = {
  server: '/api/upload/video',
  fieldName: 'file',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxNumberOfFiles: 5,
  allowedFileTypes: ['video/*'],
  withCredentials: true,
  timeout: 60 * 1000, // 60秒
  meta: {},
  metaWithUrl: false,
  headers: {}
}

/**
 * 获取图片上传配置
 * @param {object} uploadConfig - 自定义上传配置
 * @param {object} callbacks - 回调函数
 * @returns {object} 图片上传配置
 */
export function getImageUploadConfig(uploadConfig = {}, callbacks = {}) {
  const config = {
    ...DEFAULT_IMAGE_UPLOAD_CONFIG,
    ...uploadConfig
  }

  // 添加回调函数
  if (callbacks.onBeforeUpload) {
    config.onBeforeUpload = callbacks.onBeforeUpload
  }

  if (callbacks.onProgress) {
    config.onProgress = callbacks.onProgress
  }

  if (callbacks.onSuccess) {
    config.onSuccess = callbacks.onSuccess
  }

  if (callbacks.onFailed) {
    config.onFailed = callbacks.onFailed
  }

  if (callbacks.onError) {
    config.onError = callbacks.onError
  }

  // 自定义插入
  if (callbacks.customInsert) {
    config.customInsert = callbacks.customInsert
  }

  // 自定义上传
  if (callbacks.customUpload) {
    config.customUpload = callbacks.customUpload
  }

  // 自定义选择
  if (callbacks.customBrowseAndUpload) {
    config.customBrowseAndUpload = callbacks.customBrowseAndUpload
  }

  return config
}

/**
 * 获取视频上传配置
 * @param {object} uploadConfig - 自定义上传配置
 * @param {object} callbacks - 回调函数
 * @returns {object} 视频上传配置
 */
export function getVideoUploadConfig(uploadConfig = {}, callbacks = {}) {
  const config = {
    ...DEFAULT_VIDEO_UPLOAD_CONFIG,
    ...uploadConfig
  }

  // 添加回调函数
  if (callbacks.onBeforeUpload) {
    config.onBeforeUpload = callbacks.onBeforeUpload
  }

  if (callbacks.onProgress) {
    config.onProgress = callbacks.onProgress
  }

  if (callbacks.onSuccess) {
    config.onSuccess = callbacks.onSuccess
  }

  if (callbacks.onFailed) {
    config.onFailed = callbacks.onFailed
  }

  if (callbacks.onError) {
    config.onError = callbacks.onError
  }

  // 自定义插入
  if (callbacks.customInsert) {
    config.customInsert = callbacks.customInsert
  }

  // 自定义上传
  if (callbacks.customUpload) {
    config.customUpload = callbacks.customUpload
  }

  // 自定义选择
  if (callbacks.customBrowseAndUpload) {
    config.customBrowseAndUpload = callbacks.customBrowseAndUpload
  }

  return config
}
