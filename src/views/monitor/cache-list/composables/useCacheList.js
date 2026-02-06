import { ref, reactive } from 'vue'
import { getCacheTypes, getCacheKeys, getCacheDetail, deleteCacheKey } from '@/api/cache'
import { message } from '@/utils'
import { confirmDelete } from '@/utils/confirm'

/**
 * 缓存列表逻辑
 */
export const useCacheList = () => {
  // ==================== 分类相关 ====================
  const cacheTypes = ref([])
  const categoryLoading = ref(false)
  const selectedCategory = ref(null)

  /**
   * 加载缓存类型配置
   */
  const loadCacheTypes = async () => {
    categoryLoading.value = true
    try {
      const res = await getCacheTypes()
      if (res.code === 200) {
        // 获取缓存类型列表
        const types = res.data || []
        
        // 为每个类型添加键数量（初始为0，后续通过统计接口更新）
        cacheTypes.value = types.map(type => ({
          ...type,
          keyCount: 0
        }))
        
        // 加载每个类型的键数量
        await loadKeyCounts()
      } else {
        message.error(res.message || '获取缓存类型失败')
      }
    } catch (error) {
      console.error('获取缓存类型失败:', error)
      message.error('获取缓存类型失败')
    } finally {
      categoryLoading.value = false
    }
  }

  /**
   * 加载每个类型的键数量（分批加载优化性能）
   */
  const loadKeyCounts = async () => {
    try {
      const batchSize = 5 // 每批处理5个类型
      
      for (let i = 0; i < cacheTypes.value.length; i += batchSize) {
        const batch = cacheTypes.value.slice(i, i + batchSize)
        
        // 并发请求当前批次
        await Promise.all(batch.map(async (type) => {
          try {
            const res = await getCacheKeys({
              cacheType: type.code,
              pageNo: 1,
              pageSize: 1
            })
            if (res.code === 200) {
              type.keyCount = res.data.total || 0
            }
          } catch (error) {
            console.error(`获取类型 ${type.code} 的键数量失败:`, error)
          }
        }))
        
        // 批次之间添加小延迟，避免服务器压力过大
        if (i + batchSize < cacheTypes.value.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.error('加载键数量失败:', error)
    }
  }

  /**
   * 点击分类
   */
  const handleCategoryClick = (record) => {
    selectedCategory.value = record
    selectedKey.value = null
    selectedKeys.value = []
    cacheDetail.value = null
    searchKeyword.value = ''
    pagination.pageNo = 1
    loadCacheKeys()
  }

  // ==================== 键名列表相关 ====================
  const cacheKeys = ref([])
  const keyLoading = ref(false)
  const total = ref(0)
  const selectedKey = ref(null)
  const selectedKeys = ref([])
  const searchKeyword = ref('')

  const pagination = reactive({
    pageNo: 1,
    pageSize: 10
  })

  /**
   * 加载缓存键列表
   */
  const loadCacheKeys = async () => {
    if (!selectedCategory.value) {
      return
    }

    keyLoading.value = true
    try {
      const params = {
        cacheType: selectedCategory.value.code,
        keyword: searchKeyword.value || undefined,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize
      }

      const res = await getCacheKeys(params)
      
      if (res.code === 200) {
        cacheKeys.value = res.data.data || []
        total.value = res.data.total || 0
      } else {
        message.error(res.message || '获取缓存键列表失败')
      }
    } catch (error) {
      console.error('获取缓存键列表失败:', error)
      message.error('获取缓存键列表失败')
    } finally {
      keyLoading.value = false
    }
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    pagination.pageNo = 1
    selectedKeys.value = []
    loadCacheKeys()
  }

  /**
   * 多选变化
   */
  const onSelectChange = (keys) => {
    selectedKeys.value = keys
  }

  /**
   * 批量删除缓存键
   */
  const handleBatchDelete = () => {
    if (selectedKeys.value.length === 0) {
      message.warning('请先选择要删除的缓存键')
      return
    }

    confirmDelete({
      content: `确定要删除选中的 ${selectedKeys.value.length} 个缓存键吗？`,
      onOk: async () => {
        try {
          // 并发删除所有选中的键
          const promises = selectedKeys.value.map(key => deleteCacheKey(key))
          const results = await Promise.allSettled(promises)
          
          // 统计成功和失败数量
          const successCount = results.filter(r => r.status === 'fulfilled' && r.value.code === 200).length
          const failCount = results.length - successCount
          
          if (successCount > 0) {
            message.success(`成功删除 ${successCount} 个缓存键${failCount > 0 ? `，失败 ${failCount} 个` : ''}`)
            
            // 清空选中状态
            selectedKeys.value = []
            
            // 如果删除的包含当前选中的键，清空详情
            if (selectedKey.value && !selectedKeys.value.includes(selectedKey.value)) {
              selectedKey.value = null
              cacheDetail.value = null
            }
            
            // 刷新列表
            loadCacheKeys()
            
            // 更新分类的键数量
            if (selectedCategory.value) {
              selectedCategory.value.keyCount = Math.max(0, (selectedCategory.value.keyCount || 0) - successCount)
            }
          } else {
            message.error('删除失败')
          }
        } catch (error) {
          console.error('批量删除缓存键失败:', error)
          message.error('批量删除失败')
        }
      }
    })
  }

  /**
   * 表格分页变化
   */
  const handleTableChange = (pag) => {
    if (pag.current !== pagination.pageNo) {
      pagination.pageNo = pag.current
      loadCacheKeys()
    }
    if (pag.pageSize !== pagination.pageSize) {
      pagination.pageSize = pag.pageSize
      pagination.pageNo = 1
      loadCacheKeys()
    }
  }

  /**
   * 点击键名
   */
  const handleKeyClick = (record) => {
    selectedKey.value = record.key
    loadCacheDetail(record.key)
  }

  /**
   * 删除缓存键
   */
  const handleDeleteKey = (key) => {
    confirmDelete({
      content: `确定要删除缓存键吗？`,
      onOk: async () => {
        try {
          const res = await deleteCacheKey(key)
          if (res.code === 200) {
            message.success('删除成功')
            
            // 如果删除的是当前选中的键，清空详情
            if (selectedKey.value === key) {
              selectedKey.value = null
              cacheDetail.value = null
            }
            
            // 刷新列表
            loadCacheKeys()
            
            // 更新分类的键数量
            if (selectedCategory.value) {
              selectedCategory.value.keyCount = Math.max(0, (selectedCategory.value.keyCount || 0) - 1)
            }
          } else {
            message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除缓存键失败:', error)
          message.error('删除失败')
        }
      }
    })
  }

  // ==================== 详情相关 ====================
  const cacheDetail = ref(null)
  const detailLoading = ref(false)

  /**
   * 加载缓存详情
   */
  const loadCacheDetail = async (key) => {
    detailLoading.value = true
    cacheDetail.value = null

    try {
      const res = await getCacheDetail(key)
      if (res.code === 200) {
        cacheDetail.value = res.data
      } else {
        message.error(res.message || '获取缓存详情失败')
      }
    } catch (error) {
      console.error('获取缓存详情失败:', error)
      message.error('获取缓存详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  return {
    // 分类相关
    cacheTypes,
    categoryLoading,
    selectedCategory,
    loadCacheTypes,
    handleCategoryClick,
    // 键名列表相关
    cacheKeys,
    keyLoading,
    total,
    pagination,
    selectedKey,
    selectedKeys,
    searchKeyword,
    loadCacheKeys,
    handleTableChange,
    handleKeyClick,
    handleDeleteKey,
    handleSearch,
    onSelectChange,
    handleBatchDelete,
    // 详情相关
    cacheDetail,
    detailLoading,
    loadCacheDetail
  }
}
