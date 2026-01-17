// 常量路由 - 不需要权限验证的路由
export const constantRoutes = [
  // 登录页面 - 独立布局
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: {
      title: '登录',
      icon: 'login',
      hide: true
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/LayoutManager.vue'),
    redirect: '/home',
    children: [
      // 一层菜单 - 首页
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: {
          title: '首页',
          icon: 'home',
          hide: false
        }
      },
    ]
  },
  // 404页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404/Index.vue'),
    meta: {
      title: '页面不存在',
      hide: true
    }
  },
]

// 动态路由 - 需要权限验证的路由
export const asyncRoutes = [
  {
    path: '/permission',
    name: 'Permission',
    component: () => import('@/layouts/LayoutManager.vue'),
    redirect: '/permission/user',
    meta: {
      title: '权限管理',
      icon: 'user-locked',
      hide: false
    },
    children: [
      {
        path: '/permission/user',
        name: 'User',
        component: () => import('@/views/permission/user/Index.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          hide: false
        }
      },
      {
        path: '/permission/role',
        name: 'Role',
        component: () => import('@/views/permission/role/Index.vue'),
        meta: {
          title: '角色管理',
          icon: 'secured',
          hide: false
        }
      },
      {
        path: '/permission/menu',
        name: 'Menu',
        component: () => import('@/views/permission/menu/Index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'menu-fold',
          hide: false
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/LayoutManager.vue'),
    redirect: '/system/dict',
    meta: {
      title: '系统管理',
      icon: 'setting-1',
      hide: false
    },
    children: [
      {
        path: '/system/dict',
        name: 'Dict',
        component: () => import('@/views/system/dict/Index.vue'),
        meta: {
          title: '字典管理',
          icon: 'indicator',
          hide: false
        }
      },
      {
        path: '/system/dict-data',
        name: 'DictData',
        component: () => import('@/views/system/dict_data/Index.vue'),
        meta: {
          title: '字典数据',
          icon: 'data-base',
          hide: false
        }
      },
      {
        path: '/system/log',
        name: 'Log',
        component: () => import('@/views/system/log/Index.vue'),
        meta: {
          title: '系统日志',
          icon: 'system-log',
          hide: false
        }
      },
      {
        path: '/system/notice',
        name: 'Notice',
        component: () => import('@/views/system/notice/Index.vue'),
        meta: {
          title: '通知管理',
          icon: 'notification',
          hide: false
        }
      }
    ]
  }
]

// 任意路由 - 处理404等错误页面
export const anyRoutes = {
  path: "/:pathMatch(.*)*",
  redirect: "/404",
  name: "any",
  meta: {
    title: "任意路由",
    hide: true,
    icon: "",
  },
};
