<template>
  <div>
    <!-- 搜索和操作区域 -->
    <t-card :bordered="false" class="search-card">
        <!-- 搜索表单容器：左右布局，左侧表单自适应，右侧按钮固定宽度 -->
        <div class="search-form">
            <!-- 左侧表单区域：包含搜索条件 -->
            <div class="search-form-left">
                <t-form ref="searchFormRef" :data="searchForm" layout="inline" :label-width="0">
                    <!-- 菜单名称搜索 -->
                    <t-form-item name="title">
                        <t-input v-model="searchForm.title" placeholder="请输入菜单名称" clearable style="width: 200px" />
                    </t-form-item>
                    <!-- 菜单类型筛选 -->
                    <t-form-item name="type">
                        <t-select v-model="searchForm.type" placeholder="请选择菜单类型" clearable style="width: 200px">
                            <t-option :value="0" label="目录" />
                            <t-option :value="1" label="菜单" />
                            <t-option :value="2" label="按钮" />
                        </t-select>
                    </t-form-item>
                    <!-- 状态筛选 -->
                    <t-form-item name="status">
                        <t-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
                            <t-option value="1" label="启用" />
                            <t-option value="0" label="禁用" />
                        </t-select>
                    </t-form-item>
                </t-form>
            </div>
            <!-- 右侧操作按钮区域：搜索和重置按钮 -->
            <div class="search-form-right">
                <t-space>
                    <!-- 搜索按钮 -->
                    <t-button theme="primary" @click="handleSearch">
                        <template #icon><t-icon name="search" /></template>
                        搜索
                    </t-button>
                    <!-- 重置按钮 -->
                    <t-button theme="default" @click="handleReset">
                        <template #icon><t-icon name="refresh" /></template>
                        重置
                    </t-button>
                </t-space>
            </div>
        </div>
    </t-card>

    <!-- 数据表格区域 -->
    <t-card :bordered="false" class="table-card">
        <!-- 表格头部操作区域 -->
        <template #header>
            <div class="table-header-actions">
                <!-- 新增菜单按钮 -->
                <t-button theme="primary" @click="handleAdd">
                    <template #icon><t-icon name="add" /></template>
                    新增
                </t-button>
                <!-- 展开/收起按钮 -->
                <t-button theme="default" @click="handleExpandAll">
                    <template #icon><t-icon :name="isExpandAll ? 'unfold-less' : 'unfold-more'" /></template>
                    {{ isExpandAll ? '收起' : '展开' }}
                </t-button>
            </div>
        </template>
        <!-- 菜单数据表格：树形结构显示 -->
        <t-enhanced-table :expanded-tree-nodes="expandedTreeNodes"
            :table-content-width="tableLayout === 'fixed' ? undefined : '1600px'" :maxHeight="tableMaxHeight"
            ref="tableRef" :data="tableData" :columns="columns" :loading="loading" :tree="{ childrenKey: 'children' }"
            row-key="id" hover @expanded-tree-nodes-change="handleExpandedTreeNodesChange" active-row-type="single">
            <!-- 菜单类型列自定义渲染 -->
            <template #type="{ row }">
                <t-tag :theme="getTypeTheme(row.type)" variant="light">
                    {{ getTypeLabel(row.type) }}
                </t-tag>
            </template>

            <!-- 菜单图标列自定义渲染 -->
            <template #icon="{ row }">
                <t-icon v-if="row.icon" :name="row.icon" />
                <span v-else class="text-placeholder">-</span>
            </template>

            <!-- 状态列自定义渲染：显示启用/禁用标签 -->
            <template #status="{ row }">
                <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                </t-tag>
            </template>

            <!-- 操作列自定义渲染：编辑、删除、更多操作 -->
            <template #operation="{ row }">
                <t-space>
                    <!-- 编辑按钮 -->
                    <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">
                        <template #icon><t-icon name="edit" /></template>
                        编辑
                    </t-button>
                    <!-- 删除按钮：带确认弹窗 -->
                    <t-popconfirm content="确认删除该菜单吗？" @confirm="handleDelete(row)">
                        <t-button theme="danger" variant="text" size="small">
                            <template #icon><t-icon name="delete" /></template>
                            删除
                        </t-button>
                    </t-popconfirm>
                    <!-- 新增子菜单按钮（按钮类型不显示） -->
                    <t-button v-if="row.type !== 2" theme="success" variant="text" size="small"
                        @click="handleAddChild(row)">
                        <template #icon><t-icon name="add" /></template>
                        新增下级
                    </t-button>
                </t-space>
            </template>
        </t-enhanced-table>
    </t-card>

    <!-- 新增/编辑菜单弹窗：根据isEdit状态动态显示标题和按钮文本 -->
    <t-dialog v-model:visible="menuDialogVisible" :header="isEdit ? '编辑菜单' : '新增菜单'" width="800px" :confirm-btn="null"
        :cancel-btn="null" class="menu-form-dialog">
        <!-- 菜单表单：支持表单验证和提交 -->
        <t-form ref="menuFormRef" label-align="top" :data="menuForm" :rules="menuFormRules" label-width="100px"
            @submit="handleMenuSubmit" class="menu-form">
            <!-- 表单网格布局：两列显示 -->
            <div class="form-grid">
                <!-- 上级菜单选择 -->
                <t-form-item label="上级菜单" name="parent" class="form-item full-width">
                    <t-input v-model="parentName" placeholder="请输入上级菜单名称（0为顶级菜单）"
                        :disabled="isEdit || (!isEdit && (isHeaderAdd || isChildAdd))" />
                </t-form-item>
                <!-- 菜单类型选择 -->
                <t-form-item label="菜单类型" name="type" class="form-item">
                    <t-radio-group v-model="menuForm.type" @change="handleTypeChange">
                        <t-radio :value="0"
                            :disabled="isEdit || (!isEdit && (!isHeaderAdd || (isChildAdd && parentMenuType !== null)))">目录</t-radio>
                        <t-radio :value="1"
                            :disabled="isEdit || (!isEdit && (isHeaderAdd || (isChildAdd && parentMenuType === 1)))">菜单</t-radio>
                        <t-radio :value="2"
                            :disabled="isEdit || (!isEdit && (isHeaderAdd || (isChildAdd && parentMenuType === 0)))">按钮</t-radio>
                    </t-radio-group>
                </t-form-item>
                <!-- 菜单名称输入 -->
                <t-form-item label="菜单名称" name="title" class="form-item">
                    <t-input v-model="menuForm.title" placeholder="请输入菜单名称" />
                </t-form-item>
                <!-- 菜单名称（英文）（按钮类型不显示） -->
                <t-form-item v-if="menuForm.type !== 2" label="菜单名称（英文）" name="name" class="form-item">
                    <t-input v-model="menuForm.name" placeholder="请输入菜单名称（英文）" />
                </t-form-item>
                <!-- 组件路径（菜单类型显示，按钮类型不显示） -->
                <t-form-item v-if="menuForm.type === 1" label="组件路径" name="component" class="form-item">
                    <t-input v-model="menuForm.component" placeholder="请输入组件路径：/xxx/xxx/xxx" />
                </t-form-item>
                <!-- 权限标识（按钮类型显示） -->
                <t-form-item v-if="menuForm.type === 2" label="权限标识" name="permission" class="form-item">
                    <t-input v-model="menuForm.permission" placeholder="请输入权限标识" />
                </t-form-item>

                <!-- 菜单状态 -->
                <t-form-item label="菜单状态" name="status" class="form-item">
                    <t-radio-group v-model="menuForm.status">
                        <t-radio :value="1">启用</t-radio>
                        <t-radio :value="0">禁用</t-radio>
                    </t-radio-group>
                </t-form-item>
            </div>
        </t-form>
        <!-- 弹窗底部按钮 -->
        <template #footer>
            <t-space>
                <!-- 取消按钮 -->
                <t-button theme="default" @click="menuDialogVisible = false">取消</t-button>
                <!-- 提交按钮：根据编辑状态显示不同文本 -->
                <t-button theme="primary" @click="handleMenuSubmit" :loading="submitLoading">
                    {{ isEdit ? '更新' : '创建' }}
                </t-button>
            </t-space>
        </template>
    </t-dialog>
  </div>
