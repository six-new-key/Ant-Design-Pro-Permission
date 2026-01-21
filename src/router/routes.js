

// import LayoutManager from "@/layouts/LayoutManager.vue";
const LayoutManager = () => import("@/layouts/LayoutManager.vue");

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
  {
    path: "/",
    name: "Layout",
    component: LayoutManager,
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "Home",
        component: () => import("@/views/home/Home.vue"),
        meta: {
          title: "首页",
          icon: "DashboardOutlined",
          hidden: false,
        },
      },
    ],
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
