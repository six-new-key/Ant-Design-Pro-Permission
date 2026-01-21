import router from '@/router'
import { settings } from './settings'
import { NProgress, initNProgress } from '@/utils'
import { useUserStore } from '@/stores'
import { AuthUtils } from "@/utils";

// 初始化NProgress配置
initNProgress()

/**
 * 全局前置守卫
 * 处理用户认证和路由权限控制
 */
router.beforeEach(async (to, from, next) => {
  // 启动NProgress进度条
  NProgress.start()

  // 获取用户存储实例
  const userStore = useUserStore();
  
  // 检查是否已登录（有有效的 Access Token 或 Refresh Token）
  if(AuthUtils.isLoggedIn()){
    //用户已登录
    if (to.path === "/login") {
      next("/");
    } else {
      // 使用 hasAddedRoutes 标志位判断动态路由是否已添加
      if (userStore.hasAddedRoutes) {
        // 动态路由已添加，直接放行
        next()
      } else {
        // 动态路由未添加，需要获取用户信息并添加路由
        try {
          const result = await userStore.getUserInfo()
          if (result === 'ok') {
            // 使用 next({ ...to, replace: true }) 重新导航，确保动态路由已完全加载
            next({ ...to, replace: true })
          } else {
            userStore.handleLogout()
            next(`/login?redirect=${to.path}`)
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          userStore.handleLogout()
          next({ path: "/login", query: { redirect: to.path } })
        }
      }
    }
  } else {
    if(to.path === '/login'){
      next()
    } else {
      next('/login')
    }
  }
})

/**
 * 全局后置钩子
 * 处理页面标题等后置逻辑
 */
router.afterEach((to) => {
  // 完成NProgress进度条
  NProgress.done()
  
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - ${settings.projectName}` : settings.projectName
})