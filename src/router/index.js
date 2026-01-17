/**
 * 路由器配置文件
 * 职责：创建路由器实例、配置路由守卫、管理路由跳转逻辑
 */
import { createRouter, createWebHistory } from "vue-router";
import pinia from "@/stores";
import { useUserStore } from "@/stores";

const userStore = useUserStore(pinia);

const router = createRouter({
  history: createWebHistory(),
  routes: userStore.menuRoutes,
  // 路由滚动行为
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  },
});

// ==================== 路由守卫配置 ====================
// 路由守卫已在 permission.js 中自动配置

export default router;
