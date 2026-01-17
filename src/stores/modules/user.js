import { defineStore } from "pinia";
import { AuthUtils } from "@/utils";
import { ref } from "vue";
import { login, querySelf, logout } from "@/api";
import { message } from "@/utils";
import router from "@/router";
import { cloneDeep } from "lodash-es";
import { constantRoutes, asyncRoutes, anyRoutes } from "@/router/routes";

export const useUserStore = defineStore(
  "user",
  () => {
    const userData = ref(null);
    const menuRoutes = ref(constantRoutes);
    const permissions = ref([]);

    // 登录方法
    const handleLogin = async (data) => {
      // 调用登录接口
      const res = await login(data);
      if (res.code === 200) {
        // 使用认证工具类保存用户token
        AuthUtils.setToken(res.data, {
          expires: 7, // Token 7天过期
          secure: process.env.NODE_ENV === "production",
        });

        return true;
      } else {
        return false;
      }
    };

    //获取用户信息
    const getUserInfo = async () => {
      try {
        // 调用登录接口
        const res = await querySelf();
        if (res.code === 200) {
          const { user, routes, permissions: userPermissions } = res.data;

          // 设置用户基本信息
          userData.value = user;

          // 设置权限
          permissions.value = userPermissions || [];

          if (routes !== undefined) {
            // 根据后端返回的路由名称过滤本地的asyncRoutes
            const userAsyncRoutes = filterAsyncRoute(
              cloneDeep(asyncRoutes),
              routes
            );

            // 菜单需要的路由数据整理完毕，相当于数组合并
            // (页面刷新白屏解决)一定要把任意路由加到数组最后
            menuRoutes.value = [
              ...constantRoutes,
              ...userAsyncRoutes,
              anyRoutes
            ]

            //动态路由追加
            userAsyncRoutes.forEach((route) => {
              router.addRoute(route);
            });

            router.addRoute(anyRoutes)

            console.log("最终菜单数据===>",menuRoutes.value)
          }
          return "ok";
        } else {
          return Promise.reject(new Error(response.message));
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        return Promise.reject(error);
      }
    };

    //退出登录
    const handleLogout = () => {
      // 使用认证工具类清除登录信息
      AuthUtils.removeToken();
      router.push("/login");
      message.success("退出登录成功");

      // 清除用户数据
      userData.value = null;
      // 清除权限
      permissions.value = [];
      // 清除菜单路由
      menuRoutes.value = constantRoutes;
    };

    // 根据路由名称数组过滤异步路由
    const filterAsyncRoute = (asyncRoutes, routes) => {
      return asyncRoutes.filter((route) => {
        // 检查当前路由是否在允许的名称列表中
        if (routes.includes(route.name)) {
          // 如果有子路由，递归过滤子路由
          if (route.children && route.children.length > 0) {
            route.children = filterAsyncRoute(route.children, routes);
          }
          return true;
        }
        return false;
      });
    };

    return {
      handleLogin,
      handleLogout,
      getUserInfo,
      userData,
      menuRoutes,
      permissions,
    };
  },
  {
    // 持久化配置
    persist: {
      key: "user-store",
      storage: localStorage,
      paths: ["userData", "menuRoutes", "permissions"],
    },
  }
);
