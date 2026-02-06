import { ref, computed } from 'vue'
import { getSystemConfigList } from '@/api/systemConfig'

/**
 * 配置列表管理
 */
export function useConfigList() {
  const loading = ref(false)
  const configList = ref([])

  // 分组配置
  const groupMap = {
    security: '安全防护',
    login: '登录控制',
    rate_limit: '限流控制',
    ip_blacklist: 'IP黑名单',
    business: '业务参数'
  }

  // 计算属性：按分组整理配置
  const configGroups = computed(() => {
    const groups = {}
    
    configList.value.forEach(config => {
      const groupCode = config.configGroup || 'other'
      if (!groups[groupCode]) {
        groups[groupCode] = {
          code: groupCode,
          name: groupMap[groupCode] || '其他配置',
          configs: []
        }
      }
      groups[groupCode].configs.push(config)
    })
    
    return Object.values(groups)
  })

  /**
   * 加载配置列表
   */
  const loadConfigList = async () => {
    loading.value = true
    try {
      const response = await getSystemConfigList()
      if (response.code === 200 && response.data) {
        configList.value = response.data.map(item => ({
          ...item,
          loading: false
        }))
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取配置单位
   */
  const getUnit = (configKey) => {
    const unitMap = {
      'login_lock_time_minutes': '分钟',
      'login_max_attempts': '次',
      'login_captcha_threshold': '次',
      'global_rate_limit_time': '秒',
      'global_rate_limit_count': '次',
      'request_body_max_size': '字节',
      'auto_ban_expire_hours': '小时'
    }
    return unitMap[configKey] || ''
  }

  return {
    loading,
    configList,
    configGroups,
    loadConfigList,
    getUnit
  }
}
