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
                <a-form-item label="路由名称" name="name">
                  <a-input v-model:value="menuForm.name" placeholder="请输入路由名称（如：User）" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    必须以大写字母开头，如：User、Role、Menu
                  </div>
                </a-form-item>
             </a-col>
             <a-col :span="12">
                <a-form-item label="路由路径" name="path">
                  <a-input v-model:value="menuForm.path" placeholder="请输入路由路径（如：permission/user）" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    支持字母、数字、下划线、中划线、斜杠，如：user/list、user-info/list
                  </div>
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type !== 2">
             <a-col :span="12">
                <a-form-item label="菜单图标" name="icon">
                  <a-input 
                    v-model:value="menuForm.icon" 
                    placeholder="点击选择图标"
                    readonly
                    @click="iconSelectorVisible = true"
                    style="cursor: pointer"
                  >
                    <template #prefix>
                      <component v-if="menuForm.icon && isAntDesignIcon(menuForm.icon)" :is="menuForm.icon" />
                    </template>
                  </a-input>
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    点击输入框选择图标
                  </div>
                </a-form-item>
             </a-col>
             <a-col :span="12">
                <a-form-item label="组件路径" name="component">
                  <a-input 
                    v-model:value="menuForm.component" 
                    :placeholder="menuForm.type === 0 ? 'LayoutManager（固定值）' : '请输入组件路径（如：views/permission/user/User）'" 
                    :disabled="menuForm.type === 0"
                  />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    <span v-if="menuForm.type === 0">目录固定为 LayoutManager，用于包裹子菜单</span>
                    <span v-else>支持字母、数字、下划线、中划线、斜杠</span>
                  </div>
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type === 0">
             <a-col :span="12">
                <a-form-item label="重定向路径" name="redirect">
                  <a-input v-model:value="menuForm.redirect" placeholder="请输入重定向路径（如：permission/user）" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    目录的默认跳转路径，支持字母、数字、下划线、中划线、斜杠
                  </div>
                </a-form-item>
             </a-col>
             <a-col :span="12">
                <a-form-item label="排序" name="sort">
                  <a-input-number v-model:value="menuForm.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    数字越小越靠前
                  </div>
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type === 1">
             <a-col :span="12">
                <a-form-item label="排序" name="sort">
                  <a-input-number v-model:value="menuForm.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    数字越小越靠前
                  </div>
                </a-form-item>
             </a-col>
          </a-row>

          <a-row :gutter="24" v-if="menuForm.type === 2">
             <a-col :span="12">
                <a-form-item label="权限标识" name="permission">
                  <a-input v-model:value="menuForm.permission" placeholder="请输入权限标识（如：permission:user:add）" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    格式：模块:资源:操作，支持字母、数字、下划线、中划线
                  </div>
                </a-form-item>
             </a-col>
             <a-col :span="12">
                <a-form-item label="接口路径" name="apiPath">
                  <a-input v-model:value="menuForm.apiPath" placeholder="请输入接口路径（如：user/add 或 dict/type/**）" />
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    支持字母、数字、下划线、中划线、斜杠、通配符（**）
                  </div>
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
             <a-col :span="12" v-if="menuForm.type !== 2">
                <a-form-item label="是否隐藏" name="hidden">
                  <a-radio-group v-model:value="menuForm.hidden">
                    <a-radio :value="0">否</a-radio>
                    <a-radio :value="1">是</a-radio>
                  </a-radio-group>
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    隐藏后不在菜单中显示，但路由仍可访问
                  </div>
                </a-form-item>
             </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>

    <!-- 图标选择器 -->
    <IconSelector 
      v-model:visible="iconSelectorVisible"
      v-model:value="menuForm.icon"
    />
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
import IconSelector from '@/components/custom/IconSelector.vue'

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
const iconSelectorVisible = ref(false)

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
  path: '',
  component: '',
  icon: '',
  redirect: '',
  permission: '',
  apiPath: '',
  hidden: 0,
  sort: 0,
  status: 1
})

