import { ref } from 'vue'
import { getDictDataByType } from '@/api/dict'

/**
 * 字典数据管理
 */
export function useDict() {
  const statusDict = ref([])

  /**
   * 加载字典数据
   */
  const fetchDictData = async () => {
    try {
      // 加载角色状态字典
      const statusRes = await getDictDataByType('common_status')
      if (statusRes.code === 200) {
        statusDict.value = statusRes.data || []
      }
    } catch (error) {
      console.error('加载字典数据失败', error)
    }
  }

  return {
    statusDict,
    fetchDictData
  }
}
