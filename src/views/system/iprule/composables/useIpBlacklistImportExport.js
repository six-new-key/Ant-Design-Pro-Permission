import { ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { downloadFile } from '@/utils/download'
import {
  exportIpBlacklist,
  importIpBlacklist,
  downloadIpBlacklistTemplate
} from '@/api/iprule'

/**
 * IP黑名单导入导出功能
 */
export function useIpBlacklistImportExport(fetchList, searchForm) {
  const importDialogVisible = ref(false)
  const importFileList = ref([])
  const importLoading = ref(false)
  const updateSupport = ref(true)
  const exportLoading = ref(false)

  /**
   * 导出IP黑名单
   */
  const handleExport = async () => {
    Modal.confirm({
      title: '确认导出',
      content: '确定要导出IP黑名单数据吗？',
      okText: '确定',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          exportLoading.value = true
          const params = {
            status: searchForm.status !== undefined ? searchForm.status : ''
          }
          const response = await exportIpBlacklist(params)
          downloadFile(response, 'IP黑名单.xlsx')
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

  /**
   * 打开导入对话框
   */
  const handleImport = () => {
    importDialogVisible.value = true
    importFileList.value = []
    updateSupport.value = true
  }

  /**
   * 下载导入模板
   */
  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadIpBlacklistTemplate()
      downloadFile(response, 'IP黑名单导入模板.xlsx')
      Message.success('模板下载成功')
    } catch (error) {
      console.error('模板下载失败:', error)
      Message.error('模板下载失败')
    }
  }

  /**
   * 文件上传前的校验
   */
  const beforeUpload = (file) => {
    const isExcel =
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    if (!isExcel) {
      Message.error('只能上传 Excel 文件（.xls 或 .xlsx）')
      return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      Message.error('文件大小不能超过 10MB')
      return false
    }

    if (importFileList.value.length >= 5) {
      Message.error('最多只能上传 5 个文件')
      return false
    }

    return true
  }

  /**
   * 文件上传变化
   */
  const handleFileChange = ({ fileList }) => {
    importFileList.value = fileList
  }

  /**
   * 提交导入
   */
  const handleImportSubmit = async () => {
    if (importFileList.value.length === 0) {
      Message.warning('请选择要导入的文件')
      return
    }

    try {
      importLoading.value = true

      const formData = new FormData()
      importFileList.value.forEach((file) => {
        formData.append('files', file.originFileObj)
      })
      formData.append('updateSupport', updateSupport.value)

      const response = await importIpBlacklist(formData)

      if (response.code === 200) {
        Message.success(response.data || '导入成功')
        importDialogVisible.value = false
        importFileList.value = []
        fetchList()
      }
    } catch (error) {
      console.error('导入失败:', error)
    } finally {
      importLoading.value = false
    }
  }

  /**
   * 取消导入
   */
  const handleImportCancel = () => {
    importDialogVisible.value = false
    importFileList.value = []
    updateSupport.value = true
  }

  return {
    // 导出相关
    exportLoading,
    handleExport,

    // 导入相关
    importDialogVisible,
    importFileList,
    importLoading,
    updateSupport,
    handleImport,
    handleDownloadTemplate,
    beforeUpload,
    handleFileChange,
    handleImportSubmit,
    handleImportCancel
  }
}
