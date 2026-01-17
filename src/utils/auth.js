import Cookies from "js-cookie";

// Token 相关配置
const TOKEN_KEY = "Authorization";

// Cookie 配置选项
const COOKIE_OPTIONS = {
  expires: 7, // 7天过期
  secure: process.env.NODE_ENV === "production", // 生产环境使用 HTTPS
  sameSite: "strict", // 防止 CSRF 攻击
};

/**
 * 认证工具类
 */
export class AuthUtils {
  /**
   * 设置认证 Token
   * @param {string} token - 认证令牌
   * @param {Object} options - Cookie 选项
   */
  static setToken(token, options = {}) {
    const cookieOptions = { ...COOKIE_OPTIONS, ...options };
    Cookies.set(TOKEN_KEY, token, cookieOptions);
  }

  /**
   * 获取认证 Token
   * @returns {string|undefined} 认证令牌
   */
  static getToken() {
    return Cookies.get(TOKEN_KEY);
  }

  /**
   * 移除认证 Token
   */
  static removeToken() {
    Cookies.remove(TOKEN_KEY);
  }

  /**
   * 检查 Token 是否即将过期
   * @param {number} threshold - 提前检查的时间（分钟）
   * @returns {boolean} 是否即将过期
   */
  static isTokenExpiringSoon(threshold = 30) {
    // 这里需要根据实际的 Token 结构来实现
    // 如果是 JWT，可以解析 payload 中的 exp 字段
    const token = this.getToken();
    if (!token) return true;

    // 简单示例：检查 Cookie 的剩余时间
    // 实际项目中应该解析 JWT 的过期时间
    return false;
  }

  /**
   * 刷新 Token
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<string>} 新的访问令牌
   */
  static async refreshToken(refreshToken) {
    // 这里应该调用后端 API 刷新 Token
    // 示例实现
    try {
      // const response = await api.post('/auth/refresh', { refreshToken })
      // const newToken = response.data.token
      // this.setToken(newToken)
      // return newToken

      console.log("Token 刷新功能需要后端 API 支持");
      return null;
    } catch (error) {
      console.error("Token 刷新失败:", error);
      this.logout(); // 刷新失败则登出
      throw error;
    }
  }
}

// 导出便捷方法
export const {
  setToken,
  getToken,
  removeToken,
  isTokenExpiringSoon,
  refreshToken,
} = AuthUtils;

// 默认导出
export default AuthUtils;
