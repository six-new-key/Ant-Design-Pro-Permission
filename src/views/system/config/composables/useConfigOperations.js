import { ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { updateSystemConfig, deleteSystemConfig, refreshSystemConfigCache } from '@/api/systemConfig'
import { Message } from '@/utils'

/**
 * 配置操作管理
 */
export function useConfigOperations(refreshCallback) {
  const refreshLoading = ref(false)
  const submitLoading = ref(false)

  /**
   * 配置开关切换
   */
  const handleConfigChange = async (record, checked) => {
    record.loading = true
    try {
      const response = await updateSystemConfig({
        configKey: record.configKey,
        configValue: checked ? 'true' : 'false'
      })
      if (response.code === 200) {
        Message.success(`${record.configName}已${checked ? '启用' : '禁用'}`)
        record.configValue = checked ? 'true' : 'false'
      } else {
        // 失败时恢复开关状态
        record.configValue = checked ? 'false' : 'true'
      }
    } finally {
      record.loading = false
    }
  }

  /**
   * 提交编辑
   */
  const handleEditSubmit = async (currentConfig, editForm, closeCallback) => {
    submitLoading.value = true
    try {
      const response = await updateSystemConfig({
        configKey: currentConfig.configKey,
        configValue: editForm.value.toString()
      })
      if (response.code === 200) {
        Message.success('配置更新成功')
        currentConfig.configValue = editForm.value.toString()
        if (closeCallback) {
          closeCallback()
        }
      }
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 删除配置
   */
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除配置"${record.configName}"吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await deleteSystemConfig(record.id)
          if (response.code === 200) {
            Message.success('删除配置成功')
            if (refreshCallback) {
              await refreshCallback()
            }
          }
        } catch (error) {
          console.error('删除失败:', error)
        }
      }
    })
  }

  /**
   * 刷新缓存
   */
  const handleRefreshCache = async () => {
    refreshLoading.value = true
    try {
      const response = await refreshSystemConfigCache()
      if (response.code === 200) {
        Message.success('缓存刷新成功')
        if (refreshCallback) {
          await refreshCallback()
        }
      }
    } finally {
      refreshLoading.value = false
    }
  }

  return {
    refreshLoading,
    submitLoading,
    handleConfigChange,
    handleEditSubmit,
    handleDelete,
    handleRefreshCache
  }
}
