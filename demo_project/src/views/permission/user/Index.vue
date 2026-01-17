<template>
  <div>
    <!-- 搜索和操作区域 -->
    <t-card :bordered="false" class="search-card">
        <!-- 搜索表单容器：左右布局，左侧表单自适应，右侧按钮固定宽度 -->
        <div class="search-form">
            <!-- 左侧表单区域：包含搜索条件 -->
            <div class="search-form-left">
                <t-form ref="searchFormRef" :data="searchForm" layout="inline" :label-width="0">
                    <!-- 用户名搜索 -->
                    <t-form-item name="userName">
                        <t-input v-model="searchForm.userName" placeholder="请输入用户名" clearable style="width: 200px" />
                    </t-form-item>
                    <!-- 手机号搜索 -->
                    <t-form-item name="phone">
                        <t-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 200px" />
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
                <!-- 新增用户按钮 -->
                <t-button theme="primary" @click="handleAdd">
                    <template #icon><t-icon name="add" /></template>
                    新增
                </t-button>
                <!-- 批量删除按钮：根据选中状态动态显示数量 -->
                <t-button theme="danger" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
                    <template #icon><t-icon name="delete" /></template>
                    删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
                </t-button>
            </div>
        </template>
        <!-- 用户数据表格：支持多选、分页、排序等功能 -->
        <t-table :maxHeight="tableMaxHeight" ref="tableRef" :data="tableData" :columns="columns" :loading="loading"
            :pagination="pagination" :selected-row-keys="selectedRowKeys" row-key="id" hover active-row-type="single"
            @select-change="handleSelectChange" @page-change="handlePageChange">
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
                    <t-button :disabled="row.id === 1" theme="primary" variant="text" size="small" @click="handleEdit(row)">
                        <template #icon><t-icon name="edit" /></template>
                        编辑
                    </t-button>
                    <!-- 删除按钮：带确认弹窗 -->
                    <t-popconfirm content="确认删除该用户吗？" @confirm="handleDelete(row)">
                        <t-button :disabled="row.id === 1" theme="danger" variant="text" size="small">
                            <template #icon><t-icon name="delete" /></template>
                            删除
                        </t-button>
                    </t-popconfirm>
                    <!-- 更多操作下拉菜单：角色分配、密码重置、状态切换 -->
                    <t-dropdown :disabled="row.id === 1" :options="getOperationOptions(row)" @click="handleOperationClick($event, row)">
                        <t-button theme="default" variant="outline" size="small">
                            <template #icon><t-icon name="ellipsis" /></template>
                        </t-button>
                    </t-dropdown>
                </t-space>
            </template>
        </t-table>
    </t-card>

    <!-- 新增/编辑用户弹窗：根据isEdit状态动态显示标题和按钮文本 -->
    <t-dialog v-model:visible="userDialogVisible" :header="isEdit ? '编辑用户' : '新增用户'" width="700px" :confirm-btn="null"
        :cancel-btn="null" class="user-form-dialog">
        <!-- 用户表单：支持表单验证和提交 -->
        <t-form ref="userFormRef" label-align="top" :data="userForm" :rules="userFormRules" label-width="100px"
            @submit="handleUserSubmit" class="user-form">
            <!-- 表单网格布局：两列显示 -->
            <div class="form-grid">
                <!-- 用户名输入：编辑时禁用 -->
                <t-form-item label="用户名" name="userName" class="form-item">
                    <t-input v-model="userForm.userName" placeholder="请输入用户名" :disabled="isEdit" />
                </t-form-item>
                <!-- 邮箱输入 -->
                <t-form-item label="邮箱" name="email" class="form-item">
                    <t-input v-model="userForm.email" placeholder="请输入邮箱" />
                </t-form-item>
                <!-- 密码输入：仅新增时显示 -->
                <t-form-item v-if="!isEdit" label="密码" name="password" class="form-item">
                    <t-input v-model="userForm.password" type="password" placeholder="请输入密码" />
                </t-form-item>
                <!-- 确认密码：仅新增时显示 -->
                <t-form-item v-if="!isEdit" label="确认密码" name="confirmPassword" class="form-item">
                    <t-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" />
                </t-form-item>
                <!-- 手机号输入 -->
                <t-form-item label="手机号" name="phone" class="form-item">
                    <t-input v-model="userForm.phone" placeholder="请输入手机号" />
                </t-form-item>
                <!-- 状态选择：启用/禁用 -->
                <t-form-item label="状态" name="status" class="form-item">
                    <t-radio-group v-model="userForm.status">
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
                <t-button theme="default" @click="userDialogVisible = false">取消</t-button>
                <!-- 提交按钮：根据编辑状态显示不同文本 -->
                <t-button theme="primary" @click="handleUserSubmit" :loading="submitLoading">
                    {{ isEdit ? '更新' : '创建' }}
                </t-button>
            </t-space>
        </template>
    </t-dialog>

    <!-- 角色分配弹窗 -->
    <t-dialog v-model:visible="roleDialogVisible" header="分配角色" width="800px" :confirm-btn="null" :cancel-btn="null">
        <div class="role-assign-content">
            <p class="assign-user-info">
                为用户 <strong>{{ currentUser.userName }}</strong> 分配角色：
            </p>
            <div class="role-layout">
                <div class="role-section">
                    <h4 class="section-title">已分配角色</h4>
                    <div class="role-grid">
                        <div v-for="role in selectedRoles" :key="role" class="role-tag assigned">
                            {{ role }}
                            <t-icon name="close" class="remove-icon" @click="removeRole(role)" />
                        </div>
                        <div v-if="selectedRoles.length === 0" class="empty-state">
                            暂无已分配角色
                        </div>
                    </div>
                </div>
                <div class="role-section">
                    <h4 class="section-title">可分配角色</h4>
                    <div class="role-grid">
                        <div v-for="role in availableRoles" :key="role" class="role-tag available"
                            @click="addRole(role)">
                            {{ role }}
                            <t-icon name="add" class="add-icon" />
                        </div>
                        <div v-if="availableRoles.length === 0" class="empty-state">
                            暂无可分配角色
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <t-space>
                <t-button theme="default" @click="roleDialogVisible = false">取消</t-button>
                <t-button theme="primary" @click="handleSaveRoles" :loading="roleSubmitLoading">
                    保存
                </t-button>
            </t-space>
        </template>
    </t-dialog>

    <!-- 重置密码弹窗 -->
    <t-dialog v-model:visible="passwordDialogVisible" header="重置密码" width="500px" :confirm-btn="null" :cancel-btn="null"
        class="password-reset-dialog">
        <div class="user-info-section">
            <h4 class="user-title">为用户<span class="username-display">{{ currentUser.userName }}</span>重置密码</h4>
        </div>

        <t-form ref="passwordFormRef" :data="passwordForm" :rules="passwordFormRules" label-align="top"
            label-width="120px" class="password-form">
            <t-form-item label="新密码" name="newPassword">
                <t-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" clearable>
                    <template #prefix-icon>
                        <t-icon name="lock-on" />
                    </template>
                </t-input>
            </t-form-item>
            <t-form-item label="确认密码" name="confirmPassword">
                <t-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" clearable>
                    <template #prefix-icon>
                        <t-icon name="lock-on" />
                    </template>
                </t-input>
            </t-form-item>
        </t-form>

        <div class="password-tips">
            <t-icon name="info-circle" class="tip-icon" />
            <span class="tip-text">密码长度为6-20个字符，建议包含字母、数字和特殊字符</span>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <t-button theme="default" @click="passwordDialogVisible = false">
                    取消
                </t-button>
                <t-button theme="primary" @click="handlePasswordSubmit" :loading="passwordSubmitLoading">
                    重置密码
                </t-button>
            </div>
        </template>
    </t-dialog>
  </div>
