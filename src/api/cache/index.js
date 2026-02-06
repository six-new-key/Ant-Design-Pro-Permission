import request from '@/utils/request'

/**
 * 获取缓存类型配置
 */
export const getCacheTypes = () => {
  return request({
    url: '/cache/types',
    method: 'get'
  })
}

/**
 * 获取缓存统计信息
 */
export const getCacheStatistics = () => {
  return request({
    url: '/cache/statistics',
    method: 'get'
  })
}

/**
 * 分页查询缓存键列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 缓存分类（可选：all/business/system）
 * @param {string} params.cacheType - 缓存类型（可选）
 * @param {string} params.keyword - 关键字搜索（可选）
 * @param {number} params.pageNo - 页码
 * @param {number} params.pageSize - 每页大小
 */
export const getCacheKeys = (params) => {
  return request({
    url: '/cache/keys',
    method: 'get',
    params
  })
}

/**
 * 查询缓存详情
 * @param {string} key - 缓存键
 */
export const getCacheDetail = (key) => {
  return request({
    url: `/cache/detail/${encodeURIComponent(key)}`,
    method: 'get'
  })
}

/**
 * 清除所有缓存
 */
export const clearAllCache = () => {
  return request({
    url: '/cache/clear/all',
    method: 'delete'
  })
}

/**
 * 按分类清除缓存
 * @param {string} category - 缓存分类代码
 */
export const clearCacheByCategory = (category) => {
  return request({
    url: `/cache/clear/category/${category}`,
    method: 'delete'
  })
}

/**
 * 按类型清除缓存
 * @param {string} typeCode - 缓存类型代码
 */
export const clearCacheByType = (typeCode) => {
  return request({
    url: `/cache/clear/type/${typeCode}`,
    method: 'delete'
  })
}

/**
 * 删除单个缓存键
 * @param {string} key - 缓存键
 */
export const deleteCacheKey = (key) => {
  return request({
    url: `/cache/key/${encodeURIComponent(key)}`,
    method: 'delete'
  })
}
