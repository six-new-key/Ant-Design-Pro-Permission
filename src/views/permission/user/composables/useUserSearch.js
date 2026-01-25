import { reactive } from 'vue'

/**
 * 用户搜索功能
 */
export function useUserSearch(fetchUserList, pagination) {
  const searchForm = reactive({
    userName: '',
    phone: '',
    status: undefined,
    gender: undefined
  })

  /**
   * 搜索
   */
  const handleSearch = () => {
    const pag = handleSearch.pagination || pagination
    const fetch = handleSearch.fetchUserList || fetchUserList
    if (pag) pag.current = 1
    if (fetch) fetch()
  }

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    searchForm.userName = ''
    searchForm.phone = ''
    searchForm.status = undefined
    searchForm.gender = undefined
    
    const pag = handleReset.pagination || pagination
    const fetch = handleReset.fetchUserList || fetchUserList
    if (pag) pag.current = 1
    if (fetch) fetch()
  }

  return {
    searchForm,
    handleSearch,
    handleReset
  }
}
