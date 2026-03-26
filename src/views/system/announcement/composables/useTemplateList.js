import { ref } from 'vue'
import { getTemplatePage, getTemplateList } from '@/api/announcement/template'

export function useTemplateList() {
  const loading = ref(false)
  const templateList = ref([])
  const allTemplates = ref([])
  const total = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const filterType = ref(null)
  const filterIsSystem = ref(null)
  const filterCategory = ref(null)

  // 加载模板列表（分页）
  const loadTemplateList = async () => {
    loading.value = true
    try {
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
        type: filterType.value || undefined,
        isSystem: filterIsSystem.value || undefined,
        category: filterCategory.value || undefined
      }
      
      const res = await getTemplatePage(params)
      templateList.value = res.data.data || []
      total.value = res.data.total || 0
    } finally {
      loading.value = false
    }
  }

  // 加载所有模板（用于下拉选择）
  const loadAllTemplates = async () => {
    try {
      const res = await getTemplateList()
      allTemplates.value = res.data || []
    } catch (error) {
      console.error('加载模板列表失败:', error)
    }
  }

  // 分页变化
  const handlePageChange = (page, size) => {
    pageNo.value = page
    pageSize.value = size
    loadTemplateList()
  }

  // 搜索
  const handleSearch = (searchKeyword) => {
    keyword.value = searchKeyword
    pageNo.value = 1
    loadTemplateList()
  }

  // 类型筛选
  const handleTypeFilter = (type) => {
    filterType.value = type
    pageNo.value = 1
    loadTemplateList()
  }

  // 系统模板筛选
  const handleSystemFilter = (isSystem) => {
    filterIsSystem.value = isSystem
    pageNo.value = 1
    loadTemplateList()
  }

  // 分类筛选
  const handleCategoryFilter = (category) => {
    filterCategory.value = category
    pageNo.value = 1
    loadTemplateList()
  }

  return {
    loading,
    templateList,
    allTemplates,
    total,
    pageNo,
    pageSize,
    keyword,
    filterType,
    filterIsSystem,
    filterCategory,
    loadTemplateList,
    loadAllTemplates,
    handlePageChange,
    handleSearch,
    handleTypeFilter,
    handleSystemFilter,
    handleCategoryFilter
  }
}
