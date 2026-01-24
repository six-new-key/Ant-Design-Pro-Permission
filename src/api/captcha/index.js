import request from '@/utils/request'

/**
 * 生成验证码
 * @returns {Promise} 验证码信息（captchaId + base64图片）
 */
export function generateCaptcha() {
  return request({
    url: '/captcha/generate',
    method: 'get'
  })
}

/**
 * 验证验证码
 * @param {Object} data - 验证数据
 * @param {string} data.captchaId - 验证码ID
 * @param {string} data.code - 用户输入的验证码
 * @returns {Promise} 验证结果
 */
export function verifyCaptcha(data) {
  return request({
    url: '/captcha/verify',
    method: 'post',
    data
  })
}
