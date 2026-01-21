//对于axios进行二次封装
import axios from "axios";
import { message, AuthUtils } from "@/utils";
import { useUserStore } from "@/stores";
import { refreshToken as refreshTokenApi } from "@/api/user";

//配置通用的基础路径和超时时间
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// 是否正在刷新 Token 的标志
let isRefreshing = false;
// 待重试的请求队列
let requestQueue = [];

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
  const userStore = useUserStore();
  userStore.handleLogout();
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
    
    // 401 错误：Token 已过期，自动刷新（不提示）
    if (code === 401) {
      // 如果是刷新接口本身返回 401，不再重试，直接登出
      if (originalRequest.url && originalRequest.url.includes('/user/refresh')) {
        isRefreshing = false;
        clearQueueAndLogout();
        return Promise.reject(new Error(res.message || 'Token 刷新失败'));
      }
      
      // 如果是登出接口，直接清除 Token 并跳转登录页，不尝试刷新
      if (originalRequest.url && originalRequest.url.includes('/user/logout')) {
        const userStore = useUserStore();
        userStore.handleLogout();
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
      
      const refreshToken = AuthUtils.getRefreshToken();
      
      // 如果没有 Refresh Token，直接跳转登录页
      if (!refreshToken) {
        isRefreshing = false;
        clearQueueAndLogout();
        return Promise.reject(new Error('Refresh Token 不存在'));
      }
      
      try {
        // 调用刷新接口
        const refreshRes = await refreshTokenApi(refreshToken);
        
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
          // 刷新失败，清空队列并跳转登录页
          isRefreshing = false;
          clearQueueAndLogout();
          return Promise.reject(new Error(refreshRes.message));
        }
      } catch (refreshError) {
        // 刷新失败，清空队列并跳转登录页
        isRefreshing = false;
        clearQueueAndLogout();
        return Promise.reject(refreshError);
      }
    }
    
    // 402 或 405 错误：强制登出（不提示，后面统一提示）
    if (code === 402 || code === 405) {
      const userStore = useUserStore();
      userStore.handleLogout();
    }
    
    // 所有非 200 的错误：统一提示
    if (code !== 200) {
      message.error(res.message);
      return Promise.reject(new Error(res.message));
    }
    
    // 200 正常返回
    return res;
  },
  async (error) => {
    //响应失败的回调（HTTP 错误状态码）
    const originalRequest = error.config;
    
    // 处理HTTP错误状态码（如401、403、404、500等）
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // HTTP 401 错误：未授权（备用处理，通常不会走到这里）
      if (status === 401 && !originalRequest._retry) {
        // 如果是登出接口，直接清除 Token 并跳转登录页
        if (originalRequest.url && originalRequest.url.includes('/user/logout')) {
          const userStore = useUserStore();
          userStore.handleLogout();
          return Promise.reject(error);
        }
        
        // 标记该请求已经重试过，避免无限循环
        originalRequest._retry = true;
        
        // 如果正在刷新 Token，将请求加入队列
        if (isRefreshing) {
          return addRequestToQueue(originalRequest);
        }
        
        // 开始刷新 Token
        isRefreshing = true;
        
        const refreshToken = AuthUtils.getRefreshToken();
        
        // 如果没有 Refresh Token，直接跳转登录页
        if (!refreshToken) {
          isRefreshing = false;
          clearQueueAndLogout();
          return Promise.reject(error);
        }
        
        try {
          // 调用刷新接口
          const res = await refreshTokenApi(refreshToken);
          
          if (res.code === 200) {
            const tokenData = res.data;
            
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
            // 刷新失败，清空队列并跳转登录页
            isRefreshing = false;
            clearQueueAndLogout();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // 刷新失败，清空队列并跳转登录页
          isRefreshing = false;
          clearQueueAndLogout();
          return Promise.reject(refreshError);
        }
      }
      
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
