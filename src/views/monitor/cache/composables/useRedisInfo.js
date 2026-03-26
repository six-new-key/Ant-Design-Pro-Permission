import { ref } from 'vue'
import { getRedisInfo } from '@/api/cache'
import { message } from 'ant-design-vue'

/**
 * Redis 信息管理
 */
export function useRedisInfo() {
  const redisInfo = ref(null)
  const loading = ref(false)

  /**
   * 加载 Redis 信息
   */
  const loadRedisInfo = async () => {
    loading.value = true
    try {
      const res = await getRedisInfo()
      if (res.code === 200) {
        redisInfo.value = res.data
      } else {
        message.error(res.message || '获取 Redis 信息失败')
      }
    } catch (error) {
      console.error('获取 Redis 信息失败:', error)
      message.error('获取 Redis 信息失败')
    } finally {
      loading.value = false
    }
  }

  return {
    redisInfo,
    loading,
    loadRedisInfo
  }
}
