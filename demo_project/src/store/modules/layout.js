import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 布局状态管理
 */
export const useLayoutStore = defineStore(
  "layout",
  () => {
    //默认布局
    const currentLayout = ref("sidebar");
    //布局加载状态
    const layoutLoading = ref(false);

    //设置布局
    const setLayout = (layout) => {
      layoutLoading.value = true;
      currentLayout.value = layout;
      setTimeout(() => {
        layoutLoading.value = false;
      }, 300);
    };

    //获取布局
    const getLayout = () => {
      return currentLayout.value;
    };

    //获取所有可选布局
    const getAvailableLayouts = () => {
      return [
        {
          name: "sidebar",
          label: "侧边栏布局",
          icon: "sidebar",
          description: "传统的侧边栏布局，包含菜单和内容区域",
        },
        {
          name: "topbar",
          label: "顶部布局",
          icon: "topbar",
          description: "顶部导航布局，通常包含顶部菜单和内容区域",
        },
        {
          name: "mixed",
          label: "混合布局",
          icon: "mixed",
          description: "侧边栏和顶部导航的混合布局",
        },
      ];
    };

    return {
      currentLayout,
      setLayout,
      getLayout,
      layoutLoading,
      getAvailableLayouts,
    };
  }
);
