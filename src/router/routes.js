// 常量路由 - 不需要权限验证的路由
export const constantRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/Login.vue"),
    meta: {
      title: "用户登录",
      hidden: true,
    },
  },
  // 404页面
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404/404.vue'),
    meta: {
      title: "404页面",
      hidden: true,
      icon: ''
    },
  }
];
