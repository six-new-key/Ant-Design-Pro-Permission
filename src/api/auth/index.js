import {request} from "@/utils";

//请求前缀
const PREFIX = "/auth";

/**
 * 用户登录
 * @param {Object} data - 登录数据 { userName, password, captchaId, captchaCode, remember }
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: `${PREFIX}/login`,
    method: "POST",
    data: data,
  });
}

/**
 * 验证码登录
 * @param {Object} data - 登录数据 { phone, code }
 * @returns {Promise}
 */
export function loginByVerifyCode(data) {
  return request({
    url: `${PREFIX}/login/verify-code`,
    method: "POST",
    data: data,
  });
}

/**
 * 发送短信验证码
 * @param {Object} data - { phone: 手机号, templateCode: 模板CODE }
 * @returns {Promise}
 */
export function sendSms(data) {
  return request({
    url: '/sms/send',
    method: 'POST',
    data: data
  });
}

/**
 * 验证短信验证码
 * @param {Object} data - { phone: 手机号, code: 验证码, templateCode: 模板CODE }
 * @returns {Promise}
 */
export function verifySms(data) {
  return request({
    url: '/sms/verify',
    method: 'POST',
    data: data
  });
}

/**
 * 发送邮箱验证码
 * @param {Object} data - { email: 邮箱, scene: 业务场景 }
 * @returns {Promise}
 */
export function sendEmailVerifyCode(data) {
  return request({
    url: '/mail/send/verify-code',
    method: 'POST',
    data: data
  });
}

/**
 * 验证邮箱验证码
 * @param {Object} data - { email: 邮箱, code: 验证码, scene: 业务场景 }
 * @returns {Promise}
 */
export function verifyEmailCode(data) {
  return request({
    url: '/mail/send/verify-code/verify',
    method: 'POST',
    data: data
  });
}

/**
 * 刷新 Token
 * @returns {Promise}
 */
export function refreshToken() {
  return request({
    url: `${PREFIX}/refresh`,
    method: "POST",
  });
}

/**
 * 用户退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: `${PREFIX}/logout`,
    method: "POST"
  });
}

/**
 * 重置密码
 * @param {Object} data - { phone, code, newPassword }
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: `${PREFIX}/reset-password`,
    method: 'POST',
    data: data
  });
}

/**
 * 用户注册
 * @param {Object} data - 注册数据 { userName, password, phone, email, gender, avatar }
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: `${PREFIX}/register`,
    method: "POST",
    data: data,
  });
}
