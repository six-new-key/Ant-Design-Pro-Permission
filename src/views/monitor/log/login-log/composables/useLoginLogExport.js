import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { exportLoginLog } from '@/api/logininfor'
import { downloadFile } from '@/utils/download'

/**
 * 登录日志导出逻辑
 */
export function useLoginLogExport(searchForm, pagination) {
  const exportLoading = ref(false)

  /**
   * 导出登录日志
   */
  const handleExport = async () => {
    try {
      exportLoading.value = true

      // 构建导出参数（包含搜索条件和分页参数）
      const exportParams = {
        username: searchForm.username,
        status: searchForm.status,
        ipaddr: searchForm.ipaddr,
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      }

      const response = await exportLoginLog(exportParams)
      downloadFile(response, '登录日志.xlsx')
      message.success('导出成功')
    } catch (error) {
      console.error('导出登录日志失败：', error)
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
