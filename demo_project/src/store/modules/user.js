import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/user'
import { constantRoutes, asyncRoutes, anyRoutes } from '@/router/routes'
import router from '@/router'
import { cloneDeep } from 'lodash-es'
import { SET_TOKEN, REMOVE_TOKEN, GET_TOKEN } from './token'

export const useUserStore = defineStore('user', {
  // state
  state: () => ({
    userInfo: null,
    token: GET_TOKEN(),
    menuRoutes: constantRoutes,
    permissions: []
  }),

  // getters
  getters: {
    username: (state) => state.userInfo?.username || '',
    isLoggedIn: (state) => !!state.token && !!state.userInfo
  },

  // actions
  actions: {
    setUserInfo(info) {
      this.userInfo = info
    },

    // 设置token
    setToken(newToken) {
      this.token = newToken
      SET_TOKEN(newToken)
    },

    // 登录
    async login(loginData) {
      try {
        const response = await loginApi(loginData)
        if (response.code === 200) {
          this.setToken(response.data)
          return { success: true, data: response.data }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error) {
        console.error('登录请求失败:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 退出登录
    async logout() {
      try {
        // 调用后端退出登录API
        await logoutApi()
      } catch (error) {
        console.error('调用退出登录API失败:', error)
      } finally {
        // 无论API调用是否成功，都清除本地状态
        this.userInfo = null
        this.token = null
        REMOVE_TOKEN()
        this.permissions = []
        // 重置菜单路由为常量路由
        this.menuRoutes = constantRoutes
      }
    },

    // 获取用户信息并处理路由
    async getUserInfo() {
      try {
        const response = await getUserInfoApi()
        if (response.code === 200) {
          const { user, routes, permissions: userPermissions } = response.data

          // 设置用户基本信息
          this.userInfo = user

          // 设置权限
          this.permissions = userPermissions || []

          if (routes !== undefined) {
            // 根据后端返回的路由名称过滤本地的asyncRoutes
            const userAsyncRoutes = this.filterAsyncRoute(cloneDeep(asyncRoutes), routes)

            // 菜单需要的路由数据整理完毕，相当于数组合并
            // (页面刷新白屏解决)一定要把任意路由加到数组最后
            this.menuRoutes = [
              ...constantRoutes,
              ...userAsyncRoutes,
              anyRoutes
            ]

            //动态路由追加
            userAsyncRoutes.forEach((route) => {
              router.addRoute(route)
            })

            router.addRoute(anyRoutes)
          }

          return 'ok'
        } else {
          return Promise.reject(new Error(response.message))
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return Promise.reject(error)
      }
    },

    // 根据路由名称数组过滤异步路由
    filterAsyncRoute(asyncRoutes, routes) {
      return asyncRoutes.filter(route => {
        // 检查当前路由是否在允许的名称列表中
        if (routes.includes(route.name)) {
          // 如果有子路由，递归过滤子路由
          if (route.children && route.children.length > 0) {
            route.children = this.filterAsyncRoute(route.children, routes)
          }
          return true
        }
        return false
      })
    }
  },
})
