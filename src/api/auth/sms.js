import request from '@/utils/request'

/**
 * 发送短信验证码
 * @param {Object} data - { phone: 手机号, templateCode: 模板CODE(100001-100005) }
 */
export const sendSms = (data) => {
  return request({
    url: '/sms/send',
    method: 'post',
    data
  })
}

/**
 * 验证码登录
 * @param {Object} data - { phone: 手机号, code: 验证码 }
 */
export const loginByVerifyCode = (data) => {
  return request({
    url: '/auth/login/verify-code',
    method: 'post',
    data
  })
}
