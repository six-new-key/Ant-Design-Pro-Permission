import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { exportUser, importUser, downloadTemplate } from '@/api/user'
import { downloadExcel } from '@/utils/download'

/**
 * 用户导入导出功能
 */
export function useUserImportExport(searchForm, fetchUserList, pagination) {
  // 导入对话框
  const importDialogVisible = ref(false)
  const importLoading = ref(false)
  const fileList = ref([])

  /**
   * 导出用户
   * 支持分页导出和过滤条件导出
   */
  const handleExport = async () => {
    Modal.confirm({
      title: '确认导出',
      content: '确定要导出用户数据吗？',
      okText: '确定',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        message.loading({ content: '正在导出...', key: 'export', duration: 0 })
        
        // 合并搜索条件和分页参数
        const exportParams = {
          userName: searchForm.userName || undefined,
          phone: searchForm.phone || undefined,
          status: searchForm.status,
          gender: searchForm.gender,
          // 传递当前页的分页参数，支持分页导出
          pageNo: pagination?.current || 1,
          pageSize: pagination?.pageSize || 10
        }
        
        const response = await exportUser(exportParams)
        
        downloadExcel(response.data, response.headers, `用户数据_${new Date().getTime()}.xlsx`)
        
        message.success({ content: '导出成功', key: 'export' })
      }
    })
  }

  /**
   * 打开导入对话框
   */
  const handleImport = () => {
    importDialogVisible.value = true
    fileList.value = []
  }

  /**
   * 下载导入模板
   */
  const handleDownloadTemplate = async () => {
    message.loading({ content: '正在下载模板...', key: 'template', duration: 0 })
    
    const response = await downloadTemplate()
    
    downloadExcel(response.data, response.headers, `用户导入模板_${new Date().getTime()}.xlsx`)
    
    message.success({ content: '模板下载成功', key: 'template' })
  }

  /**
   * 文件上传前校验
   */
  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.type === 'application/vnd.ms-excel'
    if (!isExcel) {
      message.error('只能上传 Excel 文件！')
      return false
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB！')
      return false
    }
    
    // 检查文件数量限制
    if (fileList.value.length >= 5) {
      message.error('最多只能选择 5 个文件！')
      return false
    }
    
    fileList.value = [...fileList.value, file]
    return false // 阻止自动上传
  }

  /**
   * 移除文件
   */
  const handleRemove = (file) => {
    const index = fileList.value.indexOf(file)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }

  /**
   * 提交导入（默认支持更新已存在的用户）
   */
  const handleSubmitImport = async () => {
    if (fileList.value.length === 0) {
      message.warning('请选择要导入的文件')
      return
    }

    try {
      importLoading.value = true
      
      const formData = new FormData()
      // 添加多个文件（从 fileList 中提取原始 File 对象）
      fileList.value.forEach(fileItem => {
        // fileItem 可能是 { originFileObj: File } 或直接是 File
        const file = fileItem.originFileObj || fileItem
        formData.append('files', file)
      })
      formData.append('updateSupport', true) // 默认支持更新
      
      const response = await importUser(formData)
      
      // 显示导入结果
      message.success(response.data || '导入成功')
      
      // 关闭对话框并刷新列表
      importDialogVisible.value = false
      fileList.value = []
      fetchUserList()
    } finally {
      importLoading.value = false
    }
  }

  /**
   * 取消导入
   */
  const handleCancelImport = () => {
    importDialogVisible.value = false
    fileList.value = []
  }

  return {
    // 状态
    importDialogVisible,
    importLoading,
    fileList,
    
    // 方法
    handleExport,
    handleImport,
    handleDownloadTemplate,
    beforeUpload,
    handleRemove,
    handleSubmitImport,
    handleCancelImport
  }
}
