import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { deleteSystemConfig, refreshSystemConfigCache } from '@/api/systemConfig'

/**
 * 配置操作管理 Composable
 */
export function useConfigOperations(loadData) {
  const refreshLoading = ref(false)

  // 删除配置
  const handleDelete = (record) => {
    if (record.isSystem) {
      message.warning('系统内置配置不可删除')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除配置"${record.configName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteSystemConfig(record.id)
          message.success('删除配置成功')
          await loadData()
        } catch (error) {
          console.error('删除配置失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      refreshLoading.value = true
      await refreshSystemConfigCache()
      message.success('缓存刷新成功')
    } catch (error) {
      console.error('刷新缓存失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      refreshLoading.value = false
    }
  }

  return {
    refreshLoading,
    handleDelete,
    handleRefreshCache
  }
}
