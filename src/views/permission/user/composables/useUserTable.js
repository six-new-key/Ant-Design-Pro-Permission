import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { queryUserList } from '@/api/user'

/**
 * 用户表格管理
 */
export function useUserTable(searchForm) {
  const loading = ref(false)
  const tableData = ref([])
  const selectedRowKeys = ref([])
  const isFullscreen = ref(false)

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })

  // 表格列配置
  const columns = [
    {
      title: '用户编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left'
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
      width: 140
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
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
      width: 140
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 180
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
      width: 180
    },
    {
      title: '操作',
      key: 'operation',
      width: 400,
      fixed: 'right'
    }
  ]

  // 表格最大高度
  const tableMaxHeight = computed(() => {
    return isFullscreen.value ? undefined : '420px'
  })

  /**
   * 加载用户列表
   */
  const fetchUserList = async () => {
    loading.value = true
    const params = {
      userName: searchForm.userName ? searchForm.userName.trim() : '',
      phone: searchForm.phone ? searchForm.phone.trim() : '',
      status: searchForm.status !== undefined ? Number(searchForm.status) : '',
      gender: searchForm.gender !== undefined ? Number(searchForm.gender) : ''
    }

    const response = await queryUserList(pagination.current, pagination.pageSize, params)
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
    disabled: record.id === 1,
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

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    isFullscreen.value = !!document.fullscreenElement
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
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
    handleTableChange
  }
}
