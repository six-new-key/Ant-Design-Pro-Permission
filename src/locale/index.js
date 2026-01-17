/**
 * 语言包配置
 * 包含ant-design-vue的语言包
 * 启用后需要在vite.config.js中也配置对应的语言插件
 */

import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
// import jaJP from 'ant-design-vue/es/locale/ja_JP'
// import frFR from 'ant-design-vue/es/locale/fr_FR'
// import deDE from 'ant-design-vue/es/locale/de_DE'
// import koKR from 'ant-design-vue/es/locale/ko_KR'



// 语言包映射配置
export const localeMap = {
  'zh-cn': zhCN,
  'en': enUS,
  // 'ja': jaJP,
  // 'fr': frFR,
  // 'de': deDE,
  // 'ko': koKR,
}

// 语言选项配置（用于下拉菜单显示）
export const languageOptions = [
  { key: 'zh-cn', label: '中文', icon: 'dot' },
  { key: 'en', label: 'English', icon: 'dot' },
  // { key: 'ja', label: '日语', icon: 'dot' },
  // { key: 'fr', label: '法语', icon: 'dot' },
  // { key: 'de', label: '德语', icon: 'dot' },
  // { key: 'ko', label: '韩语', icon: 'dot' },
]

/**
 * 获取语言包
 * @param {string} language - 语言代码
 * @returns {object} - 对应的语言包
 */
export const getLocale = (language) => {
  return localeMap[language] || zhCN
}

/**
 * 获取语言选项
 * @returns {array} - 语言选项数组
 */
export const getLanguageOptions = () => {
  return languageOptions
}

/**
 * 检查语言是否支持
 * @param {string} language - 语言代码
 * @returns {boolean} - 是否支持该语言
 */
export const isSupportedLanguage = (language) => {
  return Object.keys(localeMap).includes(language)
}