import { ref } from 'vue'
import { getDictDataByType } from '@/api/dict'

/**
 * 字典数据管理
 */
export function useDict() {
  const statusDict = ref([])
  const genderDict = ref([])

  /**
   * 加载字典数据
   */
  const fetchDictData = async () => {
    try {
      // 加载用户状态字典
      const statusRes = await getDictDataByType('common_status')
      if (statusRes.code === 200) {
        statusDict.value = statusRes.data || []
      }
      
      // 加载性别字典
      const genderRes = await getDictDataByType('gender')
      if (genderRes.code === 200) {
        genderDict.value = genderRes.data || []
      }
    } catch (error) {
      console.error('加载字典数据失败', error)
    }
  }

  /**
   * 获取性别标签
   */
  const getGenderLabel = (gender) => {
    const map = { 0: '未知', 1: '男', 2: '女' }
    return map[gender] !== undefined ? map[gender] : '未知'
  }

  /**
   * 获取性别颜色
   */
  const getGenderColor = (gender) => {
    const map = { 0: 'default', 1: 'blue', 2: 'pink' }
    return map[gender] || 'default'
  }

  return {
    statusDict,
    genderDict,
    fetchDictData,
    getGenderLabel,
    getGenderColor
  }
}
