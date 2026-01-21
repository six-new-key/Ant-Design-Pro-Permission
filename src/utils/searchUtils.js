/**
 * 递归扁平化路由数据，提取所有可搜索的菜单项
 * @param {Array} routes - 路由数组
 * @param {Array} result - 结果数组
 * @param {String} parentPath - 父级路径
 * @returns {Array} 扁平化的菜单项数组
 */
const flattenRoutes = (routes, result = [], parentPath = '') => {
  routes.forEach(route => {
    // 基础过滤条件
    const hasTitle = route.meta?.title
    const notHidden = !route.meta?.hidden
    const notRoot = route.path !== '/'

    if (hasTitle && notHidden && notRoot) {
      // 构建完整路径
      const fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`
      
      // 添加到结果数组
      result.push({
        title: route.meta.title,
        path: fullPath,
        icon: route.meta.icon,
        description: route.meta.description || '',
        order: route.meta.order || 999,
        keywords: [
          route.meta.title,
          route.name,
          route.meta.description || '',
          fullPath
        ].filter(Boolean).join(' ').toLowerCase()
      })
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      flattenRoutes(route.children, result, route.path)
    }
  })

  return result
}

/**
 * 获取所有可搜索的菜单项
 * @param {Array} routes - 路由数组（从外部传入，避免循环依赖）
 * @returns {Array} 菜单项数组
 */
export const getAllMenuItems = (routes = []) => {
  const menuItems = flattenRoutes(routes)
  
  // 按order排序
  return menuItems.sort((a, b) => {
    const orderA = a.order || 999
    const orderB = b.order || 999
    return orderA - orderB
  })
}

/**
 * 搜索菜单项
 * @param {String} query - 搜索关键词
 * @param {Array} menuItems - 菜单项数组
 * @returns {Array} 匹配的菜单项数组
 */
export const searchMenuItems = (query, menuItems = null) => {
  if (!query || query.trim() === '') {
    return []
  }

  const items = menuItems || getAllMenuItems()
  const searchQuery = query.toLowerCase().trim()

  return items.filter(item => {
    // 模糊匹配：标题、路径、描述、关键词
    return item.keywords.includes(searchQuery) ||
           item.title.toLowerCase().includes(searchQuery) ||
           item.path.toLowerCase().includes(searchQuery)
  })
}

/**
 * 高亮搜索关键词
 * @param {String} text - 原始文本
 * @param {String} query - 搜索关键词
 * @returns {String} 高亮后的HTML字符串
 */
export const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 获取搜索建议（基于输入的部分关键词）
 * @param {String} query - 搜索关键词
 * @param {Number} limit - 建议数量限制
 * @returns {Array} 搜索建议数组
 */
export const getSearchSuggestions = (query, limit = 5) => {
  if (!query || query.trim() === '') {
    return []
  }

  const menuItems = getAllMenuItems()
  const suggestions = searchMenuItems(query, menuItems)
  
  return suggestions.slice(0, limit)
}