</template>

<script setup>
// Vue 3 Composition API 相关导入
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
// TDesign 组件库相关导入
import { EnhancedTable } from 'tdesign-vue-next'
import { Message } from '@/utils/ui'
// 菜单管理相关 API 导入
import {
    queryMenuList,        // 查询菜单列表
    queryMenuListByLike,  // 模糊查询菜单
    addMenu,             // 新增菜单
    updateMenu,          // 更新菜单
    deleteMenu,          // 删除菜单
    echoMenu             // 菜单数据回显
} from '@/api/menu'

// ==================== 响应式数据定义 ====================
// 加载状态控制
const loading = ref(false)                    // 表格数据加载状态
const submitLoading = ref(false)              // 菜单表单提交状态

// 表格相关数据
const tableData = ref([])                     // 表格数据

// 弹窗显示控制
const menuDialogVisible = ref(false)          // 菜单表单弹窗显示状态

// 业务状态控制
const isEdit = ref(false)                     // 是否为编辑模式
const isHeaderAdd = ref(false)                // 是否为表格头部新增（只能创建目录）
const isChildAdd = ref(false)                 // 是否为操作列新增（上级菜单为当前目录且禁用）
const parentMenuType = ref(null)              // 父菜单类型（操作列新增时使用）
const parentName = ref('')                    // 上级菜单名称（临时变量）
const parentMenuOptions = ref([])             // 上级菜单选项
const isExpandAll = ref(false);
const expandedTreeNodes = ref([]);
const isFullscreen = ref(false);                  // 全屏状态

