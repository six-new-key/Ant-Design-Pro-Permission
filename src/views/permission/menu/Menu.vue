<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <a-card :bordered="false" class="search-card">
      <div class="search-form">
        <div class="search-form-left">
          <a-form layout="inline" :model="searchForm" ref="searchFormRef">
            <a-form-item name="title">
              <a-input v-model:value="searchForm.title" placeholder="请输入菜单名称" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item name="type">
              <a-select v-model:value="searchForm.type" placeholder="请选择菜单类型" allow-clear style="width: 200px">
                <a-select-option :value="0">目录</a-select-option>
                <a-select-option :value="1">菜单</a-select-option>
                <a-select-option :value="2">按钮</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="status">
              <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 200px">
                <a-select-option value="1">启用</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
        <div class="search-form-right">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <SearchOutlined />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-space>
        </div>
      </div>
    </a-card>

    <!-- 数据表格区域 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="table-header-actions">
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <PlusOutlined />
            </template>
            新增
          </a-button>
          <a-button @click="handleExpandAll">
            <template #icon>
              <component :is="isExpandAll ? 'MenuFoldOutlined' : 'MenuUnfoldOutlined'" />
            </template>
            {{ isExpandAll ? '收起' : '展开' }}
          </a-button>
        </div>
      </template>

      <a-table
        ref="tableRef"
        :dataSource="tableData"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="false"
        :scroll="{ x: 1200, y: tableMaxHeight }"
        :expandedRowKeys="expandedRowKeys"
        @expand="onExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'icon'">
             <component v-if="record.icon && isAntDesignIcon(record.icon)" :is="record.icon" />
             <span v-else-if="record.icon">{{ record.icon }}</span>
             <span v-else>-</span>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-popconfirm title="确认删除该菜单吗？" @confirm="handleDelete(record)">
                <a-button type="link" danger size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
              <a-button
                v-if="record.type !== 2"
                type="link"
                size="small"
                style="color: #52c41a"
                @click="handleAddChild(record)"
              >
                <template #icon>
                  <PlusOutlined />
                </template>
                新增下级
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑菜单弹窗 -->
    <a-modal
      v-model:open="menuDialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="800px"
      @ok="handleMenuSubmit"
      @cancel="menuDialogVisible = false"
      :confirmLoading="submitLoading"
      centered
    >
      <div :style="cssVars">
        <a-form ref="menuFormRef" :model="menuForm" :rules="menuFormRules" layout="vertical" class="menu-form">
          <a-row :gutter="24">
             <a-col :span="24">
              <a-form-item label="上级菜单" name="parent">
                <a-input
                  v-model:value="parentName"
                  placeholder="请输入上级菜单名称（0为顶级菜单）"
                  :disabled="isEdit || (!isEdit && (isHeaderAdd || isChildAdd))"
                />
              </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="菜单类型" name="type">
                <a-radio-group v-model:value="menuForm.type" @change="handleTypeChange">
                  <a-radio :value="0" :disabled="isEdit || (!isEdit && (!isHeaderAdd || (isChildAdd && parentMenuType !== null)))">目录</a-radio>
                  <a-radio :value="1" :disabled="isEdit || (!isEdit && (isHeaderAdd || (isChildAdd && parentMenuType === 1)))">菜单</a-radio>
                  <a-radio :value="2" :disabled="isEdit || (!isEdit && (isHeaderAdd || (isChildAdd && parentMenuType === 0)))">按钮</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="菜单名称" name="title">
                <a-input v-model:value="menuForm.title" placeholder="请输入菜单名称" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type !== 2">
             <a-col :span="12">
                <a-form-item label="菜单名称（英文）" name="name">
                  <a-input v-model:value="menuForm.name" placeholder="请输入菜单名称（英文）" />
                </a-form-item>
             </a-col>
             <a-col :span="12" v-if="menuForm.type === 1">
                <a-form-item label="组件路径" name="component">
                  <a-input v-model:value="menuForm.component" placeholder="请输入组件路径：/xxx/xxx/xxx" />
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type === 2">
             <a-col :span="12">
                <a-form-item label="权限标识" name="permission">
                  <a-input v-model:value="menuForm.permission" placeholder="请输入权限标识：permission:user:add" />
                </a-form-item>
             </a-col>
             <a-col :span="12">
                <a-form-item label="接口路径" name="apiPath">
                  <a-input v-model:value="menuForm.apiPath" placeholder="请输入接口路径：/user/add" />
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24">
             <a-col :span="12">
                <a-form-item label="菜单状态" name="status">
                  <a-radio-group v-model:value="menuForm.status">
                    <a-radio :value="1">启用</a-radio>
                    <a-radio :value="0">禁用</a-radio>
                  </a-radio-group>
                </a-form-item>
             </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { Modal, theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import {
  queryMenuList,
  queryMenuListByLike,
  addMenu,
  updateMenu,
  deleteMenu,
  echoMenu
} from '@/api/menu'

const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder
  }
})

