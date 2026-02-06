import { ref, computed } from 'vue'
import { getCacheTypes } from '@/api/cache'
import { message } from '@/utils'

/**
 * 缓存类型管理
 */
export function useCacheTypes() {
  const cacheTypes = ref([])
  const loading = ref(false)

  /**
   * 加载缓存类型配置
   */
  async function loadCacheTypes() {
    loading.value = true
    try {
      const res = await getCacheTypes()
      if (res.code === 200) {
        cacheTypes.value = res.data || []
      } else {
        message.error(res.message || '加载缓存类型配置失败')
      }
    } catch (error) {
      console.error('加载缓存类型配置失败:', error)
      message.error('加载缓存类型配置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 计算属性：所有分组（去重）
   */
  const categories = computed(() => {
    const categorySet = new Set()
    cacheTypes.value.forEach(type => {
      if (type.category) {
        categorySet.add(type.category)
      }
    })
    return Array.from(categorySet)
  })

  /**
   * 根据分类获取缓存类型
   */
  const getTypesByCategory = (category) => {
    if (!category || category === 'all') {
      return cacheTypes.value
    }
    return cacheTypes.value.filter(t => t.category === category)
  }

  /**
   * 根据代码获取缓存类型
   */
  const getTypeByCode = (code) => {
    return cacheTypes.value.find(t => t.code === code)
  }

  return {
    cacheTypes,
    loading,
    categories,
    loadCacheTypes,
    getTypesByCategory,
    getTypeByCode
  }
}