// 表单引用
const menuFormRef = ref()                     // 菜单表单引用

// ==================== 计算属性 ====================
// 动态计算表格最大高度
const tableMaxHeight = computed(() => {
    return isFullscreen.value ? undefined : '620px'
})

// ==================== 表单数据定义 ====================
// 搜索表单数据
const searchForm = reactive({
    title: '',       // 菜单名称搜索条件
    type: '',        // 菜单类型搜索条件（0-目录，1-菜单，2-按钮）
    status: ''       // 状态搜索条件（1-启用，0-禁用）
})

// 菜单表单数据
const menuForm = reactive({
    id: null,              // 菜单ID（编辑时使用）
    parent: '0',           // 上级菜单名称
    title: '',             // 菜单名称
    type: 0,               // 菜单类型（0-目录，1-菜单，2-按钮）
    name: '',              // 菜单名称（英文）
    permission: '',        // 权限标识
    component: '',         // 组件路径
    status: 1              // 菜单状态（1-启用，0-禁用）
})

// ==================== 表格列配置 ====================
const columns = [
    {
        colKey: 'title',        // 菜单名称列
        title: '菜单名称',
        width: 200,
        fixed: 'left'
    },
    {
        colKey: 'type',         // 菜单类型列（自定义渲染）
        title: '类型',
        width: 100,
        cell: 'type'
    },
    {
        colKey: 'name',         // 菜单名称（英文）列
        title: '路由名称',
        width: 150
    },
    {
        colKey: 'component',    // 组件路径列
        title: '组件路径',
        ellipsis: true,
        width: 180
    },
    {
        colKey: 'permission',   // 权限标识列
        title: '权限标识',
        ellipsis: true,
        width: 200
    },
    {
        colKey: 'status',       // 状态列（自定义渲染）
        title: '状态',
        width: 100,
        cell: 'status'
    },
    {
        colKey: 'operation',    // 操作列（固定右侧，自定义渲染）
        title: '操作',
        width: 250,
        fixed: 'right',
        cell: 'operation'
    }
]

// ==================== 表单验证规则 ====================
// 菜单表单验证规则
const menuFormRules = {
    title: [
        { required: true, message: '菜单名称不能为空' },
        { min: 1, max: 50, message: '菜单名称长度为1-50个字符' }
    ],
    type: [
        { required: true, message: '菜单类型不能为空' }
    ],
    name: [
        { required: true, message: '菜单名称（英文）不能为空', trigger: 'blur' }
    ],
    component: [
        { required: true, message: '组件路径不能为空', trigger: 'blur' }
    ],
    permission: [
        { required: true, message: '权限标识不能为空', trigger: 'blur' }
    ]
}

