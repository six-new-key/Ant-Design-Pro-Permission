import { ref } from 'vue'
import { getServerMonitorInfo } from '@/api/server'
import { message } from 'ant-design-vue'

export function useServerMonitor() {
  const loading = ref(false)
  const monitorData = ref(null)

  /**
   * 获取服务监控信息
   */
  const fetchMonitorData = async () => {
    loading.value = true
    try {
      const res = await getServerMonitorInfo()
      if (res.code === 200) {
        monitorData.value = res.data
      } else {
        message.error(res.message || '获取服务监控信息失败')
      }
    } catch (error) {
      console.error('获取服务监控信息失败:', error)
      message.error('获取服务监控信息失败')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    monitorData,
    fetchMonitorData
  }
}
