/**
 * 路由器配置文件
 * 职责：创建路由器实例、配置路由守卫、管理路由跳转逻辑
 */
import { createRouter, createWebHistory } from "vue-router";
import { constantRoutes } from "@/router/routes";

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes, // 初始只加载常量路由，动态路由在登录后通过 addRoute 添加
  // 路由滚动行为
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  },
});

// ==================== 路由守卫配置 ====================
// 路由守卫已在 permission.js 中自动配置

export default router;
