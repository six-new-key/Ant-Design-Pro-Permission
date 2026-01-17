/**
 * 布局配置文件
 * 插件化布局管理系统的核心配置
 * 
 * 每个布局配置包含：
 * - name: 布局显示名称
 * - key: 布局唯一标识符
 * - component: 布局组件路径
 * - description: 布局描述
 * - enabled: 是否启用
 * - order: 排序权重
 */

export const layoutConfigs = [
  {
    name: '侧边栏布局',
    key: 'sidebar',
    component: () => import('@/layouts/sidebar/SidebarLayout.vue'),
    description: '传统的左侧边栏 + 右侧内容区域布局，适合管理后台系统',
    enabled: true,
    order: 1
  },
  {
    name: '顶部导航布局',
    key: 'topbar',
    component: () => import('@/layouts/topbar/TopbarLayout.vue'),
    description: '顶部导航栏 + 下方内容区域布局，适合展示型网站',
    enabled: true,
    order: 2
  },
  {
    name: '混合布局',
    key: 'mixed',
    component: () => import('@/layouts/mixed/MixedLayout.vue'),
    description: '顶部导航 + 左侧边栏的混合布局，适合复杂的管理系统',
    enabled: true,
    order: 3
  },
  {
    name: '双列布局',
    key: 'doublecolumn',
    component: () => import('@/layouts/doublecolumn/DoubleColumnLayout.vue'),
    description: '左侧双列导航布局，第一列显示主菜单，第二列显示子菜单',
    enabled: true,
    order: 4
  },
  {
    name: '全屏布局',
    key: 'fullscreen',
    component: () => import('@/layouts/fullscreen/FullscreenLayout.vue'),
    description: '沉浸式全屏内容展示布局，适合专注阅读和内容展示',
    enabled: true,
    order: 5
  }
  // 新增布局只需在此数组中添加配置即可
  // {
  //   name: '新布局',
  //   key: 'new-layout',
  //   component: () => import('./new-layout/NewLayout.vue'),
  //   description: '新布局的描述',
  //   icon: 'PlusOutlined',
  //   enabled: true,
  //   order: 5,
  //   meta: {
  //     category: 'custom',
  //     responsive: true,
  //     features: ['custom-feature']
  //   }
  // }
]

/**
 * 获取启用的布局配置
 * @returns {Array} 启用的布局配置数组
 */
export const getEnabledLayouts = () => {
  return layoutConfigs
    .filter(config => config.enabled)
    .sort((a, b) => a.order - b.order)
}

/**
 * 根据 key 获取布局配置
 * @param {string} key 布局标识符
 * @returns {Object|null} 布局配置对象
 */
export const getLayoutConfig = (key) => {
  return layoutConfigs.find(config => config.key === key && config.enabled) || null
}

/**
 * 获取默认布局配置
 * @returns {Object} 默认布局配置
 */
export const getDefaultLayoutConfig = () => {
  return getLayoutConfig('sidebar') || getEnabledLayouts()[0]
}



/**
 * 获取布局分类
 * @returns {Object} 按分类分组的布局配置
 */
export const getLayoutsByCategory = () => {
  const enabledLayouts = getEnabledLayouts()
  return enabledLayouts.reduce((categories, layout) => {
    const category = layout.meta?.category || 'other'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(layout)
    return categories
  }, {})
}

// 导出默认配置
export default {
  layouts: layoutConfigs,
  getEnabledLayouts,
  getLayoutConfig,
  getDefaultLayoutConfig,
  getLayoutsByCategory
}