import { message, Modal } from 'ant-design-vue'
import { 
  deleteAnnouncement, 
  publishAnnouncement, 
  revokeAnnouncement, 
  toggleAnnouncementTop 
} from '@/api/announcement'

/**
 * 公告操作 Composable
 */
export function useAnnouncementOps(loadList) {
  
  // 删除公告
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除公告"${record.title}"吗？删除后无法恢复！`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deleteAnnouncement(record.id)
          message.success('删除公告成功')
          await loadList()
        } catch (error) {
          console.error('删除公告失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 批量删除公告
  const handleBatchDelete = (ids) => {
    if (!ids || ids.length === 0) {
      message.warning('请选择要删除的公告')
      return
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${ids.length} 条公告吗？删除后无法恢复！`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await deleteAnnouncement(ids)
          message.success('批量删除公告成功')
          await loadList()
        } catch (error) {
          console.error('批量删除公告失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 发布公告
  const handlePublish = (record) => {
    Modal.confirm({
      title: '确认发布',
      content: `确定要发布公告"${record.title}"吗？\n\n发布后，公告将对所有用户可见。`,
      okText: '确定',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          await publishAnnouncement(record.id)
          message.success('发布公告成功')
          await loadList()
        } catch (error) {
          console.error('发布公告失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 撤回公告
  const handleRevoke = (record) => {
    Modal.confirm({
      title: '确认撤回',
      content: `确定要撤回公告"${record.title}"吗？\n\n撤回后，公告将不再对用户可见。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await revokeAnnouncement(record.id)
          message.success('撤回公告成功')
          await loadList()
        } catch (error) {
          console.error('撤回公告失败:', error)
          // 响应拦截器已统一处理错误提示
        }
      }
    })
  }

  // 切换置顶状态
  const handleToggleTop = async (record) => {
    const isTop = record.isTop === 1 ? 0 : 1
    const action = isTop === 1 ? '置顶' : '取消置顶'
    
    try {
      await toggleAnnouncementTop(record.id, isTop)
      message.success(`${action}成功`)
      await loadList()
    } catch (error) {
      console.error(`${action}失败:`, error)
      // 响应拦截器已统一处理错误提示
    }
  }

  return {
    handleDelete,
    handleBatchDelete,
    handlePublish,
    handleRevoke,
    handleToggleTop
  }
}
