import { Modal, message } from 'ant-design-vue'
import { deleteJob, batchDeleteJobs, changeStatus, runJob } from '@/api/job'
import { useRouter } from 'vue-router'

export function useJobOperations(loadData, selectedRowKeys) {
  const router = useRouter()

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${record.jobName}"吗？`,
      onOk: async () => {
        try {
          const res = await deleteJob(record.jobId)
          if (res.code === 200) {
            message.success('删除成功')
            loadData()
          }
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请选择要删除的任务')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 个任务吗？`,
      onOk: async () => {
        try {
          const res = await batchDeleteJobs(selectedRowKeys.value)
          if (res.code === 200) {
            message.success('删除成功')
            selectedRowKeys.value = []
            loadData()
          }
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleChangeStatus = (record, newStatus) => {
    const statusText = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: '确认操作',
      content: `确定要${statusText}任务"${record.jobName}"吗？`,
      onOk: async () => {
        try {
          const res = await changeStatus(record.jobId, newStatus)
          if (res.code === 200) {
            message.success(`${statusText}成功`)
            loadData()
          }
        } catch (error) {
          message.error(`${statusText}失败`)
        }
      }
    })
  }

  const handleRun = (record) => {
    Modal.confirm({
      title: '确认执行',
      content: `确定要立即执行任务"${record.jobName}"吗？`,
      onOk: async () => {
        try {
          const res = await runJob(record.jobId)
          if (res.code === 200) {
            message.success('任务已触发执行')
          }
        } catch (error) {
          message.error('执行失败')
        }
      }
    })
  }

  const handleViewLog = (record) => {
    router.push({
      path: '/monitor/job-log',
      query: { jobId: record.jobId, jobName: record.jobName }
    })
  }

  return {
    handleDelete,
    handleBatchDelete,
    handleChangeStatus,
    handleRun,
    handleViewLog
  }
}
