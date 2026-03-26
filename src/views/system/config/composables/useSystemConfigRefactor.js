import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getGroupList } from '@/api/systemConfigGroup'
import { getFeatureList, toggleFeature } from '@/api/systemFeature'
import { getSystemConfigList } from '@/api/systemConfig'

/**
 * 系统配置重构版 Composable
 */
export function useSystemConfigRefactor() {
  const loading = ref(false)
  const groupList = ref([])
  const featureList = ref([])
  const configList = ref([])
  const activeKeys = ref([])

  /**
   * 加载所有数据
   */
  const loadData = async () => {
    loading.value = true
    try {
      const [groupRes, featureRes, configRes] = await Promise.all([
        getGroupList(),
        getFeatureList(),
        getSystemConfigList()
      ])

      groupList.value = groupRes.data || []
      featureList.value = featureRes.data || []
      configList.value = configRes.data || []

      // 默认不展开任何分组
      activeKeys.value = []
    } catch (error) {
      console.error('加载数据失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据分组获取功能列表
   */
  const getFeaturesByGroup = (groupCode) => {
    return featureList.value.filter(f => f.groupCode === groupCode)
  }

  /**
   * 根据功能获取配置列表
   */
  const getConfigsByFeature = (featureCode) => {
    return configList.value.filter(c => c.featureCode === featureCode)
  }

  /**
   * 切换功能开关
   */
  const handleFeatureToggle = async (feature) => {
    const isEnabled = feature.enabled === 1
    const action = isEnabled ? '禁用' : '启用'
    const newState = isEnabled ? 0 : 1
    const oldState = feature.enabled
    
    // 构建提示内容
    const content = !isEnabled 
      ? `启用后，该功能将立即生效，相关配置项将可用。\n\n功能名称：${feature.featureName}\n功能代码：${feature.featureCode}`
      : `禁用后，该功能将立即失效，相关配置项将不可用。\n\n功能名称：${feature.featureName}\n功能代码：${feature.featureCode}\n\n⚠️ 注意：禁用可能影响系统正常运行，请谨慎操作！`
    
    try {
      // 弹框确认
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: `确认${action}功能`,
          content,
          okText: '确定',
          cancelText: '取消',
          centered: true,
          okType: !isEnabled ? 'primary' : 'danger',
          onOk: () => resolve(),
          onCancel: () => reject(new Error('用户取消'))
        })
      })
      
      await toggleFeature(feature.featureCode, newState)
      message.success(`${feature.featureName}已${action}`)
      
      // 刷新数据
      await loadData()
    } catch (error) {
      if (error.message !== '用户取消') {
        console.error('切换功能开关失败:', error)
        // 响应拦截器已统一处理错误提示
      }
      // 恢复原状态
      feature.enabled = oldState
    }
  }

  /**
   * 构建树形结构数据
   */
  const treeData = computed(() => {
    return groupList.value.map(group => ({
      ...group,
      features: getFeaturesByGroup(group.groupCode).map(feature => ({
        ...feature,
        configs: getConfigsByFeature(feature.featureCode)
      }))
    }))
  })

  return {
    loading,
    groupList,
    featureList,  // 导出功能列表供表单使用
    configList,
    activeKeys,
    treeData,
    loadData,
    getFeaturesByGroup,
    getConfigsByFeature,
    handleFeatureToggle
  }
}