</template>

<script setup>
// Vue 3 Composition API 相关导入
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
// TDesign 组件库相关导入
import { DialogPlugin } from 'tdesign-vue-next'
import { Message } from '@/utils/ui'
// 用户管理相关 API 导入
import {
    queryUserList,        // 查询用户列表
    addUser,             // 新增用户
    updateUser,          // 更新用户
    batchDeleteUser,     // 批量删除用户
    updateUserStatus,    // 更新用户状态
    echoUserById,        // 根据ID获取用户信息
    queryUserRoles,      // 查询用户角色
    saveUserRoles,       // 保存用户角色
    resetUserPassword    // 重置用户密码
} from '@/api/user'
// 角色管理相关 API 导入
import { queryRoleList } from '@/api/role'

// ==================== 响应式数据定义 ====================
// 加载状态控制
const loading = ref(false)                    // 表格数据加载状态
const submitLoading = ref(false)              // 用户表单提交状态
const roleSubmitLoading = ref(false)          // 角色分配提交状态
const passwordSubmitLoading = ref(false)      // 密码重置提交状态

// 表格相关数据
const tableData = ref([])                     // 表格数据
const selectedRowKeys = ref([])               // 选中的行键值

// 弹窗显示控制
const userDialogVisible = ref(false)          // 用户表单弹窗显示状态
const roleDialogVisible = ref(false)          // 角色分配弹窗显示状态
const passwordDialogVisible = ref(false)      // 密码重置弹窗显示状态