// ==================== 响应式数据定义 ====================
const loading = ref(false)
const submitLoading = ref(false)

const tableData = ref([])
const expandedRowKeys = ref([])
const isExpandAll = ref(false)

const menuDialogVisible = ref(false)

// 业务状态
const isEdit = ref(false)
const isHeaderAdd = ref(false)
const isChildAdd = ref(false)
const parentMenuType = ref(null)
const parentName = ref('')
const parentMenuOptions = ref([])

const isFullscreen = ref(false)

const menuFormRef = ref()
const searchFormRef = ref()

// ==================== 表单数据 ====================
const searchForm = reactive({
  title: '',
  type: undefined,
  status: undefined
})

const menuForm = reactive({
  id: null,
  parent: '0',
  title: '',
  type: 0,
  name: '',
  permission: '',
  apiPath: '',
  component: '',
  status: 1
})

// ==================== 表格列配置 ====================
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    key: 'title',
    width: 250,
    fixed: 'left'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
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
    title: '权限标识',
    dataIndex: 'permission',
    key: 'permission',
    width: 200,
    ellipsis: true
  },
  {
    title: '接口路径',
    dataIndex: 'apiPath',
    key: 'apiPath',
    width: 200,
    ellipsis: true
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

// ==================== 表单验证规则 ====================
const menuFormRules = {
  title: [
    { required: true, message: '菜单名称不能为空', trigger: 'blur' },
    { min: 1, max: 50, message: '菜单名称长度为1-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '菜单类型不能为空', trigger: 'change' }
  ],
  name: [
    { required: true, message: '菜单名称（英文）不能为空', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '组件路径不能为空', trigger: 'blur' }
  ],
  permission: [
    { required: true, message: '权限标识不能为空', trigger: 'blur' }
  ],
  apiPath: [
    { required: true, message: '接口路径不能为空', trigger: 'blur' },
    { pattern: /^\/[a-zA-Z0-9\-_/]*$/, message: '接口路径格式不正确，必须以/开头', trigger: 'blur' }
  ]
}

// ==================== 计算属性 ====================
const tableMaxHeight = computed(() => {
  return isFullscreen.value ? undefined : '520px'
})

// ==================== 业务方法 ====================

// 简单的图标判断（仅示例，实际可能需要更复杂的判断或图标组件映射）
const isAntDesignIcon = (iconName) => {
    // 假设以大写字母开头并以Outlined/Filled/TwoTone结尾的是Ant Design图标
    return /^[A-Z].*(Outlined|Filled|TwoTone)$/.test(iconName)
}

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

const fetchParentMenuOptions = async () => {
  const response = await queryMenuList()
  if (response.code === 200) {
    // 这里 demo 中好像只是获取数据并没有绑定到 Select 上，而是用 Input 显示 parentName
    // 按照 demo 逻辑，parentName 是只读的或者受控的
    // 这里保留逻辑，备用
  }
}

const handleSearch = () => {
  fetchMenuList()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.type = undefined
  searchForm.status = undefined
  fetchMenuList()
}

const onExpand = (expanded, record) => {
    if (expanded) {
        expandedRowKeys.value = [...expandedRowKeys.value, record.id]
    } else {
        expandedRowKeys.value = expandedRowKeys.value.filter(k => k !== record.id)
    }
}

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

const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
  if (isExpandAll.value) {
    expandedRowKeys.value = getAllNodeIds(tableData.value)
  } else {
    expandedRowKeys.value = []
  }
}

const handleAdd = () => {
  isEdit.value = false
  isHeaderAdd.value = true
  isChildAdd.value = false
  parentMenuType.value = null
  resetMenuForm()
  menuForm.type = 0
  parentName.value = '0'
  menuDialogVisible.value = true
}

const handleAddChild = (row) => {
  isEdit.value = false
  isHeaderAdd.value = false
  isChildAdd.value = true
  resetMenuForm()
  parentName.value = row.title
  parentMenuType.value = row.type
  
  if (row.type === 0) {
    menuForm.type = 1
  } else if (row.type === 1) {
    menuForm.type = 2
  }
  
  // Set parent ID? The demo uses parent name in the form but likely sends parent ID or Name?
  // Checking Demo Index.vue: 
  // menuForm.parent = parentName.value
  // And parentName.value = row.title.
  // Wait, if parent is '0', it means root. If parent is a name, does the backend resolve it?
  // Let's verify demo logic:
  // In handleMenuSubmit: menuForm.parent = parentName.value
  // It seems the backend expects the parent *Name* or ID?
  // Looking at the form item: <t-input v-model="parentName" ... />
  // It seems it passes the Name. This is unusual but I will stick to the demo logic.
  // Wait, in `handleAddChild`, `parentName.value = row.title`.
  // If the backend relies on Name for hierarchy, that's fragile.
  // But I must follow the demo.
  // Actually, let's check `echoMenu` in demo.
  // `Object.assign(menuForm, response.data)`
  // `parentName.value = menuForm.parent`
  // So `menuForm.parent` stores the identifier/name of the parent.
  // I'll proceed with this assumption.
  
  menuForm.parent = row.title // This sets the parent field to the parent's title
  
  menuDialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  isHeaderAdd.value = false
  isChildAdd.value = false
  parentMenuType.value = null
  
  const response = await echoMenu(row.id)
  if (response.code === 200) {
    Object.assign(menuForm, response.data)
    parentName.value = menuForm.parent
    menuDialogVisible.value = true
  }
}

const handleDelete = async (row) => {
  const response = await deleteMenu(row.id)
  if (response.code === 200) {
    Message.success('删除成功')
    fetchMenuList()
  }
}

const handleTypeChange = (e) => {
  const value = e.target.value
  if (value === 2) {
    menuForm.component = ''
  } else if (value === 0) {
    menuForm.component = ''
    menuForm.permission = ''
    menuForm.apiPath = ''
  } else if (value === 1) {
    menuForm.permission = ''
    menuForm.apiPath = ''
  }
}

const handleMenuSubmit = () => {
  menuFormRef.value.validate().then(async () => {
    submitLoading.value = true
    
    // Ensure parent is set correctly from parentName (which might be '0' or a title)
    // The demo does: menuForm.parent = parentName.value
    menuForm.parent = parentName.value

    const apiMethod = isEdit.value ? updateMenu : addMenu
    const response = await apiMethod(menuForm)

    if (response.code === 200) {
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      menuDialogVisible.value = false
      fetchMenuList()
    }
    submitLoading.value = false
  }).catch(() => {
    // validation failed
  })
}

const resetMenuForm = () => {
  Object.assign(menuForm, {
    id: null,
    parent: '0',
    title: '',
    type: 0,
    name: '',
    permission: '',
    apiPath: '',
    component: '',
    status: 1
  })
  parentName.value = ''
  if (menuFormRef.value) {
      menuFormRef.value.clearValidate()
  }
}

const getTypeColor = (type) => {
  const map = {
    0: 'blue',
    1: 'green',
    2: 'orange'
  }
  return map[type] || 'default'
}

const getTypeLabel = (type) => {
  const map = {
    0: '目录',
    1: '菜单',
    2: '按钮'
  }
  return map[type] || '未知'
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  fetchMenuList()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  isFullscreen.value = !!document.fullscreenElement
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form-left {
  flex: 1;
}

.search-form-right {
  flex-shrink: 0;
}

.table-header-actions {
  display: flex;
  gap: 16px;
}
</style>