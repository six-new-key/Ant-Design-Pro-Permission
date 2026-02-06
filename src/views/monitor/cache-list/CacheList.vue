<template>
  <div class="cache-list-container" :style="cssVars">
    <!-- 页面头部 -->
    <a-page-header
      title="系统监控"
      :sub-title="selectedCategory ? `当前类型：${selectedCategory.name}` : '请选择缓存类型'"
      @back="() => $router.push('/monitor/cache')"
      class="page-header">
      <template #extra>
        <a-space>
          <a-button @click="handleRefreshAll">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新全部
          </a-button>
          <a-button 
            v-if="selectedCategory" 
            danger 
            @click="handleClearCurrentType">
            <template #icon>
              <DeleteOutlined />
            </template>
            清除当前类型
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <!-- 左侧：缓存名称列表 -->
      <a-col :span="8">
        <a-card title="缓存列表" :body-style="{ height: '640px', overflow: 'auto' }">
          <template #extra>
            <a-button type="link" size="small" @click="handleRefreshTypes">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
          </template>
          <a-table
            :columns="categoryColumns"
            :data-source="cacheTypes"
            :loading="categoryLoading"
            :pagination="false"
            :row-class-name="(record) => selectedCategory?.code === record.code ? 'selected-row' : ''"
            :show-header="true"
            row-key="code"
            :custom-row="(record) => ({
              onClick: () => handleCategoryClick(record)
            })">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  size="small" 
                  danger
                  @click.stop="handleClearCacheType(record)">
                  <DeleteOutlined />
                </a-button>
              </template>
            </template>
            <template #emptyText>
              <a-empty 
                description="暂无缓存类型配置"
                :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 中间：键名列表 -->
      <a-col :span="8">
        <a-card title="键名列表" :body-style="{ height: '640px', overflow: 'auto' }">
          <template #extra>
            <a-space>
              <a-button 
                v-if="selectedCategory"
                danger
                :disabled="selectedKeys.length === 0"
                @click="handleBatchDelete">
                <template #icon>
                  <DeleteOutlined />
                </template>
                批量删除 {{ selectedKeys.length > 0 ? `(${selectedKeys.length})` : '' }}
              </a-button>
              <a-input-search
                v-if="selectedCategory"
                v-model:value="searchKeyword"
                placeholder="搜索缓存键名"
                style="width: 200px"
                @search="handleSearch"
                allow-clear />
              <a-button type="link" size="small" @click="handleRefreshKeys">
                <template #icon>
                  <ReloadOutlined />
                </template>
              </a-button>
            </a-space>
          </template>
          
          <!-- 未选择类型时的提示 -->
          <div v-if="!selectedCategory" class="empty-content">
            <a-empty 
              description="请先选择左侧的缓存类型"
              :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
          
          <!-- 已选择类型时显示表格 -->
          <a-table
            v-else
            :columns="keyColumns"
            :data-source="cacheKeys"
            :loading="keyLoading"
            :row-selection="{
              selectedRowKeys: selectedKeys,
              onChange: onSelectChange
            }"
            :pagination="{
              current: pagination.pageNo,
              pageSize: pagination.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total) => `共 ${total} 条`,
              size: 'small',
              pageSizeOptions: ['10', '20', '50', '100'],
              position: ['bottomCenter']
            }"
            :row-class-name="(record) => selectedKey === record.key ? 'selected-row' : ''"
            :show-header="true"
            row-key="key"
            @change="handleTableChange"
            :custom-row="(record) => ({
              onClick: () => handleKeyClick(record)
            })">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  size="small" 
                  danger
                  @click.stop="handleDeleteKey(record.key)">
                  <DeleteOutlined />
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 右侧：缓存内容 -->
      <a-col :span="8">
        <a-card title="缓存内容" :body-style="{ height: '640px', overflow: 'auto' }">
          <template #extra>
            <a-space :size="14">
              <a-button 
                v-if="cacheDetail" 
                type="link" 
                size="small" 
                @click="handleCopyValue">
                <template #icon>
                  <CopyOutlined />
                </template>
              </a-button>
              <a-button 
                v-if="cacheDetail" 
                type="link" 
                size="small" 
                danger
                @click="handleDeleteCurrentKey">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-space>
          </template>
          <div v-if="!cacheDetail" class="empty-content">
            <a-empty description="请选择一个缓存键查看详情" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
          <div v-else class="detail-content">
            <div class="detail-item">
              <div class="detail-label">缓存名称：</div>
              <a-input :value="selectedCategory?.name || '-'" readonly />
            </div>
            
            <div v-if="cacheDetail.configName" class="detail-item">
              <div class="detail-label">配置项名称：</div>
              <a-input :value="cacheDetail.configName" readonly />
            </div>
            
            <div class="detail-item">
              <div class="detail-label">缓存键名：</div>
              <a-input :value="cacheDetail.key" readonly />
            </div>
            
            <div class="detail-item">
              <div class="detail-label">
                <span>缓存内容：</span>
                <a-space style="float: right;" :size="8">
                  <a-button 
                    v-if="typeof cacheDetail.value === 'object'"
                    type="link" 
                    size="small" 
                    @click="toggleFormat">
                    {{ isFormatted ? '压缩' : '格式化' }}
                  </a-button>
                </a-space>
              </div>
              <div class="code-viewer">
                <pre><code>{{ displayValue }}</code></pre>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Empty, theme } from 'ant-design-vue'
