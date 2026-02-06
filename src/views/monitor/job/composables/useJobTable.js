import { ref, reactive } from 'vue'
import { getJobPage } from '@/api/job'
import { message } from 'ant-design-vue'

export function useJobTable() {
  const loading = ref(false)
  const dataSource = ref([])
  const selectedRowKeys = ref([])
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`
  })

  const searchForm = reactive({
    jobName: '',
    jobGroup: undefined,
    status: undefined
  })

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 80
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 150,
      ellipsis: true
    },
    {
      title: '任务组名',
      dataIndex: 'jobGroup',
      key: 'jobGroup',
      width: 120
    },
    {
      title: '调用目标',
      dataIndex: 'invokeTarget',
      key: 'invokeTarget',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '下次执行时间',
      dataIndex: 'nextValidTime',
      key: 'nextValidTime',
      width: 180
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right'
    }
  ]

  const loadData = async () => {
    loading.value = true
    try {
      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      const res = await getJobPage(params)
      if (res.code === 200) {
        dataSource.value = res.data.records
        pagination.total = res.data.total
      }
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.jobName = ''
    searchForm.jobGroup = undefined
    searchForm.status = undefined
    pagination.current = 1
    loadData()
  }

  const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    loadData()
  }

  return {
    loading,
    dataSource,
    pagination,
    searchForm,
    columns,
    selectedRowKeys,
    loadData,
    handleSearch,
    handleReset,
    handleTableChange
  }
}
