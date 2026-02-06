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
