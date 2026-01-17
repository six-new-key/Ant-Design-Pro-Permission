// 统一导出工具函数
export { default as message } from "./message.js";
export { default as notification } from "./notification.js";
// 为了兼容性，也导出大写版本
export { default as Message } from "./message.js";
export { default as Notification } from "./notification.js";

export { default as layoutConfig } from "./layout.config.js";

// 认证相关工具函数
export { default as AuthUtils } from "./auth.js";

// 主题相关工具函数 - 占位符
export { themeChangeWithAnimation, COLOR_PRESETS, rgbToHex } from "./themes.js";

// 页面动画配置
export {
  PAGE_ANIMATION_CONFIG,
  PAGE_ANIMATIONS,
} from "./pageAnimationConfig.js";

// 进度条
export {
  NProgress,
  initNProgress,
  configureNProgress,
  setNProgressStyle,
} from "./nprogress.js";

// 搜索相关工具函数
export {
  getAllMenuItems,
  searchMenuItems,
  highlightText,
} from "./searchUtils.js";

// 动态背景库加载器
export {
  loadDynamicBgLibraries,
  isDynamicBgLoaded,
  getLoadedBgTypes,
} from "./dynamicBgLoader.js";

// 渐变背景工具函数
export {
  createDynamicBg,
  destroyDynamicBg,
  dynamicBgManager,
  generateThemeColors,
  DYNAMIC_BG_TYPES,
} from "./buildGradientBg.js";

// 导出 axios 实例
export { default as request } from "./request.js";

// 导出通用工具函数
export { createConversationLabel } from "./common.js";

export { generateUniqueId } from "./generateId.js";
