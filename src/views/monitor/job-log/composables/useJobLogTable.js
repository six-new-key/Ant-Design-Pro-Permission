import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getJobLogPage } from '@/api/job'
import { message } from 'ant-design-vue'

export function useJobLogTable() {
  const route = useRoute()
  const loading = ref(false)
  const dataSource = ref([])
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`
  })

  const searchForm = reactive({
    jobName: route.query.jobName || '',
    jobGroup: undefined,
    status: undefined
  })

  const columns = [
    {
      title: '日志ID',
      dataIndex: 'logId',
      key: 'logId',
      width: 80
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 150
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
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180
    },
    {
      title: '执行耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
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
      const res = await getJobLogPage(params)
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
    searchForm.jobName = route.query.jobName || ''
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

  onMounted(() => {
    loadData()
  })

  return {
    loading,
    dataSource,
    pagination,
    searchForm,
    columns,
    loadData,
    handleSearch,
    handleReset,
    handleTableChange
  }
}
