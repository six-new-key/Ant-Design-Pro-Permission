/**
 * 默认工具栏配置
 */

// 完整工具栏配置
export const FULL_TOOLBAR_KEYS = [
  'headerSelect',
  '|',
  'bold',
  'italic',
  'underline',
  'through',
  '|',
  'color',
  'bgColor',
  '|',
  'fontSize',
  'fontFamily',
  'lineHeight',
  '|',
  'bulletedList',
  'numberedList',
  'todo',
  '|',
  'justifyLeft',
  'justifyCenter',
  'justifyRight',
  'justifyJustify',
  '|',
  'emotion',
  'insertLink',
  'uploadImage',
  'uploadVideo',
  'insertTable',
  'codeBlock',
  'divider',
  '|',
  'undo',
  'redo',
  '|',
  'fullScreen'
]

// 简洁工具栏配置
export const SIMPLE_TOOLBAR_KEYS = [
  'headerSelect',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'color',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'insertLink',
  'uploadImage',
  '|',
  'undo',
  'redo'
]

// 默认工具栏配置
export const DEFAULT_TOOLBAR_CONFIG = {
  toolbarKeys: FULL_TOOLBAR_KEYS,
  modalAppendToBody: false
}

/**
 * 获取工具栏配置
 * @param {string} mode - 模式：'default' | 'simple'
 * @param {object} customConfig - 自定义配置
 * @returns {object} 工具栏配置
 */
export function getToolbarConfig(mode = 'default', customConfig = {}) {
  const baseConfig = {
    ...DEFAULT_TOOLBAR_CONFIG,
    toolbarKeys: mode === 'simple' ? SIMPLE_TOOLBAR_KEYS : FULL_TOOLBAR_KEYS
  }

  return {
    ...baseConfig,
    ...customConfig
  }
}