// 业务状态控制
const isEdit = ref(false)                     // 是否为编辑模式
const currentUser = ref({})                   // 当前操作的用户信息

// 角色相关数据
const roleList = ref([])                      // 所有角色列表
const selectedRoles = ref([])                 // 已选中的角色列表

// 全屏状态
const isFullscreen = ref(false)               // 浏览器全屏状态

// 表单引用
const userFormRef = ref()                     // 用户表单引用
const passwordFormRef = ref()                 // 密码表单引用

// ==================== 表单数据定义 ====================
// 搜索表单数据
const searchForm = reactive({
    userName: '',    // 用户名搜索条件
    phone: '',       // 手机号搜索条件
    status: ''       // 状态搜索条件（1-启用，0-禁用）
})

// 用户表单数据
const userForm = reactive({
    id: null,              // 用户ID（编辑时使用）
    userName: '',          // 用户名
    email: '',             // 邮箱
    phone: '',             // 手机号
    password: '',          // 密码（新增时使用）
    confirmPassword: '',   // 确认密码（新增时使用）
    status: 1              // 用户状态（1-启用，0-禁用）
})

// 密码重置表单数据
const passwordForm = reactive({
    userName: '',          // 用户名（显示用）
    newPassword: '',       // 新密码
    confirmPassword: ''    // 确认新密码
})

// ==================== 分页配置 ====================
const pagination = reactive({
    current: 1,                        // 当前页码
    pageSize: 10,                      // 每页显示数量
    total: 0,                          // 总记录数
    showJumper: true,                  // 显示页码跳转
    showSizer: true,                   // 显示每页数量选择器
    pageSizeOptions: [10, 20, 50, 100] // 每页数量选项
})

// ==================== 表格列配置 ====================
const columns = [
    {
        colKey: 'row-select',    // 多选列
        type: 'multiple',
        width: 50,
        //禁用管理员
        disabled: ({ row }) => row.id === 1,
    },
    {
        colKey: 'id',           // ID列
        title: 'ID',
        width: 80,
        fixed: 'left'
    },
    {
        colKey: 'userName',     // 用户名列
        title: '用户名',
        width: 140
    },
    {
        colKey: 'email',        // 邮箱列
        title: '邮箱',
        width: 180
    },
    {
        colKey: 'phone',        // 手机号列
        title: '手机号',
        width: 140
    },
    {
        colKey: 'status',       // 状态列（自定义渲染）
        title: '状态',
        width: 100,
        cell: 'status'
    },
    {
        colKey: 'createTime',   // 创建时间列
        title: '创建时间',
        width: 180
    },
    {
        colKey: 'operation',    // 操作列（固定右侧，自定义渲染）
        title: '操作',
        width: 220,
        fixed: 'right',
        cell: 'operation'
    }
]

