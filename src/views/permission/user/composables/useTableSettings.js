import { ref } from 'vue'

/**
 * 表格设置管理（搜索栏显隐、列显隐）
 */
export function useTableSettings(columns) {
  // 搜索栏显示状态
  const searchVisible = ref(true)

  // 列显示状态（默认所有列都显示）
  const columnVisibility = ref({})
  
  // 初始化列显示状态
  columns.forEach(col => {
    if (col.key && col.key !== 'operation') {
      columnVisibility.value[col.key] = true
    }
  })

  /**
   * 切换搜索栏显示状态
   */
  const toggleSearch = () => {
    searchVisible.value = !searchVisible.value
  }

  /**
   * 切换列显示状态
   */
  const toggleColumn = (columnKey) => {
    columnVisibility.value[columnKey] = !columnVisibility.value[columnKey]
  }

  /**
   * 获取可见的列
   */
  const getVisibleColumns = () => {
    return columns.filter(col => {
      // 操作列始终显示
      if (col.key === 'operation') return true
      // 其他列根据 columnVisibility 判断
      return columnVisibility.value[col.key] !== false
    })
  }

  /**
   * 获取可配置的列（排除操作列）
   */
  const getConfigurableColumns = () => {
    return columns.filter(col => col.key && col.key !== 'operation')
  }

  return {
    searchVisible,
    columnVisibility,
    toggleSearch,
    toggleColumn,
    getVisibleColumns,
    getConfigurableColumns
  }
}
