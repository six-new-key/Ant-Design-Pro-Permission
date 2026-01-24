import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HOME_PATH } from '@/constants/routes'

export const useTabsStore = defineStore('tabs', () => {
  // State
  const tabs = ref([])
  const activeTabPath = ref(HOME_PATH)
  
  // 默认首页页签
  const defaultTab = {
    id: 'home',
    title: '首页',
    path: HOME_PATH,
    icon: 'HomeOutlined',
    closable: false,
    pinned: true,
    meta: { title: '首页' }
  }

  // Getters
  const activeTabs = computed(() => tabs.value)
  const activeTab = computed(() => 
    tabs.value.find(tab => tab.path === activeTabPath.value)
  )
  const activeTabIndex = computed(() => 
    tabs.value.findIndex(tab => tab.path === activeTabPath.value)
  )

  // Actions
  const addTab = (route) => {
    // 首页标签已在 initTabs 中添加，不需要重复添加
    if (route.path === HOME_PATH) {
      activeTabPath.value = route.path
      return
    }
    
    const existingTab = tabs.value.find(tab => tab.path === route.path)
    
    if (!existingTab) {
      const newTab = {
        id: route.name || route.path.replace(/\//g, '-'),
        title: route.meta?.title || route.name || '未命名',
        path: route.path,
        icon: route.meta?.icon,
        closable: true, // 非首页标签可关闭
        pinned: false,  // 非首页标签默认不固定
        meta: route.meta || {}
      }
      
      tabs.value.push(newTab)
      
      // 如果新添加的页签是固定页签，需要重新排序
      if (newTab.pinned) {
        reorderTabs(tabs.value)
      }
    }
    
    activeTabPath.value = route.path
  }

  const removeTab = (targetPath) => {
    const targetIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    
    if (targetIndex === -1) return
    
    const targetTab = tabs.value[targetIndex]
    
    // 固定页签不能关闭
    if (targetTab.pinned || !targetTab.closable) return
    
    tabs.value.splice(targetIndex, 1)
    
    // 如果关闭的是当前激活页签，需要切换到其他页签
    if (activeTabPath.value === targetPath) {
      if (tabs.value.length > 0) {
        // 优先切换到右侧页签，如果没有则切换到左侧
        const nextTab = tabs.value[targetIndex] || tabs.value[targetIndex - 1]
        activeTabPath.value = nextTab.path
      } else {
        // 如果没有页签了，跳转到首页
        activeTabPath.value = HOME_PATH
        addTab({ path: HOME_PATH, meta: { title: '首页' } })
      }
    }
  }

  const setActiveTab = (path) => {
    activeTabPath.value = path
  }

  const toggleTabPin = (targetPath) => {
    const tab = tabs.value.find(tab => tab.path === targetPath)
    if (tab && tab.path !== HOME_PATH) { // 首页固定状态不可更改
      tab.pinned = !tab.pinned
      tab.closable = !tab.pinned // 固定的页签不可关闭
      
      // 如果页签被设置为固定，自动排到前面
      if (tab.pinned) {
        reorderTabs(tabs.value)
      }
    }
  }

  // 重新排序标签页（拖拽后调用）
  const reorderTabs = (newOrder) => {
    // 分离固定和非固定标签页
    const pinnedTabs = []
    const unpinnedTabs = []
    
    newOrder.forEach(tab => {
      if (tab.pinned) {
        pinnedTabs.push(tab)
      } else {
        unpinnedTabs.push(tab)
      }
    })
    
    // 确保首页始终在第一位
    const homeIndex = pinnedTabs.findIndex(tab => tab.path === HOME_PATH)
    if (homeIndex > 0) {
      const home = pinnedTabs.splice(homeIndex, 1)[0]
      pinnedTabs.unshift(home)
    }
    
    // 重新组合：固定标签页在前，非固定标签页在后
    tabs.value = [...pinnedTabs, ...unpinnedTabs]
  }

  const closeLeftTabs = (targetPath) => {
    const targetIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    if (targetIndex <= 0) return
    
    // 从右往左删除，避免索引变化问题
    for (let i = targetIndex - 1; i >= 0; i--) {
      const tab = tabs.value[i]
      if (tab.closable && !tab.pinned) {
        tabs.value.splice(i, 1)
      }
    }
  }

  const closeRightTabs = (targetPath) => {
    const targetIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    if (targetIndex === -1 || targetIndex >= tabs.value.length - 1) return
    
    // 从右往左删除，避免索引变化问题
    for (let i = tabs.value.length - 1; i > targetIndex; i--) {
      const tab = tabs.value[i]
      if (tab.closable && !tab.pinned) {
        tabs.value.splice(i, 1)
      }
    }
  }

  const closeOtherTabs = (targetPath) => {
    tabs.value = tabs.value.filter(tab => 
      tab.path === targetPath || tab.pinned || !tab.closable
    )
  }

  const closeAllTabs = () => {
    tabs.value = tabs.value.filter(tab => tab.pinned || !tab.closable)
    
    // 如果当前激活页签被关闭，切换到首页
    const activeTabExists = tabs.value.some(tab => tab.path === activeTabPath.value)
    if (!activeTabExists) {
      activeTabPath.value = HOME_PATH
      // 确保首页页签存在
      if (!tabs.value.some(tab => tab.path === HOME_PATH)) {
        addTab({ path: HOME_PATH, meta: { title: '首页' } })
      }
    }
  }

  const initTabs = () => {
    // 查找首页标签
    const homeTabIndex = tabs.value.findIndex(tab => tab.path === HOME_PATH)
    
    if (homeTabIndex === -1) {
      // 首页标签不存在，添加默认首页
      tabs.value.unshift(defaultTab)
    } else {
      // 首页标签存在，确保其状态正确（不可关闭、固定）
      const homeTab = tabs.value[homeTabIndex]
      homeTab.closable = false
      homeTab.pinned = true
      homeTab.title = '首页'
      homeTab.icon = 'HomeOutlined'
      
      // 确保首页在第一位
      if (homeTabIndex !== 0) {
        tabs.value.splice(homeTabIndex, 1)
        tabs.value.unshift(homeTab)
      }
    }
  }

  return {
    // State
    tabs,
    activeTabPath,
    
    // Getters
    activeTabs,
    activeTab,
    activeTabIndex,
    
    // Actions
    addTab,
    removeTab,
    setActiveTab,
    toggleTabPin,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    closeAllTabs,
    initTabs,
    reorderTabs
  }
}, {
  persist: {
    storage: localStorage,
    pick: [
      'tabs',
      'activeTabPath'
    ]
  }
})