

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

// 动态路由 - 需要权限验证的路由
export const asyncRoutes = [
  //大语言模型
  {
    path: "/llm",
    name: "LlmManage",
    component: LayoutManager,
    redirect: "/llm/one",
    children: [
      {
        path: "/llm/one",
        name: "LlmOne",
        component: () => import("@/views/Llm/LLM.vue"),
        meta: {
          title: "大模型",
          icon: "ChromeOutlined",
          hidden: false,
        },
      },
    ]
  },
  // 权限管理页面
  {
    path: "/permission",
    name: "Permission",
    component: LayoutManager,
    redirect: "/permission/user",
    meta: {
      title: "权限管理",
      icon: "UserOutlined",
      hidden: false,
    },
    children: [
      {
        path: "/permission/user",
        name: "User",
        component: () => import("@/views/permission/user/User.vue"),
        meta: {
          title: "用户管理",
          icon: "UserOutlined",
          hidden: false,
        },
      },
      {
        path: "/permission/role",
        name: "Role",
        component: () => import("@/views/permission/role/Role.vue"),
        meta: {
          title: "角色管理",
          icon: "SettingOutlined",
          hidden: false,
        },
      },
      {
        path: "/permission/menu",
        name: "Menu",
        component: () => import("@/views/permission/menu/Menu.vue"),
        meta: {
          title: "菜单管理",
          icon: "SettingOutlined",
          hidden: false,
        },
      },
    ],
  },
  // 系统管理页面
  {
    path: "/system",
    name: "System",
    component: LayoutManager,
    redirect: "/system/config",
    meta: {
      title: "系统管理",
      icon: "SettingOutlined",
      hidden: false,
    },
    children: [
      {
        path: "/system/config",
        name: "SystemConfig",
        component: () => import("@/views/system/config/SystemConfig.vue"),
        meta: {
          title: "系统配置",
          icon: "ControlOutlined",
          hidden: false,
        },
      },
      {
        path: "/system/iprule",
        name: "IpRule",
        component: () => import("@/views/system/iprule/IpRule.vue"),
        meta: {
          title: "规则管理",
          icon: "SafetyOutlined",
          hidden: false,
        },
      },
    ],
  },
];

// 任意路由 - 处理404等错误页面
export const anyRoutes = {
  path: "/:pathMatch(.*)*",
  redirect: "/404",
  name: "any",
  meta: {
    title: "任意路由",
    hidden: true,
    icon: ''
  },
};

// 兼容性导出：为现有组件提供routes导出
// 菜单组件需要使用layoutRoutes来渲染菜单项
export const routes = asyncRoutes;
