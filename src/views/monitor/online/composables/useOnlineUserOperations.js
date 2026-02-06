import { ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { forceLogout } from '@/api/online'
import { message } from 'ant-design-vue'

export function useOnlineUserOperations(loadData) {
  const operationLoading = ref(false)
  
  // 强制下线
  const handleForceLogout = (record) => {
    Modal.confirm({
      title: '强退确认',
      content: `确定要强制用户 "${record.username}" 下线吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        operationLoading.value = true
        try {
          const res = await forceLogout(record.userId)
          
          if (res.code === 200) {
            message.success('用户已强制下线')
            // 刷新列表
            loadData()
          } else {
            message.error(res.message || '操作失败')
          }
        } catch (error) {
          console.error('强制下线失败:', error)
          message.error('操作失败，请稍后重试')
        } finally {
          operationLoading.value = false
        }
      }
    })
  }
  
  return {
    operationLoading,
    handleForceLogout
  }
}
