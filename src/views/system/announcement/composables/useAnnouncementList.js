import { ref } from 'vue'
import { getAnnouncementPage } from '@/api/announcement'

/**
 * 公告列表 Composable
 */
export function useAnnouncementList() {
  const loading = ref(false)
  const announcementList = ref([])
  const total = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const filterType = ref(null)
  const filterStatus = ref(null)

  // 加载公告列表（后端分页）
  const loadAnnouncementList = async () => {
    loading.value = true
    try {
      const data = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        keyword: keyword.value,
        type: filterType.value,
        status: filterStatus.value
      }
      const res = await getAnnouncementPage(data)
      announcementList.value = res.data.data || []
      total.value = res.data.total || 0
    } catch (error) {
      console.error('加载公告列表失败:', error)
      // 响应拦截器已统一处理错误提示
    } finally {
      loading.value = false
    }
  }

  // 分页变化
  const handlePageChange = (page, size) => {
    pageNo.value = page
    pageSize.value = size
    loadAnnouncementList()
  }

  // 搜索
  const handleSearch = (value) => {
    keyword.value = value
    pageNo.value = 1 // 重置到第一页
    loadAnnouncementList()
  }

  // 类型过滤
  const handleTypeFilter = (type) => {
    filterType.value = type
    pageNo.value = 1 // 重置到第一页
    loadAnnouncementList()
  }

  // 状态过滤
  const handleStatusFilter = (status) => {
    filterStatus.value = status
    pageNo.value = 1 // 重置到第一页
    loadAnnouncementList()
  }

  return {
    loading,
    announcementList,
    total,
    pageNo,
    pageSize,
    keyword,
    filterType,
    filterStatus,
    loadAnnouncementList,
    handlePageChange,
    handleSearch,
    handleTypeFilter,
    handleStatusFilter
  }
}