// ==================== 表单验证规则 ====================
// 用户表单验证规则
const userFormRules = {
    userName: [
        { required: true, message: '用户名不能为空' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' }
    ],
    email: [
        { required: true, message: '邮箱不能为空' },
        { email: true, message: '请输入正确的邮箱格式' }
    ],
    phone: [
        { required: true, message: '手机号不能为空' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
    ],
    password: [
        { required: true, message: '密码不能为空' },
        { min: 6, max: 20, message: '密码长度为6-20个字符' }
    ],
    confirmPassword: [
        { required: true, message: '确认密码不能为空' },
        {
            validator: (val) => val === userForm.password,
            message: '两次输入的密码不一致'
        }
    ]
}

// 密码重置表单验证规则
const passwordFormRules = {
    newPassword: [
        { required: true, message: '新密码不能为空' },
        { min: 6, max: 20, message: '密码长度为6-20个字符' }
    ],
    confirmPassword: [
        { required: true, message: '确认密码不能为空' },
        {
            validator: (val) => val === passwordForm.newPassword,
            message: '两次输入的密码不一致'
        }
    ]
}

// ==================== 计算属性 ====================
// 根据全屏状态动态设置表格最大高度
const tableMaxHeight = computed(() => {
    return isFullscreen.value ? undefined : '420px'
})

// ==================== 业务方法定义 ====================
/**
 * 获取用户列表数据
 * 根据搜索条件和分页参数查询用户列表
 */
const fetchUserList = async () => {
    loading.value = true
    // 构建请求参数，空字段设置为空字符串
    const params = {
        userName: searchForm.userName ? searchForm.userName.trim() : '',
        phone: searchForm.phone ? searchForm.phone.trim() : '',
        status: searchForm.status !== '' ? Number(searchForm.status) : ''
    }

    const response = await queryUserList(pagination.current, pagination.pageSize, params)
    if (response.code === 200 && response.data !== null) {
        tableData.value = response.data.data || []
        pagination.total = response.data.total || 0
    }
    loading.value = false
}

/**
 * 获取角色列表数据
 * 用于角色分配功能
 */
const fetchRoleList = async () => {
    const response = await queryRoleList()
    if (response.code === 200) {
        roleList.value = response.data || []
    }
}

/**
 * 处理搜索操作
 * 重置到第一页并重新查询数据
 */
const handleSearch = () => {
    pagination.current = 1
    fetchUserList()
}

/**
 * 处理重置操作
 * 清空搜索条件并重新查询数据
 */
const handleReset = () => {
    Object.assign(searchForm, {
        userName: '',
        phone: '',
        status: ''
    })
    pagination.current = 1
    fetchUserList()
}

/**
 * 处理新增用户操作
 * 打开用户表单弹窗（新增模式）
 */
const handleAdd = () => {
    isEdit.value = false
    resetUserForm()
    userDialogVisible.value = true
}

const handleEdit = async (row) => {
    isEdit.value = true
    const response = await echoUserById(row.id)
    if (response.code === 200) {
        Object.assign(userForm, response.data)
        userDialogVisible.value = true
    }
}

const handleDelete = async (row) => {
    const response = await batchDeleteUser([row.id])
    if (response.code === 200) {
        Message.success('删除成功')
        fetchUserList()
    }
}

const handleBatchDelete = async () => {
    if (selectedRowKeys.value.length === 0) {
        Message.warning('请选择要删除的用户')
        return
    }

    const dialogInstance = DialogPlugin.confirm({
        header: '确认批量删除',
        body: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？此操作不可撤销。`,
        confirmBtn: '确定删除',
        cancelBtn: '取消',
        theme: 'danger',
        onConfirm: async () => {
            const response = await batchDeleteUser(selectedRowKeys.value)
            if (response.code === 200) {
                Message.success('批量删除成功')
                selectedRowKeys.value = []
                fetchUserList()
                dialogInstance.destroy()
            }
        },
        onCancel: () => {
            console.log('用户取消了批量删除操作')
        }
    })
}

const handleToggleStatus = (row) => {
    const action = row.status === 1 ? '禁用' : '启用'
    const theme = row.status === 1 ? 'danger' : 'success'

    const dialogInstance = DialogPlugin.confirm({
        header: '确认操作',
        body: `确定要${action}用户 "${row.userName}" 吗？`,
        confirmBtn: '确定',
        cancelBtn: '取消',
        theme: theme,
        onConfirm: async () => {
            const response = await updateUserStatus(row.id)
            if (response.code === 200) {
                Message.success(`${action}成功`)
                fetchUserList()
                dialogInstance.destroy()
            }
        },
        onCancel: () => {
            console.log('用户取消了操作')
        }
    })
}

const handleAssignRole = async (row) => {
    currentUser.value = row
    const response = await queryUserRoles(row.id)
    if (response.code === 200) {
        selectedRoles.value = response.data || []
        roleDialogVisible.value = true
    }
}

const handleResetPassword = (row) => {
    currentUser.value = row
    passwordForm.userName = row.userName
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordDialogVisible.value = true
}

const handleUserSubmit = async () => {
    const valid = await userFormRef.value.validate()
    if (!valid) return

    submitLoading.value = true
    const apiMethod = isEdit.value ? updateUser : addUser
    const response = await apiMethod(userForm)

    if (response.code === 200) {
        Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
        userDialogVisible.value = false
        fetchUserList()
    }
    submitLoading.value = false
}

// 计算可分配角色
const availableRoles = computed(() => {
    return roleList.value.filter(role => !selectedRoles.value.includes(role))
})

// 添加角色
const addRole = (role) => {
    if (!selectedRoles.value.includes(role)) {
        selectedRoles.value.push(role)
    }
}

// 移除角色
const removeRole = (role) => {
    const index = selectedRoles.value.indexOf(role)
    if (index > -1) {
        selectedRoles.value.splice(index, 1)
    }
}

const handleSaveRoles = async () => {
    roleSubmitLoading.value = true
    const response = await saveUserRoles(currentUser.value.userName, selectedRoles.value)
    if (response.code === 200) {
        Message.success('角色分配成功')
        roleDialogVisible.value = false
    }
    roleSubmitLoading.value = false
}

const handlePasswordSubmit = async () => {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    passwordSubmitLoading.value = true
    const response = await resetUserPassword({
        id: currentUser.value.id,
        password: passwordForm.newPassword
    })

    if (response.code === 200) {
        Message.success('密码重置成功')
        passwordDialogVisible.value = false
    }
    passwordSubmitLoading.value = false
}

const handleSelectChange = (value) => {
    selectedRowKeys.value = value
}

const handlePageChange = (pageInfo) => {
    // 检查是否是分页大小变化
    if (pageInfo.pageSize !== pagination.pageSize) {
        // 分页大小变化时，重置到第一页
        pagination.pageSize = pageInfo.pageSize
        pagination.current = 1
    } else {
        // 只是页码变化
        pagination.current = pageInfo.current
    }
    fetchUserList()
}

const resetUserForm = () => {
    Object.assign(userForm, {
        id: null,
        userName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        status: 1
    })
}

// 生成操作下拉菜单选项
const getOperationOptions = (row) => {
    return [
        {
            content: '分配角色',
            value: 'assignRole',
            divider: true
        },
        {
            content: '重置密码',
            value: 'resetPassword',
            divider: true
        },
        {
            content: row.status === 1 ? '禁用' : '启用',
            value: 'toggleStatus',
            divider: true
        },
    ]
}

// 处理操作下拉菜单点击
const handleOperationClick = (data, row) => {
    const { value } = data

    switch (value) {
        case 'toggleStatus':
            handleToggleStatus(row)
            break
        case 'assignRole':
            handleAssignRole(row)
            break
        case 'resetPassword':
            handleResetPassword(row)
            break
    }
}

// 全屏状态监听方法
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
    fetchUserList()
    fetchRoleList()
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

<style scoped>
/* ==================== 搜索区域样式 ==================== */
/* 搜索卡片容器 */
.search-card {
    margin-bottom: 20px;
}

/* 搜索表单主容器：左右布局 */
.search-form {
    margin-bottom: 0;
    display: flex;
    align-items: center;
}

/* 左侧表单区域：自适应宽度，包含搜索条件 */
.search-form-left {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
}

/* 右侧操作按钮区域：固定宽度，包含搜索和重置按钮 */
.search-form-right {
    width: 180px;
    flex-shrink: 0;
}

/* ==================== 角色分配弹窗样式 ==================== */
/* 角色分配弹窗内容容器 */
.role-assign-content {
    padding: 0;
}

/* 用户信息显示区域 */
.assign-user-info {
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--td-text-color-primary);
}

.assign-user-info strong {
    color: var(--td-brand-color);
    font-weight: var(--td-font-weight-semi-bold);
}

/* 角色分配主布局：左右两栏 */
.role-layout {
    display: flex;
    gap: 24px;
    min-height: 300px;
}

/* 角色区域容器：已分配和可分配 */
.role-section {
    flex: 1;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 6px;
    padding: 10px;
    background: var(--td-bg-color-container);
}

/* 区域标题样式 */
.section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    border-bottom: 1px solid var(--td-border-level-1-color);
    padding-bottom: 8px;
}

/* 角色网格布局 */
.role-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    max-height: 240px;
    overflow-y: auto;
}

/* 角色标签基础样式 */
.role-tag {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    word-break: break-all;
}

/* 已分配角色标签样式 */
.role-tag.assigned {
    background: var(--td-success-color-1);
    border: 1px solid var(--td-success-color-3);
    color: var(--td-success-color-7);
}

/* 已分配角色标签悬停效果 */
.role-tag.assigned:hover {
    background: var(--td-success-color-2);
    border-color: var(--td-success-color-4);
}

/* 可分配角色标签样式 */
.role-tag.available {
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-border-level-1-color);
    color: var(--td-text-color-primary);
}

/* 可分配角色标签悬停效果 */
.role-tag.available:hover {
    background: var(--td-brand-color-1);
    border-color: var(--td-brand-color-3);
    color: var(--td-brand-color-7);
}

/* 角色操作图标基础样式 */
.remove-icon,
.add-icon {
    font-size: 12px;
    margin-left: 4px;
    opacity: 0.7;
}

/* 移除角色图标悬停效果 */
.remove-icon:hover {
    opacity: 1;
    color: var(--td-error-color);
}

/* 添加角色图标悬停效果 */
.add-icon:hover {
    opacity: 1;
    color: var(--td-brand-color);
}

/* 空状态提示样式 */
.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    color: var(--td-text-color-placeholder);
    font-size: 14px;
}

/* ==================== 密码重置弹窗样式 ==================== */
/* 用户信息展示区域 */
.password-reset-dialog .user-info-section {
    display: flex;
    align-items: center;
    padding: 10px 0;
    background: var(--td-bg-color-container-hover);
    border-radius: 8px;
    padding-left: 16px;
}

/* 用户图标样式 */
.password-reset-dialog .user-icon {
    color: var(--td-brand-color);
    margin-right: 12px;
}

/* 用户标题文本 */
.password-reset-dialog .user-title {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    font-weight: normal;
}

/* 用户名高亮显示 */
.password-reset-dialog .username-display {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--td-brand-color);
}

/* 密码表单容器 */
.password-reset-dialog .password-form {
    margin-top: 20px;
}

/* 密码提示信息容器 */
.password-reset-dialog .password-tips {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: var(--td-warning-color-1);
    border: 1px solid var(--td-warning-color-3);
    border-radius: 6px;
    margin-top: 16px;
}

/* 提示图标样式 */
.password-reset-dialog .tip-icon {
    color: var(--td-warning-color-7);
    margin-right: 8px;
    flex-shrink: 0;
}

/* 提示文本样式 */
.password-reset-dialog .tip-text {
    font-size: 13px;
    color: var(--td-warning-color-7);
    line-height: 1.4;
}

/* 弹窗底部按钮区域 */
.password-reset-dialog .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* ==================== 表格相关样式 ==================== */
/* 表格头部操作区域样式 */
.table-header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* ==================== 弹窗相关样式 ==================== */
/* 角色分配弹窗内容区域：限制高度并支持滚动 */
.role-assign-content {
    max-height: 400px;
    overflow-y: auto;
}

/* 密码重置弹窗主体样式 */
.password-reset-dialog .t-dialog__body {
    padding: 24px;
    background: var(--td-bg-color-container-hover);
}

/* 密码重置警告提示框 */
.password-reset-dialog .warning-box {
    background: var(--td-warning-color-1);
    border: 1px solid var(--td-warning-color-3);
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 24px;
    color: var(--td-warning-color-7);
    font-size: 14px;
    line-height: 1.5;
}

/* 警告提示框标题 */
.password-reset-dialog .warning-box .warning-title {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

/* 警告图标 */
.password-reset-dialog .warning-box .warning-title::before {
    content: '⚠️';
    margin-right: 8px;
}

/* 用户表单弹窗内的表单样式 */
.user-form-dialog .t-form {
    padding: 0 24px;
}

/* ==================== 用户表单弹窗样式 ==================== */
/* 用户表单网格布局 */
.user-form-dialog .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
    padding: 8px 0;
}

/* 表单项基础样式 */
.user-form-dialog .form-item {
    margin-bottom: 0;
}

/* 密码字段在新增时占满整行 */
.user-form-dialog .form-item:has([name="password"]),
.user-form-dialog .form-item:has([name="confirmPassword"]) {
    grid-column: 1 / -1;
}

/* ==================== 响应式设计 ==================== */
/* 移动端用户表单弹窗适配 */
@media (max-width: 768px) {
    .user-form-dialog .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .user-form-dialog {
        width: 90% !important;
    }
}

/* 移动端整体布局适配 */
@media (max-width: 768px) {
    .user-management {
        padding: 16px;
    }

    .search-form {
        flex-direction: column;
        gap: 16px;
    }

    .search-form-left {
        width: 100%;
    }

    .search-form-right {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .search-form-left :deep(.t-form-item) {
        margin-bottom: 16px;
    }
}
</style>