import {
  ReloadOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useCacheList } from './composables/useCacheList'
import { message } from '@/utils'
import { confirmDelete } from '@/utils/confirm'
import './styles/cache-list.scss'

const route = useRoute()

const { useToken } = theme
const { token } = useToken()

/**
 * CSS 变量（用于主题适配）
 */
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-bg-container': t.colorBgContainer,
    '--color-primary-bg': t.colorPrimaryBg,
    '--color-primary-bg-hover': t.colorPrimaryBgHover,
    '--color-border': t.colorBorder,
    '--color-fill-alter': t.colorFillAlter,
    '--color-text': t.colorText
  }
})

// 使用组合式函数
const {
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
  cacheDetail
} = useCacheList()

// 格式化状态
const isFormatted = ref(true)

// 表格列定义
const categoryColumns = [
  {
    title: '序号',
    width: 60,
    customRender: ({ index }) => index + 1
  },
  {
    title: '缓存名称',
    dataIndex: 'code',
    key: 'code',
    ellipsis: true
  },
  {
    title: '备注',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 60,
    align: 'center'
  }
]

const keyColumns = [
  {
    title: '序号',
    width: 60,
    customRender: ({ index }) => (pagination.pageNo - 1) * pagination.pageSize + index + 1
  },
  {
    title: '缓存键名',
    dataIndex: 'key',
    key: 'key',
    ellipsis: true
  },
  {
    title: '过期时间',
    dataIndex: 'ttl',
    key: 'ttl',
    width: 100,
    customRender: ({ record }) => formatTTL(record.ttl)
  },
  {
    title: '操作',
    key: 'action',
    width: 60,
    align: 'center'
  }
]

/**
 * 格式化 TTL（过期时间）
 */
const formatTTL = (ttl) => {
  if (ttl === undefined || ttl === null) return '-'
  if (ttl === -1) return '永久'
  if (ttl === -2) return '已过期'
  if (ttl <= 0) return '已过期'
  
  const seconds = ttl
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`
  return `${Math.floor(seconds / 86400)}天`
}

// 显示的缓存值（格式化JSON）
const displayValue = computed(() => {
  if (!cacheDetail.value?.value) return ''
  
  const value = cacheDetail.value.value
  
  // 格式化显示
  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'object') {
    return isFormatted.value ? JSON.stringify(value, null, 2) : JSON.stringify(value)
  }
  return String(value)
})

/**
 * 切换格式化状态
 */
const toggleFormat = () => {
  isFormatted.value = !isFormatted.value
}

/**
 * 复制缓存值
 */
const handleCopyValue = async () => {
  try {
    await navigator.clipboard.writeText(displayValue.value)
    message.success('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败')
  }
}

/**
 * 删除当前选中的缓存键
 */
const handleDeleteCurrentKey = () => {
  if (selectedKey.value) {
    handleDeleteKey(selectedKey.value)
  }
}

/**
 * 清除缓存类型（删除该类型的所有缓存）
 */
const handleClearCacheType = (record) => {
  confirmDelete({
    content: `确定要清除 "${record.name}" 的所有缓存吗？此操作不可撤销。`,
    onOk: async () => {
      try {
        const { clearCacheByType } = await import('@/api/cache')
        const res = await clearCacheByType(record.code)
        if (res.code === 200) {
          message.success('清除成功')
          // 如果清除的是当前选中的分类，清空中间和右侧
          if (selectedCategory.value?.code === record.code) {
            selectedCategory.value = null
            selectedKey.value = null
            cacheDetail.value = null
            cacheKeys.value = []
          }
          // 刷新缓存类型列表
          loadCacheTypes()
        } else {
          message.error(res.message || '清除失败')
        }
      } catch (error) {
        console.error('清除缓存失败:', error)
        message.error('清除失败')
      }
    }
  })
}

/**
 * 刷新缓存类型列表
 */
const handleRefreshTypes = () => {
  loadCacheTypes()
}

/**
 * 刷新键名列表
 */
const handleRefreshKeys = () => {
  if (selectedCategory.value) {
    loadCacheKeys()
  }
}

/**
 * 刷新全部数据
 */
const handleRefreshAll = async () => {
  await loadCacheTypes()
  if (selectedCategory.value) {
    await loadCacheKeys()
  }
  message.success('刷新成功')
}

/**
 * 清除当前类型的所有缓存
 */
const handleClearCurrentType = () => {
  if (selectedCategory.value) {
    handleClearCacheType(selectedCategory.value)
  }
}

// 初始化
onMounted(async () => {
  await loadCacheTypes()
  
  // 如果URL中有type参数，自动选中对应的分类
  const typeFromQuery = route.query.type
  if (typeFromQuery && cacheTypes.value.length > 0) {
    const targetType = cacheTypes.value.find(t => t.code === typeFromQuery)
    if (targetType) {
      handleCategoryClick(targetType)
    }
  }
})

// 监听路由变化
watch(() => route.query.type, (newType) => {
  if (newType && cacheTypes.value.length > 0) {
    const targetType = cacheTypes.value.find(t => t.code === newType)
    if (targetType) {
      handleCategoryClick(targetType)
    }
  }
})
</script>
