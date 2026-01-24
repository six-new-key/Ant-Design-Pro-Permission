// Token 相关配置
const ACCESS_TOKEN_KEY = "access_token";
const ACCESS_TOKEN_EXPIRE_KEY = "access_token_expire";

/**
 * 认证工具类（双 Token 机制）
 * 
 * 安全优化说明：
 * 1. Refresh Token 由后端通过 HttpOnly Cookie 管理，前端无法访问
 * 2. Access Token 存储在 sessionStorage，关闭标签页即清除
 * 3. 前端只管理 Access Token 和过期时间
 */
export class AuthUtils {
  // ==================== Access Token 管理 ====================
  
  /**
   * 设置 Access Token（存储到 sessionStorage）
   * @param {string} token - Access Token
   */
  static setAccessToken(token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  /**
   * 获取 Access Token
   * @returns {string|null} Access Token
   */
  static getAccessToken() {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * 移除 Access Token
   */
  static removeAccessToken() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  // ==================== Token 过期时间管理 ====================
  
  /**
   * 设置 Access Token 过期时间
   * @param {number} accessExpire - Access Token 过期时间（时间戳，毫秒）
   */
  static setTokenExpireTime(accessExpire) {
    sessionStorage.setItem(ACCESS_TOKEN_EXPIRE_KEY, accessExpire.toString());
  }

  /**
   * 获取 Access Token 过期时间
   * @returns {number|null} 过期时间（时间戳，毫秒）
   */
  static getAccessTokenExpireTime() {
    const expire = sessionStorage.getItem(ACCESS_TOKEN_EXPIRE_KEY);
    return expire ? parseInt(expire) : null;
  }

  /**
   * 移除 Token 过期时间
   */
  static removeTokenExpireTime() {
    sessionStorage.removeItem(ACCESS_TOKEN_EXPIRE_KEY);
  }

  // ==================== Token 状态检查 ====================
  
  /**
   * 判断 Access Token 是否过期
   * @returns {boolean} true=已过期，false=未过期
   */
  static isAccessTokenExpired() {
    const expireTime = this.getAccessTokenExpireTime();
    if (!expireTime) return true;
    
    // 提前 30 秒判断为过期，避免临界状态
    return Date.now() >= (expireTime - 30000);
  }

  /**
   * 检查 Access Token 是否即将过期
   * @param {number} threshold - 提前检查的时间（分钟）
   * @returns {boolean} 是否即将过期
   */
  static isAccessTokenExpiringSoon(threshold = 5) {
    const expireTime = this.getAccessTokenExpireTime();
    if (!expireTime) return true;

    const thresholdMs = threshold * 60 * 1000;
    return Date.now() >= (expireTime - thresholdMs);
  }

  // ==================== 统一 Token 管理 ====================
  
  /**
   * 设置 Token 和过期时间
   * @param {Object} tokenData - Token 数据对象
   * @param {string} tokenData.accessToken - Access Token
   * @param {number} tokenData.accessTokenExpireTime - Access Token 过期时间
   * 
   * 注意：Refresh Token 已由后端通过 HttpOnly Cookie 设置，前端不再处理
   */
  static setTokens(tokenData) {
    const { accessToken, accessTokenExpireTime } = tokenData;
    
    this.setAccessToken(accessToken);
    this.setTokenExpireTime(accessTokenExpireTime);
  }

  /**
   * 移除所有 Token 和过期时间
   * 
   * 注意：Refresh Token Cookie 由后端清除（调用 /user/logout 接口）
   */
  static removeAllTokens() {
    this.removeAccessToken();
    this.removeTokenExpireTime();
  }

  /**
   * 检查是否已登录（只检查 Access Token 是否存在）
   * 
   * 注意：不检查 Access Token 是否过期，因为：
   * 1. 如果 Access Token 过期，会在 API 请求时自动刷新
   * 2. 只有当 Refresh Token 也过期时，才会真正退出登录
   * 
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    const accessToken = this.getAccessToken();
    
    // 只检查 Access Token 是否存在（不检查是否过期）
    return !!accessToken;
  }

  // ==================== 兼容旧方法（保持向后兼容） ====================
  
  /**
   * 设置 Token（兼容旧代码，实际设置 Access Token）
   * @deprecated 请使用 setTokens() 方法
   */
  static setToken(token) {
    this.setAccessToken(token);
  }

  /**
   * 获取 Token（兼容旧代码，实际获取 Access Token）
   * @deprecated 请使用 getAccessToken() 方法
   */
  static getToken() {
    return this.getAccessToken();
  }

  /**
   * 移除 Token（兼容旧代码，实际移除所有 Token）
   * @deprecated 请使用 removeAllTokens() 方法
   */
  static removeToken() {
    this.removeAllTokens();
  }
}

// 导出便捷方法
export const {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  setTokenExpireTime,
  getAccessTokenExpireTime,
  removeTokenExpireTime,
  isAccessTokenExpired,
  isAccessTokenExpiringSoon,
  setTokens,
  removeAllTokens,
  isLoggedIn,
  // 兼容旧方法
  setToken,
  getToken,
  removeToken,
} = AuthUtils;

// 默认导出
export default AuthUtils;
