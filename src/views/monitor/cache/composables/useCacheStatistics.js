import { ref } from 'vue'
import { getCacheStatistics } from '@/api/cache'
import { message } from '@/utils'

/**
 * 缓存统计逻辑
 */
export const useCacheStatistics = () => {
  const statistics = ref(null)
  const loading = ref(false)

  /**
   * 加载缓存统计信息
   */
  const loadStatistics = async () => {
    loading.value = true
    try {
      const res = await getCacheStatistics()
      if (res.code === 200) {
        statistics.value = res.data
      } else {
        message.error(res.message || '获取缓存统计失败')
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      message.error('获取缓存统计失败')
    } finally {
      loading.value = false
    }
  }

  return {
    statistics,
    loading,
    loadStatistics
  }
}
