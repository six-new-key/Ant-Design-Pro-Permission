import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { queryUserList } from '@/api/user'

/**
 * 用户表格管理
 */
export function useUserTable(searchForm) {
  const loading = ref(false)
  const tableData = ref([])
  const selectedRowKeys = ref([])
  const isFullscreen = ref(false)
  const searchVisible = ref(true)

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100']
  })

  // 表格列配置
  const columns = [
    {
      title: '用户编号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      fixed: 'left',
      customRender: ({ text }) => ({
        children: text,
        props: {
          style: { cursor: 'text', userSelect: 'text' }
        }
      })
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 140,
      ellipsis: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 140
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '最后登录IP',
      dataIndex: 'lastLoginIp',
      key: 'lastLoginIp',
      width: 140,
      ellipsis: true
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 180,
      ellipsis: true
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'operation',
      width: 320,
      fixed: 'right'
    }
  ]

  // 表格最大高度（不设置，让表格自适应）
  const tableMaxHeight = ref(undefined)
  
  const calculateTableHeight = () => {
    // 不再计算高度，让表格自适应
    tableMaxHeight.value = undefined
  }

  // 监听搜索栏显隐变化
  const updateTableHeight = (visible) => {
    searchVisible.value = visible
    // 不需要重新计算高度
  }

  /**
   * 加载用户列表
   */
  const fetchUserList = async () => {
    loading.value = true
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      userName: searchForm.userName ? searchForm.userName.trim() : undefined,
      phone: searchForm.phone ? searchForm.phone.trim() : undefined,
      status: searchForm.status !== undefined ? Number(searchForm.status) : undefined,
      gender: searchForm.gender !== undefined ? Number(searchForm.gender) : undefined
    }

    const response = await queryUserList(params)
    if (response.code === 200 && response.data !== null) {
      tableData.value = response.data.data || []
      pagination.total = response.data.total || 0
    }
    loading.value = false
  }

  /**
   * 行选择变化
   */
  const onSelectChange = (keys) => {
    selectedRowKeys.value = keys
  }

  /**
   * 复选框属性
   */
  const getCheckboxProps = (record) => ({
    disabled: record.userName === 'admin',
  })

  /**
   * 表格变化（分页、排序、筛选）
   */
  const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    fetchUserList()
  }

  /**
   * 全屏变化监听
   */
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  /**
   * 窗口大小变化监听
   */
  const handleResize = () => {
    // 不需要重新计算高度
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('resize', handleResize)
    isFullscreen.value = !!document.fullscreenElement
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    window.removeEventListener('resize', handleResize)
  })

  return {
    loading,
    tableData,
    selectedRowKeys,
    pagination,
    columns,
    tableMaxHeight,
    fetchUserList,
    onSelectChange,
    getCheckboxProps,
    handleTableChange,
    updateTableHeight
  }
}
