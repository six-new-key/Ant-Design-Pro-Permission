import { defineStore } from "pinia";
import { AuthUtils } from "@/utils";
import { ref } from "vue";
import { login, querySelf, logout } from "@/api";
import router from "@/router";
import { constantRoutes } from "@/router/routes";
import { HOME_PATH, LOGIN_PATH } from '@/constants/routes'

// 动态导入组件映射
const modules = import.meta.glob('@/views/**/*.vue')
const LayoutManager = () => import('@/layouts/LayoutManager.vue')

export const useUserStore = defineStore(
  "user",
  () => {
    const userData = ref(null);
    const menuRoutes = ref(constantRoutes);
    const permissions = ref([]);
    const hasAddedRoutes = ref(false); // 标记动态路由是否已添加（不持久化）

    // 登录方法
    const handleLogin = async (data) => {
      try {
        // 调用登录接口
        const res = await login(data);
        if (res.code === 200) {
          // 使用认证工具类保存 Token
          const tokenData = res.data;
          AuthUtils.setTokens(tokenData);
          return true;
        } else {
          return false;
        }
      } catch (error) {
        // 抛出错误，让调用方处理（包含错误码）
        throw error;
      }
    };

    /**
     * 解析组件路径
     * @param {string} componentPath - 组件路径
     * @returns {Function} 组件加载函数
     */
    const resolveComponent = (componentPath) => {
      if (!componentPath) return null
      
      // 处理 LayoutManager
      if (componentPath === 'LayoutManager') {
        return LayoutManager
      }
      
      // 处理普通组件（如 "/permission/user/User"）
      const fullPath = `/src${componentPath}.vue`
      const component = modules[fullPath]
      
      if (!component) {
        console.warn(`组件未找到: ${fullPath}`)
        return null
      }
      
      return component
    }

    /**
     * 递归处理路由配置
     * @param {Array} routes - 后端返回的路由配置
     * @returns {Array} 处理后的路由配置
     */
    const processRoutes = (routes) => {
      if (!routes || routes.length === 0) return []
      
      return routes.map(route => {
        const processedRoute = {
          path: route.path,
          name: route.name,
          component: resolveComponent(route.component),
          meta: route.meta || {}
        }
        
        if (route.redirect) {
          processedRoute.redirect = route.redirect
        }
        
        if (route.children && route.children.length > 0) {
          processedRoute.children = processRoutes(route.children)
        }
        
        return processedRoute
      })
    }

    //获取用户信息
    const getUserInfo = async () => {
      try {
        const res = await querySelf();
        if (res.code === 200) {
          const { user, routes, permissions: userPermissions } = res.data;

          // 设置用户基本信息
          userData.value = user;

          // 设置权限
          permissions.value = userPermissions || [];

          if (routes && routes.length > 0) {
            // 递归处理后端返回的路由配置
            const userAsyncRoutes = processRoutes(routes)

            // 构建菜单路由
            menuRoutes.value = [...constantRoutes, ...userAsyncRoutes]

            // 动态添加路由
            userAsyncRoutes.forEach(route => router.addRoute(route))

            // 添加 404 路由（必须最后添加）
            router.addRoute({
              path: '/:pathMatch(.*)*',
              redirect: '/404',
              name: 'any',
              meta: {
                title: '任意路由',
                hidden: true
              }
            })
          }
          
          // 标记动态路由已添加（无论是否有路由，都标记为已处理）
          hasAddedRoutes.value = true
          return "ok";
        } else {
          return Promise.reject(new Error(res.message));
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        return Promise.reject(error);
      }
    };

    //退出登录
    const handleLogout = async () => {
      try {
        // 尝试调用后端登出接口（如果 Token 有效）
        if (AuthUtils.isLoggedIn()) {
          await logout();
        }
      } catch (error) {
        // 登出接口失败（如 Token 过期）也继续执行本地清理
        console.log("后端登出接口调用失败，继续执行本地清理:", error.message);
      } finally {
        // 无论后端接口是否成功，都清除本地 Token 和数据
        AuthUtils.removeAllTokens();
        router.push(LOGIN_PATH);
        
        // 清除用户数据
        userData.value = null;
        // 清除权限
        permissions.value = [];
        // 清除菜单路由
        menuRoutes.value = constantRoutes;
        // 重置动态路由标记
        hasAddedRoutes.value = false;
      }
    };

    return {
      handleLogin,
      handleLogout,
      getUserInfo,
      userData,
      menuRoutes,
      permissions,
      hasAddedRoutes,
    };
  },
  {
    // 持久化配置
    persist: {
      key: "user-store",
      storage: localStorage,
      pick: ["userData", "permissions"], // 只持久化这两个字段
    },
  }
);
