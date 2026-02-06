import { ref, reactive } from 'vue'
import { getOnlineUsers } from '@/api/online'
import { message } from 'ant-design-vue'

export function useOnlineUserTable() {
  const loading = ref(false)
  const dataSource = ref([])
  
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  
  const searchForm = reactive({
    userId: '',
    username: ''
  })
  
  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      align: 'center'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      align: 'center'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
      align: 'center'
    },
    {
      title: '归属地',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      align: 'center'
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      align: 'center'
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      align: 'center'
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      align: 'center'
    },
    {
      title: '剩余时长',
      dataIndex: 'remainingSeconds',
      key: 'remainingSeconds',
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right'
    }
  ]
  
  // 加载数据
  const loadData = async () => {
    loading.value = true
    try {
      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        userId: searchForm.userId || undefined,
        username: searchForm.username || undefined
      }
      
      const res = await getOnlineUsers(params)
      
      if (res.code === 200) {
        dataSource.value = res.data.records
        pagination.total = res.data.total
      } else {
        message.error(res.message || '查询失败')
      }
    } catch (error) {
      console.error('查询在线用户失败:', error)
      message.error('查询失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }
  
  // 重置
  const handleReset = () => {
    searchForm.userId = ''
    searchForm.username = ''
    pagination.current = 1
    loadData()
  }
  
  // 分页变化
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
    loadData,
    handleSearch,
    handleReset,
    handleTableChange
  }
}
