<template>
  <a-drawer
    :width="800"
    :open="visible"
    :closable="false"
    @close="handleClose"
  >
    <template #title>
      <div class="drawer-header">
        <span class="drawer-title">选择用户</span>
        <a-space :size="12">
          <a-button @click="handleClose">取消</a-button>
          <a-button type="primary" @click="handleConfirm">
            确定（已选 {{ selectedRows.length }} 人）
          </a-button>
        </a-space>
      </div>
    </template>

    <div :style="cssVars">
      <!-- 搜索区域 -->
      <a-card :bordered="false" class="search-card">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item>
            <a-input 
              v-model:value="searchForm.keyword" 
              placeholder="用户名或邮箱"
              style="width: 180px"
              @press-enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                查询
              </a-button>
              <a-button @click="handleReset">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 'max-content' }"
        @change="handleTableChange"
        row-key="id"
      >
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { theme } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { queryUserList } from '@/api/user'

// CSS 变量
const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-primary': t.colorPrimary,
    '--color-border': t.colorBorder,
    '--border-radius': `${t.borderRadius}px`,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
  }
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 表格数据
const columns = [
  { title: '用户ID', dataIndex: 'id', key: 'id', width: 180 },
  { title: '用户名', dataIndex: 'userName', key: 'userName', width: 150 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 }
]

const tableData = ref([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  showLessItems: true
})

// 选中的行
const selectedRowKeys = ref([])
const selectedRows = ref([])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  }
}))

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await queryUserList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    if (res.code === 200) {
      tableData.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 确认
const handleConfirm = () => {
  emit('confirm', selectedRows.value)
  handleClose()
}

// 监听visible变化，打开时加载数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedRowKeys.value = []
    selectedRows.value = []
    loadData()
  }
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 16px;
  box-shadow: none;
}

.search-form-compact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  
  :deep(.ant-form-item) {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
