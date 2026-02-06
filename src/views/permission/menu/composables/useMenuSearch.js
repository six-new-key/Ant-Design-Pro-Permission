import { reactive } from 'vue'

/**
 * 菜单搜索功能
 */
export function useMenuSearch(fetchMenuList) {
  const searchForm = reactive({
    title: '',
    type: undefined,
    status: undefined
  })

  /**
   * 搜索
   */
  const handleSearch = () => {
    if (fetchMenuList) {
      fetchMenuList()
    }
  }

  /**
   * 重置
   */
  const handleReset = () => {
    searchForm.title = ''
    searchForm.type = undefined
    searchForm.status = undefined
    if (fetchMenuList) {
      fetchMenuList()
    }
  }

  return {
    searchForm,
    handleSearch,
    handleReset
  }
}
