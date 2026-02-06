import { Modal } from 'ant-design-vue'
import { clearAllCache, clearCacheByType, clearCacheByCategory, deleteCacheKey } from '@/api/cache'
import { message } from '@/utils'

/**
 * 缓存清理逻辑
 */
export const useCacheClear = (refreshCallback) => {
  /**
   * 清除所有缓存
   */
  const handleClearAllCache = () => {
    Modal.confirm({
      title: '⚠️ 确认清除所有缓存',
      content: '此操作将清除所有缓存（包括业务缓存和系统缓存），可能导致：\n\n1. 所有用户需要重新加载路由和权限\n2. Refresh Token 失效，用户需重新登录\n3. 验证码、限流计数等系统缓存重置\n4. 短时间内数据库压力增大\n\n确定要继续吗？',
      okText: '确定清除',
      okType: 'danger',
      centered: true,
      cancelText: '取消',
      width: 520,
      onOk: async () => {
        try {
          const res = await clearAllCache()
          if (res.code === 200) {
            message.success('清除成功')
            if (refreshCallback) {
              refreshCallback()
            }
          } else {
            message.error(res.message || '清除失败')
          }
        } catch (error) {
          console.error('清除所有缓存失败:', error)
          message.error('清除所有缓存失败')
        }
      }
    })
  }

  /**
   * 按分类清除缓存（通用方法）
   */
  const handleClearCacheByCategory = (categoryCode, categoryName) => {
    // 根据分类提供不同的风险提示
    const riskMessages = {
      business: '此操作将清除所有业务缓存（用户路由、权限、角色等），用户下次访问时会重新从数据库加载。',
      system: '⚠️ 此操作将清除所有系统缓存（Token、验证码、限流等），可能导致：\n\n1. 用户 Refresh Token 失效，需重新登录\n2. 验证码失效\n3. 限流计数重置\n4. IP黑名单失效\n\n请谨慎操作！',
      third_party: '此操作将清除所有第三方服务缓存（微信Token、支付宝会话等），可能需要重新授权。'
    }

    const content = riskMessages[categoryCode] || `此操作将清除所有${categoryName}，是否继续？`
    const okType = categoryCode === 'system' ? 'danger' : 'primary'

    Modal.confirm({
      title: `确认清除${categoryName}？`,
      content: content,
      okText: '确定清除',
      okType: okType,
      cancelText: '取消',
      centered: true,
      width: categoryCode === 'system' ? 520 : 416,
      onOk: async () => {
        try {
          const res = await clearCacheByCategory(categoryCode)
          if (res.code === 200) {
            message.success(`${categoryName}清除成功`)
            if (refreshCallback) {
              refreshCallback()
            }
          } else {
            message.error(res.message || `${categoryName}清除失败`)
          }
        } catch (error) {
          console.error(`${categoryName}清除失败:`, error)
          message.error(`${categoryName}清除失败`)
        }
      }
    })
  }

  /**
   * 按类型清除缓存
   */
  const handleDeleteCache = (typeCode) => {
    Modal.confirm({
      title: '确认删除缓存？',
      content: `此操作将删除该类型的所有缓存，是否继续？`,
      okText: '确定',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          const res = await clearCacheByType(typeCode)
          if (res.code === 200) {
            message.success('缓存删除成功')
            if (refreshCallback) {
              refreshCallback()
            }
          } else {
            message.error(res.message || '缓存删除失败')
          }
        } catch (error) {
          console.error('缓存删除失败:', error)
          message.error('缓存删除失败')
        }
      }
    })
  }

  /**
   * 删除单个缓存键
   */
  const handleDeleteCacheKey = (key, keyDesc) => {
    Modal.confirm({
      title: '确认删除缓存键？',
      content: `确定要删除缓存键 "${keyDesc || key}" 吗？`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          const res = await deleteCacheKey(key)
          if (res.code === 200) {
            message.success('缓存键删除成功')
            if (refreshCallback) {
              refreshCallback()
            }
          } else {
            message.error(res.message || '缓存键删除失败')
          }
        } catch (error) {
          console.error('缓存键删除失败:', error)
          message.error('缓存键删除失败')
        }
      }
    })
  }

  return {
    handleClearAllCache,
    handleClearCacheByCategory,
    handleDeleteCache,
    handleDeleteCacheKey
  }
}
