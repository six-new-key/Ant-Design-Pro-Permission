/**
 * 系统配置类型常量
 */
export const CONFIG_TYPES = {
  BOOLEAN: 'boolean',
  STRING: 'string',
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  JSON: 'json'
}

/**
 * 配置类型选项（用于下拉选择）
 */
export const CONFIG_TYPE_OPTIONS = [
  { label: '布尔型（开关）', value: CONFIG_TYPES.BOOLEAN },
  { label: '字符串', value: CONFIG_TYPES.STRING },
  { label: '长文本', value: CONFIG_TYPES.TEXT },
  { label: '数字', value: CONFIG_TYPES.NUMBER },
  { label: '下拉选择', value: CONFIG_TYPES.SELECT },
  { label: 'JSON对象', value: CONFIG_TYPES.JSON }
]

/**
 * 配置类型颜色映射
 */
export const CONFIG_TYPE_COLORS = {
  [CONFIG_TYPES.BOOLEAN]: 'green',
  [CONFIG_TYPES.STRING]: 'blue',
  [CONFIG_TYPES.TEXT]: 'cyan',
  [CONFIG_TYPES.NUMBER]: 'orange',
  [CONFIG_TYPES.SELECT]: 'purple',
  [CONFIG_TYPES.JSON]: 'magenta'
}

/**
 * 配置类型标签映射
 */
export const CONFIG_TYPE_LABELS = {
  [CONFIG_TYPES.BOOLEAN]: '布尔型',
  [CONFIG_TYPES.STRING]: '字符串',
  [CONFIG_TYPES.TEXT]: '长文本',
  [CONFIG_TYPES.NUMBER]: '数字',
  [CONFIG_TYPES.SELECT]: '下拉选择',
  [CONFIG_TYPES.JSON]: 'JSON对象'
}

/**
 * Select模式选项
 */
export const SELECT_MODE_OPTIONS = [
  { label: '单选', value: 'single' },
  { label: '多选', value: 'multiple' },
  { label: '标签', value: 'tags' }
]
