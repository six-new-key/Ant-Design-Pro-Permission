import { defineStore } from "pinia";
import { AuthUtils } from "@/utils";
import { ref } from "vue";
import { login, querySelf, logout } from "@/api";
import router from "@/router";
import { constantRoutes } from "@/router/routes";
import { HOME_PATH, LOGIN_PATH } from '@/constants/routes'

// 动态导入所有组件
const modules = import.meta.glob('/src/**/*.vue')

export const useUserStore = defineStore(
  "user",
  () => {
    const userData = ref(null);
    const menuRoutes = ref(constantRoutes);
    const permissions = ref([]);
    const hasAddedRoutes = ref(false);

    // 登录方法
    const handleLogin = async (data) => {
      try {
        const res = await login(data);
        if (res.code === 200) {
          const tokenData = res.data;
          AuthUtils.setTokens(tokenData);
          return true;
        } else {
          return false;
        }
      } catch (error) {
        throw error;
      }
    };

    /**
     * 递归处理路由配置，动态加载组件
     */
    const processRoutes = (routes) => {
      if (!routes || routes.length === 0) return []
      
      return routes.map(route => {
        const processedRoute = {
          path: route.path,
          name: route.name,
          meta: route.meta || {}
        }
        
        // 处理组件加载
        if (route.meta?.isIframe) {
          // iframe 类型：使用 IframeView 组件
          const iframeComponent = modules['/src/components/core/IframeView.vue']
          if (iframeComponent) {
            processedRoute.component = iframeComponent
          } else {
            console.warn('IframeView 组件未找到')
          }
        } else if (route.component) {
          // 普通组件：动态加载（后端已返回完整路径，目录类型没有 component）
          const component = modules[route.component]
          if (component) {
            processedRoute.component = component
          } else {
            console.warn(`组件未找到: ${route.component}`)
          }
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

    // 获取用户信息
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
            // 处理后端返回的路由配置
            const processedRoutes = processRoutes(routes)

            // 包裹 LayoutManager 父路由（不显示在菜单中）
            const layoutRoute = {
              path: '/',
              name: 'Layout',
              component: modules['/src/layouts/LayoutManager.vue'],
              redirect: processedRoutes[0]?.path || '/dashboard',
              meta: {
                hidden: true  // 隐藏，不在菜单中显示
              },
              children: processedRoutes
            }

            // 构建菜单路由（只显示子路由）
            menuRoutes.value = [...constantRoutes, ...processedRoutes]

            // 动态添加路由
            router.addRoute(layoutRoute)

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
          
          // 标记动态路由已添加
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

    // 退出登录
    const handleLogout = async () => {
      try {
        if (AuthUtils.isLoggedIn()) {
          await logout();
        }
      } catch (error) {
        console.log("后端登出接口调用失败，继续执行本地清理:", error.message);
      } finally {
        AuthUtils.removeAllTokens();
        router.push(LOGIN_PATH);
        userData.value = null;
        permissions.value = [];
        menuRoutes.value = constantRoutes;
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