// ==================== 业务方法定义 ====================
/**
 * 获取菜单列表数据
 */
const fetchMenuList = async () => {
    loading.value = true

    // 如果有搜索条件，使用模糊查询
    if (searchForm.title || searchForm.type || searchForm.status !== '') {
        const params = {
            title: searchForm.title ? searchForm.title.trim() : '',
            type: searchForm.type || '',
            status: searchForm.status !== '' ? Number(searchForm.status) : ''
        }
        const response = await queryMenuListByLike(params)
        if (response.code === 200) {
            tableData.value = response.data || []
        }
    } else {
        // 否则查询所有菜单
        const response = await queryMenuList()
        if (response.code === 200) {
            tableData.value = response.data || []
        }
    }

    loading.value = false
}

/**
 * 获取上级菜单选项（用于新增/编辑时选择上级菜单）
 */
const fetchParentMenuOptions = async () => {
    const response = await queryMenuList()
    if (response.code === 200) {
        // 过滤出目录和菜单类型作为上级菜单选项
        const filterMenus = (menus) => {
            return menus.filter(menu => menu.type !== 2).map(menu => ({
                ...menu,
                children: menu.children ? filterMenus(menu.children) : []
            }))
        }
        parentMenuOptions.value = filterMenus(response.data || [])
    }
}

/**
 * 处理搜索操作
 */
const handleSearch = () => {
    fetchMenuList()
}

/**
 * 处理重置操作
 */
const handleReset = () => {
    Object.assign(searchForm, {
        title: '',
        type: '',
        status: ''
    })
    fetchMenuList()
}

/**
 * 处理展开状态变化
 */
const handleExpandedTreeNodesChange = (expandedRowKeys, options) => {
    expandedTreeNodes.value = expandedRowKeys
}

/**
 * 处理展开/收起全部
 */
const handleExpandAll = () => {
    isExpandAll.value = !isExpandAll.value
    if (isExpandAll.value) {
        expandedTreeNodes.value = filterAllPermissions()
    } else {
        expandedTreeNodes.value = []
    }
}

/**
 * 实现权限id过滤方法
 */
const filterAllPermissions = () => {
    const ids = []
    const traverse = (nodes) => {
        nodes.forEach(node => {
            ids.push(node.id)
            if (node.children && node.children.length > 0) {
                traverse(node.children)
            }
        })
    }
    traverse(tableData.value)
    return ids
}

/**
 * 处理新增菜单操作（表格头部新增，只能创建目录）
 */
const handleAdd = () => {
    isEdit.value = false
    isHeaderAdd.value = true
    isChildAdd.value = false
    parentMenuType.value = null  // 重置父菜单类型
    resetMenuForm()
    menuForm.type = 0  // 强制设置为目录类型
    parentName.value = '0'  // 设置上级菜单名称为0（顶级菜单）
    fetchParentMenuOptions()
    menuDialogVisible.value = true
}

/**
 * 处理新增子菜单操作（操作列新增，只能创建菜单和按钮）
 */
const handleAddChild = (row) => {
    isEdit.value = false
    isHeaderAdd.value = false
    isChildAdd.value = true
    resetMenuForm()
    parentName.value = row.title  // 设置上级菜单名称为当前目录的title值
    parentMenuType.value = row.type  // 记录父菜单类型
    // 根据父菜单类型设置默认菜单类型
    if (row.type === 0) {
        menuForm.type = 1  // 目录下默认创建菜单
    } else if (row.type === 1) {
        menuForm.type = 2  // 菜单下只能创建按钮
    }
    fetchParentMenuOptions()
    menuDialogVisible.value = true
}

/**
 * 处理编辑菜单操作
 */
