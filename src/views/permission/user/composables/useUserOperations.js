import { Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { batchDeleteUser, updateUserStatus, kickoutUser } from '@/api/user'

/**
 * 用户操作管理（删除、启用/禁用、踢人下线）
 */
export function useUserOperations(fetchUserList, selectedRowKeys) {
  /**
   * 删除单个用户
   */
  const handleDelete = async (record) => {
    const response = await batchDeleteUser([record.id])
    if (response.code === 200) {
      Message.success('删除成功')
      fetchUserList()
    }
  }

  /**
   * 批量删除用户
   */
  const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) {
      Message.warning('请选择要删除的用户')
      return
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？此操作不可撤销。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        const response = await batchDeleteUser(selectedRowKeys.value)
        if (response.code === 200) {
          Message.success('批量删除成功')
          selectedRowKeys.value = []
          fetchUserList()
        }
      }
    })
  }

  /**
   * 切换用户状态（启用/禁用）
   */
  const handleToggleStatus = (record) => {
    const action = record.status === 1 ? '禁用' : '启用'
    const okType = record.status === 1 ? 'danger' : 'primary'

    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}用户 "${record.userName}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: okType,
      centered: true,
      onOk: async () => {
        const response = await updateUserStatus(record.id)
        if (response.code === 200) {
          Message.success(`${action}成功`)
          fetchUserList()
        }
      }
    })
  }

  /**
   * 踢人下线
   */
  const handleKickout = (record) => {
    Modal.confirm({
      title: '确认踢人下线',
      content: `确定要强制用户 "${record.userName}" 下线吗？该用户需要重新登录。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        const response = await kickoutUser(record.id)
        if (response.code === 200) {
          Message.success('已强制用户下线')
        }
      }
    })
  }

  return {
    handleDelete,
    handleBatchDelete,
    handleToggleStatus,
    handleKickout
  }
}
