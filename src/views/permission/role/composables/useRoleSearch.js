import { reactive } from 'vue'

/**
 * 角色搜索功能
 */
export function useRoleSearch(fetchRoleList, pagination) {
  const searchForm = reactive({
    name: '',
    code: '',
    status: undefined
  })

  /**
   * 搜索
   */
  const handleSearch = () => {
    const pag = handleSearch.pagination || pagination
    const fetch = handleSearch.fetchRoleList || fetchRoleList
    if (pag) pag.current = 1
    if (fetch) fetch()
  }

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    searchForm.name = ''
    searchForm.code = ''
    searchForm.status = undefined
    
    const pag = handleReset.pagination || pagination
    const fetch = handleReset.fetchRoleList || fetchRoleList
    if (pag) pag.current = 1
    if (fetch) fetch()
  }

  return {
    searchForm,
    handleSearch,
    handleReset
  }
}