// ==================== 表格列配置 ====================
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    key: 'title',
    width: 200,
    fixed: 'left'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 80
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '路由路径',
    dataIndex: 'path',
    key: 'path',
    width: 180,
    ellipsis: true
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
    width: 180,
    ellipsis: true
  },
  {
    title: '接口路径',
    dataIndex: 'apiPath',
    key: 'apiPath',
    width: 180,
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80
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
const getMenuFormRules = () => {
  const baseRules = {
    title: [
      { required: true, message: '菜单名称不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '菜单名称长度为1-50个字符', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '菜单类型不能为空', trigger: 'change' }
    ],
    icon: [
      { pattern: /^[A-Z][a-zA-Z]*(Outlined|Filled|TwoTone)$/, message: '图标名称格式：大写字母开头+Outlined/Filled/TwoTone结尾', trigger: 'blur' }
    ],
    sort: [
      { type: 'number', message: '排序必须是数字', trigger: 'blur' }
    ]
  }
  
  // 路径验证规则：支持字母、数字、下划线、中划线、斜杠、通配符
  // 示例：xxx/xxx、xxx-xx/xxx、xxx_xx/xxx/xxx-x、xxxx/xxx/**
  const pathPattern = /^[a-zA-Z0-9_\-/]+(\*\*)?$/
  
  // 权限标识验证规则：支持字母、数字、下划线、中划线，用冒号分隔
  // 示例：xxx:xx-xx:xxx、xx_xx:xxx:xxx
  const permissionPattern = /^[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+$/
  
  // 根据菜单类型动态添加规则
  if (menuForm.type === 0) {
    // 目录：需要路由名称、路由路径、重定向，组件路径固定为 LayoutManager
    return {
      ...baseRules,
      name: [
        { required: true, message: '路由名称不能为空', trigger: 'blur' },
        { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '路由名称必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
      ],
      path: [
        { required: true, message: '路由路径不能为空', trigger: 'blur' },
        { pattern: pathPattern, message: '路由路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
      ],
      component: [
        { required: true, message: '组件路径不能为空', trigger: 'blur' },
        { pattern: /^LayoutManager$/, message: '目录的组件路径必须为 LayoutManager', trigger: 'blur' }
      ],
      redirect: [
        { pattern: pathPattern, message: '重定向路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
      ]
    }
  } else if (menuForm.type === 1) {
    // 菜单：需要路由名称、路由路径、组件路径
    return {
      ...baseRules,
      name: [
        { required: true, message: '路由名称不能为空', trigger: 'blur' },
        { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '路由名称必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
      ],
      path: [
        { required: true, message: '路由路径不能为空', trigger: 'blur' },
        { pattern: pathPattern, message: '路由路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
      ],
      component: [
        { required: true, message: '组件路径不能为空', trigger: 'blur' },
        { pattern: pathPattern, message: '组件路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
      ]
    }
  } else if (menuForm.type === 2) {
    // 按钮：需要权限标识和接口路径
    return {
      ...baseRules,
      permission: [
        { required: true, message: '权限标识不能为空', trigger: 'blur' },
        { pattern: permissionPattern, message: '权限标识格式：模块:资源:操作，支持字母、数字、下划线、中划线', trigger: 'blur' }
      ],
      apiPath: [
        { required: true, message: '接口路径不能为空', trigger: 'blur' },
        { pattern: pathPattern, message: '接口路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
      ]
    }
  }
  
  return baseRules
}

const menuFormRules = computed(() => getMenuFormRules())

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
  menuForm.component = 'LayoutManager' // 目录默认组件路径
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
    // 父级是目录，子级是菜单
    menuForm.type = 1
    menuForm.component = '' // 菜单需要用户输入组件路径
  } else if (row.type === 1) {
    // 父级是菜单，子级是按钮
    menuForm.type = 2
    menuForm.component = '' // 按钮不需要组件路径
  }
  
  menuForm.parent = row.title
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
    // 按钮：清空路由相关字段，保留权限标识和接口路径
    menuForm.name = ''
    menuForm.path = ''
    menuForm.component = ''
    menuForm.icon = ''
    menuForm.redirect = ''
    menuForm.hidden = 0
  } else if (value === 0) {
    // 目录：组件路径固定为 LayoutManager，清空权限相关字段
    menuForm.component = 'LayoutManager'
    menuForm.permission = ''
    menuForm.apiPath = ''
  } else if (value === 1) {
    // 菜单：清空权限相关字段和重定向，清空组件路径让用户输入
    menuForm.component = ''
    menuForm.permission = ''
    menuForm.apiPath = ''
    menuForm.redirect = ''
  }
}

const handleMenuSubmit = () => {
  menuFormRef.value.validate().then(async () => {
    submitLoading.value = true
    
    // 设置 parent 字段
    menuForm.parent = parentName.value
    
    // 根据类型清理不需要的字段
    const submitData = { ...menuForm }
    
    if (menuForm.type === 0) {
      // 目录：确保组件路径为 LayoutManager，清空权限相关字段
      submitData.component = 'LayoutManager'
      submitData.permission = ''
      submitData.apiPath = ''
    } else if (menuForm.type === 1) {
      // 菜单：清空权限相关字段和重定向
      submitData.permission = ''
      submitData.apiPath = ''
      submitData.redirect = ''
    } else if (menuForm.type === 2) {
      // 按钮：清空路由相关字段，sort 设置为 0
      submitData.name = ''
      submitData.path = ''
      submitData.component = ''
      submitData.icon = ''
      submitData.redirect = ''
      submitData.hidden = 0
      submitData.sort = 0
    }

    const apiMethod = isEdit.value ? updateMenu : addMenu
    const response = await apiMethod(submitData)

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
    path: '',
    component: '',
    icon: '',
    redirect: '',
    permission: '',
    apiPath: '',
    hidden: 0,
    sort: 0,
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