import { Modal } from 'ant-design-vue'
import { deleteTemplate, copyTemplate } from '@/api/announcement/template'
import message from '@/utils/message'
import { ref } from 'vue'

export function useTemplateOps(refreshList) {
  // 预览相关
  const previewVisible = ref(false)
  const previewTemplate = ref(null)

  // 删除模板
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板"${record.name}"吗？`,
      centered: true,
      onOk: async () => {
        try {
          await deleteTemplate(record.id)
          message.success('删除模板成功')
          refreshList()
        } catch (error) {
          console.error('删除模板失败:', error)
        }
      }
    })
  }

  // 批量删除模板
  const handleBatchDelete = (ids) => {
    if (!ids || ids.length === 0) {
      message.warning('请选择要删除的模板')
      return
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${ids.length} 个模板吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deleteTemplate(ids)
          message.success('批量删除模板成功')
          refreshList()
        } catch (error) {
          console.error('批量删除模板失败:', error)
        }
      }
    })
  }

  // 复制模板
  const handleCopy = (record) => {
    Modal.confirm({
      title: '确认复制',
      content: `确定要复制模板"${record.name}"吗？`,
      centered: true,
      onOk: async () => {
        try {
          await copyTemplate(record.id)
          message.success('复制模板成功')
          refreshList()
        } catch (error) {
          console.error('复制模板失败:', error)
        }
      }
    })
  }

  // 预览模板
  const handlePreview = (record) => {
    previewTemplate.value = record
    previewVisible.value = true
  }

  // 关闭预览
  const handleClosePreview = () => {
    previewVisible.value = false
    previewTemplate.value = null
  }

  return {
    handleDelete,
    handleBatchDelete,
    handleCopy,
    handlePreview,
    previewVisible,
    previewTemplate,
    handleClosePreview
  }
}
