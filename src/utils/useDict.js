/**
 * 字典数据Composable
 * 
 * 直接请求后端API，不做前端缓存
 * 后端Redis缓存保证性能
 */

import { ref, onMounted } from 'vue'
import { getDictDataByType } from '@/api/dict'

/**
 * 使用单个字典
 * @param {string} type 字典类型
 * @returns {Object} { dict, loading, refresh, getLabel, getValue }
 */
export function useDict(type) {
  const dict = ref([])
  const loading = ref(false)
  
  // 加载字典
  const load = async () => {
    loading.value = true
    try {
      const res = await getDictDataByType(type)
      if (res.code === 200) {
        dict.value = res.data || []
      }
    } catch (error) {
      console.error(`加载字典数据失败: type=${type}`, error)
      dict.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 刷新字典（重新请求）
  const refresh = async () => {
    await load()
  }
  
  // 根据value获取label
  const getLabel = (value) => {
    const item = dict.value.find(d => d.value === String(value))
    return item ? item.label : value
  }
  
  // 根据label获取value
  const getValue = (label) => {
    const item = dict.value.find(d => d.label === label)
    return item ? item.value : label
  }
  
  // 自动加载
  onMounted(() => {
    load()
  })
  
  return {
    dict,
    loading,
    refresh,
    getLabel,
    getValue
  }
}

/**
 * 使用多个字典
 * @param {Array<string>} types 字典类型数组
 * @returns {Object} { dicts, loading, refresh, getLabel, getValue }
 */
export function useDicts(types) {
  const dicts = ref({})
  const loading = ref(false)
  
  // 加载所有字典
  const load = async () => {
    loading.value = true
    try {
      const promises = types.map(async (type) => {
        const res = await getDictDataByType(type)
        return {
          type,
          data: res.code === 200 ? (res.data || []) : []
        }
      })
      
      const results = await Promise.all(promises)
      
      const dictMap = {}
      results.forEach(({ type, data }) => {
        dictMap[type] = data
      })
      dicts.value = dictMap
    } catch (error) {
      console.error('批量加载字典数据失败', error)
      dicts.value = {}
    } finally {
      loading.value = false
    }
  }
  
  // 刷新所有字典
  const refresh = async () => {
    await load()
  }
  
  // 根据value获取label
  const getLabel = (type, value) => {
    const dict = dicts.value[type] || []
    const item = dict.find(d => d.value === String(value))
    return item ? item.label : value
  }
  
  // 根据label获取value
  const getValue = (type, label) => {
    const dict = dicts.value[type] || []
    const item = dict.find(d => d.label === label)
    return item ? item.value : label
  }
  
  // 自动加载
  onMounted(() => {
    load()
  })
  
  return {
    dicts,
    loading,
    refresh,
    getLabel,
    getValue
  }
}
