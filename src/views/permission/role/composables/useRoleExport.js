import { ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { downloadFile } from '@/utils/download'
import { exportRole } from '@/api/role'

/**
 * 角色导出功能
 */
export function useRoleExport(searchForm) {
  const exportLoading = ref(false)

  /**
   * 导出角色
   */
  const handleExport = async () => {
    Modal.confirm({
      title: '确认导出',
      content: '确定要导出角色数据吗？',
      okText: '确定',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          exportLoading.value = true
          const params = {
            name: searchForm.name || '',
            code: searchForm.code || '',
            status: searchForm.status !== undefined ? searchForm.status : ''
          }
          const response = await exportRole(params)
          downloadFile(response, '角色列表.xlsx')
          Message.success('导出成功')
        } catch (error) {
          console.error('导出失败:', error)
          Message.error('导出失败')
        } finally {
          exportLoading.value = false
        }
      }
    })
  }

  return {
    exportLoading,
    handleExport
  }
}
