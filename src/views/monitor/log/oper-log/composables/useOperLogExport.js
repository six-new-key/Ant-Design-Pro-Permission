import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { exportOperLog } from '@/api/operlog'
import { downloadFile } from '@/utils/download'

/**
 * 操作日志导出逻辑
 */
export function useOperLogExport(searchForm, pagination) {
  const exportLoading = ref(false)

  /**
   * 导出操作日志
   */
  const handleExport = async () => {
    try {
      exportLoading.value = true

      // 构建导出参数（包含搜索条件和分页参数）
      const exportParams = {
        title: searchForm.title,
        operName: searchForm.operName,
        businessType: searchForm.businessType,
        status: searchForm.status,
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      }

      const response = await exportOperLog(exportParams)
      downloadFile(response, '操作日志.xlsx')
      message.success('导出成功')
    } catch (error) {
      console.error('导出操作日志失败：', error)
      message.error(error.message || '导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  return {
    exportLoading,
    handleExport
  }
}