const handleEdit = async (row) => {
    isEdit.value = true
    isHeaderAdd.value = false  // 编辑时不受新增类型限制
    isChildAdd.value = false   // 编辑时不受新增类型限制
    parentMenuType.value = null  // 重置父菜单类型
    const response = await echoMenu(row.id)
    if (response.code === 200) {
        Object.assign(menuForm, response.data)
        parentName.value = menuForm.parent  // 将parent值赋给parentName用于显示
        fetchParentMenuOptions()
        menuDialogVisible.value = true
    }
}

/**
 * 处理删除菜单操作
 */
const handleDelete = async (row) => {
    const response = await deleteMenu(row.id)
    if (response.code === 200) {
        Message.success('删除成功')
        fetchMenuList()
    }
}

/**
 * 处理菜单类型变化
 */
const handleTypeChange = (value) => {
    // 根据菜单类型清空相关字段
    if (value === 2) {
        // 按钮类型清空组件相关字段
        menuForm.component = ''
    } else if (value === 0) {
        // 目录类型清空组件和权限相关字段
        menuForm.component = ''
        menuForm.permission = ''
    } else if (value === 1) {
        // 菜单类型清空权限标识
        menuForm.permission = ''
    }
}

/**
 * 处理菜单表单提交
 */
const handleMenuSubmit = async () => {
    // 表单验证
    const valid = await menuFormRef.value?.validate()
    if (!valid) return

    submitLoading.value = true

    // 提交前将parentName的值赋给menuForm.parent
    menuForm.parent = parentName.value

    const response = isEdit.value
        ? await updateMenu(menuForm)
        : await addMenu(menuForm)

    if (response.code === 200) {
        Message.success(isEdit.value ? '更新成功' : '创建成功')
        menuDialogVisible.value = false
        fetchMenuList()
    }

    submitLoading.value = false
}

/**
 * 重置菜单表单
 */
const resetMenuForm = () => {
    Object.assign(menuForm, {
        id: null,
        parent: '0',
        title: '',
        type: 0,
        name: '',
        permission: '',
        component: '',
        status: 1
    })
    parentName.value = ''  // 重置上级菜单名称
    // 不重置isHeaderAdd，保持新增类型标识
    menuFormRef.value?.clearValidate()
}

/**
 * 获取菜单类型标签主题
 */
const getTypeTheme = (type) => {
    const themeMap = {
        0: 'primary',   // 目录
        1: 'success',   // 菜单
        2: 'warning'    // 按钮
    }
    return themeMap[type] || 'default'
}

/**
 * 获取菜单类型标签文本
 */
const getTypeLabel = (type) => {
    const labelMap = {
        0: '目录',
        1: '菜单',
        2: '按钮'
    }
    return labelMap[type] || '未知'
}

// ==================== 全屏状态监听方法 ====================
/**
 * 监听全屏状态变化
 */
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

// ==================== 生命周期钩子 ====================
onMounted(() => {
    fetchMenuList()
    // 添加全屏状态监听
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    // 初始化全屏状态
    isFullscreen.value = !!document.fullscreenElement
})

onUnmounted(() => {
    // 清理全屏状态监听
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
/* 搜索卡片样式 */
.search-card {
    margin-bottom: 16px;
}

/* 搜索表单样式 */
.search-form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.search-form-left {
    flex: 1;
    min-width: 0;
}

.search-form-right {
    flex-shrink: 0;
}

/* 表格卡片样式 */
.table-card {
    margin-bottom: 16px;
}

/* 表格头部操作区域样式 */
.table-header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* 菜单表单弹窗样式 */
.menu-form-dialog {
    .menu-form {
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 24px;

            .form-item {
                margin-bottom: 0;

                &.full-width {
                    grid-column: 1 / -1;
                }
            }
        }
    }
}

/* 占位符文本样式 */
.text-placeholder {
    color: var(--td-text-color-placeholder);
    font-style: italic;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .search-form {
        flex-direction: column;
        align-items: stretch;
    }

    .search-form-right {
        align-self: flex-end;
    }

    .menu-form .form-grid {
        grid-template-columns: 1fr;

        .form-item.full-width {
            grid-column: 1;
        }
    }
}
</style>