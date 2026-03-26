/**
 * 默认编辑器配置
 */

// 默认编辑器配置
export const DEFAULT_EDITOR_CONFIG = {
  placeholder: '请输入内容...',
  readOnly: false,
  autoFocus: false,
  scroll: true,
  maxLength: undefined,
  MENU_CONF: {}
}

/**
 * 获取编辑器配置
 * @param {object} props - 组件 props
 * @param {object} customConfig - 自定义配置
 * @returns {object} 编辑器配置
 */
export function getEditorConfig(props = {}, customConfig = {}) {
  const config = {
    ...DEFAULT_EDITOR_CONFIG,
    placeholder: props.placeholder || DEFAULT_EDITOR_CONFIG.placeholder,
    readOnly: props.readOnly || false,
    autoFocus: props.autoFocus !== undefined ? props.autoFocus : DEFAULT_EDITOR_CONFIG.autoFocus,
    scroll: props.scroll !== undefined ? props.scroll : DEFAULT_EDITOR_CONFIG.scroll,
    maxLength: props.maxLength,
    ...customConfig
  }

  // 合并 MENU_CONF
  if (customConfig.MENU_CONF) {
    config.MENU_CONF = {
      ...DEFAULT_EDITOR_CONFIG.MENU_CONF,
      ...customConfig.MENU_CONF
    }
  }

  return config
}
