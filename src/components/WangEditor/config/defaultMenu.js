/**
 * 默认菜单配置
 */

// 默认颜色列表
export const DEFAULT_COLORS = [
  '#000000',
  '#ffffff',
  '#eeece0',
  '#1c487f',
  '#4d80bf',
  '#c24f4a',
  '#8baa4a',
  '#7b5ba1',
  '#46acc8',
  '#f9963b',
  '#cccccc',
  '#999999',
  '#666666',
  '#333333',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#00ffff',
  '#ff00ff'
]

// 默认字号列表
export const DEFAULT_FONT_SIZES = [
  '12px',
  '13px',
  '14px',
  '15px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '48px'
]

// 默认字体列表
export const DEFAULT_FONT_FAMILIES = [
  '黑体',
  '仿宋',
  '楷体',
  '标楷体',
  '华文仿宋',
  '华文楷体',
  '宋体',
  '微软雅黑',
  'Arial',
  'Tahoma',
  'Verdana',
  'Times New Roman',
  'Courier New'
]

// 默认行高列表
export const DEFAULT_LINE_HEIGHTS = [
  '1',
  '1.15',
  '1.5',
  '1.6',
  '2',
  '2.5',
  '3'
]

// 默认表情列表
export const DEFAULT_EMOTIONS = '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕'.split(' ')

// 默认代码语言列表
export const DEFAULT_CODE_LANGS = [
  { text: 'CSS', value: 'css' },
  { text: 'HTML', value: 'html' },
  { text: 'XML', value: 'xml' },
  { text: 'JavaScript', value: 'javascript' },
  { text: 'TypeScript', value: 'typescript' },
  { text: 'JSX', value: 'jsx' },
  { text: 'Java', value: 'java' },
  { text: 'Python', value: 'python' },
  { text: 'C', value: 'c' },
  { text: 'C++', value: 'cpp' },
  { text: 'C#', value: 'csharp' },
  { text: 'PHP', value: 'php' },
  { text: 'Go', value: 'go' },
  { text: 'SQL', value: 'sql' },
  { text: 'JSON', value: 'json' },
  { text: 'Bash', value: 'bash' }
]

/**
 * 获取菜单配置
 * @param {object} menuConfig - 自定义菜单配置
 * @returns {object} 菜单配置
 */
export function getMenuConfig(menuConfig = {}) {
  const config = {}

  // 颜色配置
  if (menuConfig.colors) {
    config.color = { colors: menuConfig.colors }
    config.bgColor = { colors: menuConfig.colors }
  } else {
    config.color = { colors: DEFAULT_COLORS }
    config.bgColor = { colors: DEFAULT_COLORS }
  }

  // 字号配置
  if (menuConfig.fontSizes) {
    config.fontSize = { fontSizeList: menuConfig.fontSizes }
  } else {
    config.fontSize = { fontSizeList: DEFAULT_FONT_SIZES }
  }

  // 字体配置
  if (menuConfig.fontFamilies) {
    config.fontFamily = { fontFamilyList: menuConfig.fontFamilies }
  } else {
    config.fontFamily = { fontFamilyList: DEFAULT_FONT_FAMILIES }
  }

  // 行高配置
  if (menuConfig.lineHeights) {
    config.lineHeight = { lineHeightList: menuConfig.lineHeights }
  } else {
    config.lineHeight = { lineHeightList: DEFAULT_LINE_HEIGHTS }
  }

  // 表情配置
  if (menuConfig.emotions) {
    config.emotion = { emotions: menuConfig.emotions }
  } else {
    config.emotion = { emotions: DEFAULT_EMOTIONS }
  }

  // 代码语言配置
  if (menuConfig.codeLangs) {
    config.codeSelectLang = { codeLangs: menuConfig.codeLangs }
  } else {
    config.codeSelectLang = { codeLangs: DEFAULT_CODE_LANGS }
  }

  return config
}
