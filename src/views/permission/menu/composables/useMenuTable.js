import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { queryMenuList, queryMenuListByLike } from '@/api/menu'

/**
 * 菜单表格管理
 */
export function useMenuTable(searchForm) {
  const loading = ref(false)
  const tableData = ref([])
  const expandedRowKeys = ref([])
  const isExpandAll = ref(false)
  const isFullscreen = ref(false)

  // 表格列配置
  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      fixed: 'left'
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 120
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      width: 180,
      ellipsis: true
    },
    {
      title: '重定向路径',
      dataIndex: 'redirect',
      key: 'redirect',
      width: 180,
      ellipsis: true
    },
    {
      title: '路由名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      width: 200,
      ellipsis: true
    },
    {
      title: '外链地址',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      width: 200,
      ellipsis: true
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
      width: 180,
      ellipsis: true
    },
    {
      title: '接口路径',
      dataIndex: 'apiPath',
      key: 'apiPath',
      width: 180,
      ellipsis: true
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '操作',
      key: 'operation',
      width: 280,
      fixed: 'right'
    }
  ]

  // 表格最大高度
  const tableMaxHeight = computed(() => {
    return isFullscreen.value ? undefined : '520px'
  })

  /**
   * 加载菜单列表
   */
  const fetchMenuList = async () => {
    loading.value = true
    try {
      let response
      if (searchForm.title || searchForm.type !== undefined || searchForm.status !== undefined) {
        const params = {
          title: searchForm.title ? searchForm.title.trim() : '',
          type: searchForm.type !== undefined ? searchForm.type : '',
          status: searchForm.status !== undefined ? Number(searchForm.status) : ''
        }
        response = await queryMenuListByLike(params)
      } else {
        response = await queryMenuList()
      }

      if (response.code === 200) {
        tableData.value = response.data || []
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 展开/收起行
   */
  const onExpand = (expanded, record) => {
    if (expanded) {
      expandedRowKeys.value = [...expandedRowKeys.value, record.id]
    } else {
      expandedRowKeys.value = expandedRowKeys.value.filter(k => k !== record.id)
    }
  }

  /**
   * 获取所有节点ID
   */
  const getAllNodeIds = (nodes) => {
    const ids = []
    const traverse = (list) => {
      list.forEach(node => {
        ids.push(node.id)
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return ids
  }

  /**
   * 展开/收起所有
   */
  const handleExpandAll = () => {
    isExpandAll.value = !isExpandAll.value
    if (isExpandAll.value) {
      expandedRowKeys.value = getAllNodeIds(tableData.value)
    } else {
      expandedRowKeys.value = []
    }
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
    expandedRowKeys,
    isExpandAll,
    columns,
    tableMaxHeight,
    fetchMenuList,
    onExpand,
    handleExpandAll
  }
}
