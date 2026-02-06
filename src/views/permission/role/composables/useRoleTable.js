import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { queryRoleListByPage } from '@/api/role'

/**
 * 角色表格管理
 */
export function useRoleTable(searchForm) {
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
      title: '角色编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left'
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120
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
      width: 200,
      fixed: 'right'
    }
  ]

  // 表格最大高度
  const tableMaxHeight = computed(() => {
    return isFullscreen.value ? undefined : '420px'
  })

  /**
   * 加载角色列表
   */
  const fetchRoleList = async () => {
    loading.value = true
    const params = {
      name: searchForm.name ? searchForm.name.trim() : '',
      code: searchForm.code ? searchForm.code.trim() : '',
      status: searchForm.status !== undefined ? Number(searchForm.status) : null
    }

    const response = await queryRoleListByPage(pagination.current, pagination.pageSize, params)
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
    disabled: record.code === 'admin',
  })

  /**
   * 表格变化（分页、排序、筛选）
   */
  const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    fetchRoleList()
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
    fetchRoleList,
    onSelectChange,
    getCheckboxProps,
    handleTableChange
  }
}
