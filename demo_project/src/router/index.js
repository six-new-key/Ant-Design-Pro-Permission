import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "@/store/modules/user";
import pinia from "@/store";

const userStore = useUserStore(pinia);
// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: userStore.menuRoutes,
  // 路由滚动行为
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  },
})

export default router