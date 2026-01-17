import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { PAGE_ANIMATION_CONFIG } from "@/utils";

export const useAppStore = defineStore(
  "app",
  () => {
    // State
    const themeMode = ref("light"); // 主题模式：light/dark
    const sidebarTheme = ref("dark"); // 侧边栏：light/dark
    const headerTheme = ref("dark"); // 顶部主题：light/dark
    const language = ref("zh-cn");
    const layout = ref("sidebar"); // 默认布局
    const prevLayout = ref(""); // 上一个布局
    const sidebarCollapsed = ref(false);
    const sidebarFixed = ref(true); // 侧边栏是否固定
    const loading = ref(false);
    const currentTopMenu = ref(""); // 当前选中的顶部菜单
    const tabsShow = ref(true); // 页签是否显示
    const shouldRefresh = ref(false); // 页面刷新标志
    //默认页面切换动画
    const currentPageAnimation = ref(
      PAGE_ANIMATION_CONFIG.TYPES.BOUNCE_IN_LEFT
    );
    const isFullscreen = ref(false); // 全屏状态
    
    // 锁屏相关状态
    const isScreenLocked = ref(false); // 锁屏状态
    const lockScreenPassword = ref(''); // 锁屏密码

    // Getters
    const isLoading = computed(() => loading.value);
    const currentLayout = computed(() => layout.value);

    // Actions
    const setThemeMode = (newThemeMode) => {
      themeMode.value = newThemeMode;
    };

    const setSidebarTheme = (newSidebarTheme) => {
      sidebarTheme.value = newSidebarTheme;
    };

    const setHeaderTheme = (newHeaderTheme) => {
      headerTheme.value = newHeaderTheme;
    };

    const setSidebarFixed = (newFixed) => {
      sidebarFixed.value = newFixed;
    };

    const setLanguage = (newLanguage) => {
      language.value = newLanguage;
      window.localStorage.setItem("lang", newLanguage);
      window.location.reload();
    };

    const setLayout = (newLayout) => {
      layout.value = newLayout;
      if(newLayout === 'fullscreen') {
        toggleFullscreen(true)
      } else {
        toggleFullscreen(false)
      }
    };

    const setPrevLayout = (prev) => {
      prevLayout.value = prev;
    };

    const toggleFullscreen = (newFullscreen) => {
      isFullscreen.value = newFullscreen;
    };

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    const setSidebarCollapsed = (collapsed) => {
      sidebarCollapsed.value = collapsed;
    };

    const setLoading = (isLoading) => {
      loading.value = isLoading;
    };

    const setCurrentTopMenu = (menuKey) => {
      currentTopMenu.value = menuKey;
    };

    const setTabsShow = (show) => {
      tabsShow.value = show;
    };

    // 刷新相关方法
    const triggerRefresh = () => {
      shouldRefresh.value = true;
    };

    const resetRefresh = () => {
      shouldRefresh.value = false;
    };

    // 设置页面切换动画
    const setPageAnimation = (animation) => {
      currentPageAnimation.value = animation;
    };

    // 锁屏相关方法
    const setLockScreen = async (password) => {
      if (!password || password.length < 4) {
        throw new Error('密码长度至少4位');
      }
      
      lockScreenPassword.value = password;
      isScreenLocked.value = true;
      
      // 可以在这里添加额外的锁屏逻辑，比如清除敏感数据等
      return Promise.resolve();
    };

    const unlockScreen = async (password) => {
      if (!password) {
        return false;
      }
      
      if (password === lockScreenPassword.value) {
        isScreenLocked.value = false;
        // 解锁成功后可以选择是否清除密码
        // lockScreenPassword.value = '';
        return true;
      }
      
      return false;
    };

    const clearLockScreen = () => {
      isScreenLocked.value = false;
      lockScreenPassword.value = '';
    };

    return {
      // State
      themeMode,
      sidebarTheme,
      headerTheme,
      language,
      layout,
      prevLayout,
      sidebarCollapsed,
      sidebarFixed,
      loading,
      currentTopMenu,
      tabsShow,
      shouldRefresh,
      isScreenLocked,
      lockScreenPassword,
      isFullscreen,

      // Getters
      isLoading,
      currentLayout,
      currentPageAnimation,

      // Actions
      setThemeMode,
      setSidebarTheme,
      setHeaderTheme,
      setLanguage,
      setLayout,
      setPrevLayout,
      toggleSidebar,
      setSidebarCollapsed,
      setTabsShow,
      setLoading,
      setCurrentTopMenu,
      setSidebarFixed,
      triggerRefresh,
      resetRefresh,
      setPageAnimation,
      setLockScreen,
      unlockScreen,
      clearLockScreen,
      toggleFullscreen,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: [
        "themeMode",
        "sidebarTheme",
        "headerTheme",
        "language",
        "layout",
        "prevLayout", // 持久化上一个布局
        "sidebarCollapsed",
        "sidebarFixed",
        "tabsShow",
        "currentTopMenu",
        "currentPageAnimation",
        "lockScreenPassword", // 持久化锁屏密码
        "isFullscreen", // 持久化全屏状态
      ],
    },
  }
);
