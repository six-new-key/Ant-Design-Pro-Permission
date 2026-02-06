import { Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import { deleteMenu, updateMenuStatus } from '@/api/menu'

/**
 * 菜单操作
 */
export function useMenuOperations(fetchMenuList) {
  /**
   * 删除菜单
   */
  const handleDelete = async (row) => {
    const response = await deleteMenu(row.id)
    if (response.code === 200) {
      Message.success('删除成功')
      fetchMenuList()
    }
  }

  /**
   * 切换菜单状态（启用/禁用）
   */
  const handleToggleStatus = (record) => {
    const action = record.status === 1 ? '禁用' : '启用'
    const okType = record.status === 1 ? 'danger' : 'primary'

    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}菜单 "${record.title}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: okType,
      centered: true,
      onOk: async () => {
        const response = await updateMenuStatus(record.id)
        if (response.code === 200) {
          Message.success(`${action}成功`)
          fetchMenuList()
        }
      }
    })
  }

  /**
   * 获取类型颜色
   */
  const getTypeColor = (type) => {
    const map = {
      0: 'blue',
      1: 'green',
      2: 'orange'
    }
    return map[type] || 'default'
  }

  /**
   * 获取类型标签
   */
  const getTypeLabel = (type) => {
    const map = {
      0: '目录',
      1: '菜单',
      2: '按钮'
    }
    return map[type] || '未知'
  }

  /**
   * 获取链接类型颜色
   */
  const getLinkTypeColor = (linkType) => {
    const map = {
      0: 'blue',
      1: 'purple',
      2: 'cyan'
    }
    return map[linkType] || 'default'
  }

  /**
   * 获取链接类型标签
   */
  const getLinkTypeLabel = (linkType) => {
    const map = {
      0: '内部路由',
      1: '外链',
      2: '内嵌iframe'
    }
    return map[linkType] || '未知'
  }

  /**
   * 判断是否为 Ant Design 图标
   */
  const isAntDesignIcon = (iconName) => {
    // 假设以大写字母开头并以Outlined/Filled/TwoTone结尾的是Ant Design图标
    return /^[A-Z].*(Outlined|Filled|TwoTone)$/.test(iconName)
  }

  return {
    handleDelete,
    handleToggleStatus,
    getTypeColor,
    getTypeLabel,
    getLinkTypeColor,
    getLinkTypeLabel,
    isAntDesignIcon
  }
}
