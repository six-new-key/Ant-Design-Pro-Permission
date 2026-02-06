import { Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { batchDeleteRole, updateRoleStatus } from '@/api/role'

/**
 * 角色操作管理（删除、启用/禁用）
 */
export function useRoleOperations(fetchRoleList, selectedRowKeys) {
  /**
   * 删除单个角色
   */
  const handleDelete = async (record) => {
    const response = await batchDeleteRole([record.id])
    if (response.code === 200) {
      Message.success('删除成功')
      fetchRoleList()
    }
  }

  /**
   * 批量删除角色
   */
  const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) {
      Message.warning('请选择要删除的角色')
      return
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 个角色吗？此操作不可撤销。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        const response = await batchDeleteRole(selectedRowKeys.value)
        if (response.code === 200) {
          Message.success('批量删除成功')
          selectedRowKeys.value = []
          fetchRoleList()
        }
      }
    })
  }

  /**
   * 切换角色状态（启用/禁用）
   */
  const handleToggleStatus = (record) => {
    const action = record.status === 1 ? '禁用' : '启用'
    const okType = record.status === 1 ? 'danger' : 'primary'

    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}角色 "${record.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: okType,
      centered: true,
      onOk: async () => {
        const response = await updateRoleStatus(record.id)
        if (response.code === 200) {
          Message.success(`${action}成功`)
          fetchRoleList()
        }
      }
    })
  }

  return {
    handleDelete,
    handleBatchDelete,
    handleToggleStatus
  }
}
