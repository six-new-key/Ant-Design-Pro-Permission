import axios from 'axios'

// 创建专门用于验证码的axios实例（不使用项目的响应拦截器）
const captchaRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

// 只添加请求拦截器（添加Token）
captchaRequest.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers['Authorization'] = accessToken
  }
  return config
})

// 响应拦截器：直接返回data，不做任何处理（AJ-Captcha有自己的格式）
captchaRequest.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('验证码请求失败:', error)
    return Promise.reject(error)
  }
)

/**
 * 获取验证码
 * @param {Object} data - 验证码类型等参数
 * @returns {Promise}
 */
export function getCaptcha(data) {
  return captchaRequest({
    url: '/captcha/get',
    method: 'post',
    data
  })
}

/**
 * 验证验证码
 * @param {Object} data - 验证参数
 * @returns {Promise}
 */
export function checkCaptcha(data) {
  return captchaRequest({
    url: '/captcha/check',
    method: 'post',
    data
  })
}
