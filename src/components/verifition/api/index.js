/**
 * 验证码 API 接口
 * 重构说明：使用项目统一的 API 管理，不再使用组件内部的 axios
 */

// 引用项目主 API
export { getCaptcha as reqGet, checkCaptcha as reqCheck } from '@/api/captcha'


