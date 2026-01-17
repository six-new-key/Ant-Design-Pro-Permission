import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    visitedPages: [
      // 首页标签永远存在且在第一位
      { path: '/home', title: '首页', icon: 'home', isHome: true, timestamp: 0 }
    ]
  }),

  getters: {
    getVisitedPages: (state) => state.visitedPages,
    hasVisitedPages: (state) => state.visitedPages.length > 0
  },

  actions: {
    // 初始化首页标签
    initHomePage() {
      const homePage = this.visitedPages.find(p => p.isHome)
      if (!homePage) {
        this.visitedPages.unshift({ path: '/home', title: '首页', icon: 'home', isHome: true, timestamp: 0 })
      }
    },

    // 添加页面标签
    addPageTag(page) {
      // 确保首页标签存在
      this.initHomePage()

      // 如果是首页路径，不需要添加，因为首页标签已经存在
      if (page.path === '/home') {
        return
      }

      const existingPage = this.visitedPages.find(p => p.path === page.path)
      if (!existingPage && page.title) {
        this.visitedPages.push({
          path: page.path,
          title: page.title,
          icon: page.icon,
          isHome: false,
          timestamp: Date.now()
        })
      }
    },

    // 移除页面标签
    removePageTag(path) {
      // 首页标签不可移除
      if (path === '/home') {
        return null
      }

      const index = this.visitedPages.findIndex(page => page.path === path)
      if (index > -1) {
        this.visitedPages.splice(index, 1)
        return this.visitedPages.length > 0 ? this.visitedPages[this.visitedPages.length - 1] : null
      }
      return null
    },

    // 清空所有标签（保留首页）
    clearAllTags() {
      this.visitedPages = this.visitedPages.filter(page => page.isHome)
    },

    // 移除其他标签（保留当前标签和首页）
    removeOtherTags(currentPath) {
      this.visitedPages = this.visitedPages.filter(page => page.path === currentPath || page.isHome)
    },

    // 移除左侧标签（保留首页）
    removeLeftTags(currentPath) {
      const currentIndex = this.visitedPages.findIndex(page => page.path === currentPath)
      if (currentIndex > 1) { // 确保首页标签不被移除
        const homePage = this.visitedPages.find(page => page.isHome)
        this.visitedPages = [homePage, ...this.visitedPages.slice(currentIndex)]
      }
    },

    // 移除右侧标签
    removeRightTags(currentPath) {
      const currentIndex = this.visitedPages.findIndex(page => page.path === currentPath)
      if (currentIndex !== -1) {
        this.visitedPages = this.visitedPages.slice(0, currentIndex + 1)
        // 确保首页标签始终存在
        this.initHomePage()
      }
    }
  }
})