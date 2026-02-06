//对于axios进行二次封装
import axios from "axios";
import JSONBig from "json-bigint";
import { throttle } from "lodash";
import { message, AuthUtils } from "@/utils";
import { useUserStore } from "@/stores";
import { refreshToken as refreshTokenApi } from "@/api/auth";

// 创建 JSONBig 实例，配置将大数字转为字符串
const jsonBig = JSONBig({ storeAsString: true });

//配置通用的基础路径和超时时间
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
  // 使用 json-bigint 处理响应数据，避免大数字精度丢失
  transformResponse: [function (data) {
    if (typeof data === 'string') {
      try {
        return jsonBig.parse(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }]
});

// 是否正在刷新 Token 的标志
let isRefreshing = false;
// 待重试的请求队列
let requestQueue = [];

/**
 * 节流的登出函数（1秒内只执行一次）
 * 使用 throttle 而不是 debounce，因为需要立即执行第一次
 */
const throttledLogout = throttle(() => {
  const userStore = useUserStore();
  userStore.handleLogout();
}, 1000, { 
  leading: true,  // 立即执行第一次
  trailing: false // 不执行最后一次
});

/**
 * 将请求加入队列
 * @param {Object} config - 请求配置
 * @returns {Promise} 返回一个 Promise，等待 Token 刷新后重试
 */
const addRequestToQueue = (config) => {
  return new Promise((resolve, reject) => {
    requestQueue.push((newAccessToken) => {
      config.headers['Authorization'] = newAccessToken;
      resolve(axios(config));
    });
  });
};

/**
 * 刷新成功后重试队列中的所有请求
 * @param {string} newAccessToken - 新的 Access Token
 */
const retryQueue = (newAccessToken) => {
  requestQueue.forEach(cb => cb(newAccessToken));
  requestQueue = [];
};

/**
 * 刷新失败后清空队列并跳转登录页
 */
const clearQueueAndLogout = () => {
  requestQueue = [];
  throttledLogout();
};

//请求拦截器
request.interceptors.request.use((config) => {
  //config：配置对象，对象里面有一个属性很重要，headers请求头
  const accessToken = AuthUtils.getAccessToken();
  if (accessToken) {
    config.headers["Authorization"] = accessToken;
  }
  return config;
});

//响应拦截器
request.interceptors.response.use(
  async (response) => {
    //响应成功的回调
    const res = response.data;
    const code = res.code;
    const originalRequest = response.config;
    
    // 401 错误：Token 已过期，自动刷新
    if (code === 401) {
      // 如果是刷新接口本身返回 401，不再重试，直接登出
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        isRefreshing = false;
        clearQueueAndLogout();
        return Promise.reject(new Error(res.message || 'Token 刷新失败'));
      }
      
      // 如果是登出接口返回 401，说明 Token 已过期，直接清除本地数据即可
      if (originalRequest.url && originalRequest.url.includes('/auth/logout')) {
        // 不显示提示，不调用 handleLogout()，避免循环
        return Promise.reject(new Error('Token 已过期'));
      }
      
      // 标记该请求已经重试过，避免无限循环
      if (originalRequest._retry) {
        const userStore = useUserStore();
        userStore.handleLogout();
        return Promise.reject(new Error(res.message || 'Token 无效'));
      }
      
      originalRequest._retry = true;
      
      // 如果正在刷新 Token，将请求加入队列
      if (isRefreshing) {
        return addRequestToQueue(originalRequest);
      }
      
      // 开始刷新 Token
      isRefreshing = true;
      
      try {
        // 调用刷新接口（不传参数）
        const refreshRes = await refreshTokenApi();
        
        if (refreshRes.code === 200) {
          const tokenData = refreshRes.data;
          
          // 更新 Token
          AuthUtils.setTokens(tokenData);
          
          // 更新原请求的 Authorization 头
          originalRequest.headers['Authorization'] = tokenData.accessToken;
          
          // 重试队列中的所有请求
          retryQueue(tokenData.accessToken);
          
          // 重置刷新标志
          isRefreshing = false;
          
          // 重试当前请求
          return axios(originalRequest);
        } else {
          // 刷新失败，显示提示并跳转登录页
          isRefreshing = false;
          message.warning(refreshRes.message || '登录已过期，请重新登录');
          clearQueueAndLogout();
          return Promise.reject(new Error(refreshRes.message));
        }
      } catch (refreshError) {
        // 刷新失败，显示提示并跳转登录页
        isRefreshing = false;
        message.warning('登录已过期，请重新登录');
        clearQueueAndLogout();
        return Promise.reject(refreshError);
      }
    }
    
    // 402 或 405 错误：Refresh Token 过期或权限不足，强制登出
    if (code === 402 || code === 405) {
      message.warning(res.message);
      throttledLogout(); // 使用节流函数，1秒内只执行一次
      return Promise.reject(new Error(res.message));
    }
    
    // 所有非 200 的错误：统一提示
    if (code !== 200) {
      message.warning(res.message);
      // 将完整的响应数据传递给 reject，包含 code
      return Promise.reject({ code, message: res.message, data: res.data });
    }
    
    // 200 正常返回
    return res;
  },
  async (error) => {
    // 响应失败的回调（HTTP 错误状态码）
    const originalRequest = error.config;
    
    // 处理HTTP错误状态码（如403、404、500等）
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // 如果后端返回了JSON格式的错误信息
      if (data && data.message) {
        message.error(data.message);
      } else {
        // 通用错误提示
        message.error(`请求失败: ${status}`);
      }
    } else {
      message.error("网络错误，请检查网络连接");
    }
    
    return Promise.reject(error);
  }
);

//对外暴露
export default request;
