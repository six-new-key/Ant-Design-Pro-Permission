import { ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { cleanJobLog } from '@/api/job'
import { useRouter } from 'vue-router'

export function useJobLogOperations(loadData) {
  const router = useRouter()
  const exceptionVisible = ref(false)
  const exceptionInfo = ref('')

  const handleBack = () => {
    router.back()
  }

  const handleClean = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有任务日志吗？此操作不可恢复！',
      onOk: async () => {
        try {
          const res = await cleanJobLog()
          if (res.code === 200) {
            message.success('清空成功')
            loadData()
          }
        } catch (error) {
          message.error('清空失败')
        }
      }
    })
  }

  const handleViewException = (record) => {
    exceptionInfo.value = record.exceptionInfo || '无异常信息'
    exceptionVisible.value = true
  }

  return {
    exceptionVisible,
    exceptionInfo,
    handleBack,
    handleClean,
    handleViewException
  }
}
