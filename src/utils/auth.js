import Cookies from "js-cookie";

// Token 相关配置
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ACCESS_TOKEN_EXPIRE_KEY = "access_token_expire";
const REFRESH_TOKEN_EXPIRE_KEY = "refresh_token_expire";

// Cookie 配置选项
const COOKIE_OPTIONS = {
  expires: 7, // 7天过期
  secure: process.env.NODE_ENV === "production", // 生产环境使用 HTTPS
  sameSite: "strict", // 防止 CSRF 攻击
};

/**
 * 认证工具类（双 Token 机制）
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

  // ==================== Refresh Token 管理 ====================
  
  /**
   * 设置 Refresh Token（存储到 Cookie）
   * @param {string} token - Refresh Token
   * @param {boolean} remember - 是否记住我
   * @param {Object} options - Cookie 选项
   */
  static setRefreshToken(token, remember = false, options = {}) {
    // 根据"记住我"状态设置不同的过期时间
    const expires = remember ? 30 : 7; // 记住我：30天，否则：7天
    
    const cookieOptions = { 
      ...COOKIE_OPTIONS, 
      expires, // 覆盖默认的过期时间
      ...options 
    };
    Cookies.set(REFRESH_TOKEN_KEY, token, cookieOptions);
  }

  /**
   * 获取 Refresh Token
   * @returns {string|undefined} Refresh Token
   */
  static getRefreshToken() {
    return Cookies.get(REFRESH_TOKEN_KEY);
  }

  /**
   * 移除 Refresh Token
   */
  static removeRefreshToken() {
    Cookies.remove(REFRESH_TOKEN_KEY);
  }

  // ==================== Token 过期时间管理 ====================
  
  /**
   * 设置 Token 过期时间
   * @param {number} accessExpire - Access Token 过期时间（时间戳，毫秒）
   * @param {number} refreshExpire - Refresh Token 过期时间（时间戳，毫秒）
   */
  static setTokenExpireTime(accessExpire, refreshExpire) {
    sessionStorage.setItem(ACCESS_TOKEN_EXPIRE_KEY, accessExpire.toString());
    sessionStorage.setItem(REFRESH_TOKEN_EXPIRE_KEY, refreshExpire.toString());
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
   * 获取 Refresh Token 过期时间
   * @returns {number|null} 过期时间（时间戳，毫秒）
   */
  static getRefreshTokenExpireTime() {
    const expire = sessionStorage.getItem(REFRESH_TOKEN_EXPIRE_KEY);
    return expire ? parseInt(expire) : null;
  }

  /**
   * 移除 Token 过期时间
   */
  static removeTokenExpireTime() {
    sessionStorage.removeItem(ACCESS_TOKEN_EXPIRE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_EXPIRE_KEY);
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
    // return Date.now() >= (expireTime - 30000);
    // 测试配置（改为）：提前 5 秒判断为过期
    return Date.now() >= (expireTime - 3000);
  }

  /**
   * 判断 Refresh Token 是否过期
   * @returns {boolean} true=已过期，false=未过期
   */
  static isRefreshTokenExpired() {
    const expireTime = this.getRefreshTokenExpireTime();
    if (!expireTime) return true;
    
    return Date.now() >= expireTime;
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
   * 设置双 Token 和过期时间
   * @param {Object} tokenData - Token 数据对象
   * @param {string} tokenData.accessToken - Access Token
   * @param {string} tokenData.refreshToken - Refresh Token
   * @param {number} tokenData.accessTokenExpireTime - Access Token 过期时间
   * @param {number} tokenData.refreshTokenExpireTime - Refresh Token 过期时间
   * @param {boolean} remember - 是否记住我（可选，用于设置 Cookie 过期时间）
   */
  static setTokens(tokenData, remember = false) {
    const { accessToken, refreshToken, accessTokenExpireTime, refreshTokenExpireTime } = tokenData;
    
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken, remember);
    this.setTokenExpireTime(accessTokenExpireTime, refreshTokenExpireTime);
  }

  /**
   * 移除所有 Token 和过期时间
   */
  static removeAllTokens() {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeTokenExpireTime();
  }

  /**
   * 检查是否已登录（有有效的 Access Token 或 Refresh Token）
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // 如果有 Access Token 且未过期，或者有 Refresh Token 且未过期
    return (accessToken && !this.isAccessTokenExpired()) || 
           (refreshToken && !this.isRefreshTokenExpired());
  }

  // ==================== 兼容旧方法（保持向后兼容） ====================
  
  /**
   * 设置 Token（兼容旧代码，实际设置 Access Token）
   * @deprecated 请使用 setTokens() 方法
   */
  static setToken(token, options = {}) {
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
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  setTokenExpireTime,
  getAccessTokenExpireTime,
  getRefreshTokenExpireTime,
  removeTokenExpireTime,
  isAccessTokenExpired,
  isRefreshTokenExpired,
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
