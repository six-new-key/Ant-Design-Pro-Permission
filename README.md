# 通用后台权限管理系统 前端开发规范文档

> 本文档基于 Vue 3 + Vite + Ant Design Vue 技术栈制定，旨在统一团队代码风格，提高协作效率和代码质量。

---

## 一、技术栈规范

### 1.1 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.x | 前端框架 |
| Vite | ^7.x | 构建工具 |
| Ant Design Vue | ^4.2.x | UI 组件库 |
| Pinia | ^3.x | 状态管理 |
| Vue Router | ^4.x | 路由管理 |
| Axios | ^1.x | HTTP 请求 |
| SCSS | - | CSS 预处理器 |

### 1.2 禁止使用

- 禁止使用 Vue 2 Options API，统一使用 Composition API
- 禁止使用 `var` 声明变量
- 禁止使用未处理的 Promise 异常
- 禁止在模板中直接编写复杂逻辑

---

## 二、目录结构规范

```
src/
├── api/                    # API 接口管理
│   ├── auth/              # 认证模块
│   │   ├── index.js       # 接口定义
│   │   └── sms.js         # 子模块接口
│   ├── user/              # 用户模块
│   ├── role/              # 角色模块
│   └── ...
├── assets/                # 静态资源
│   └── icons/             # SVG 图标
├── components/            # 公共组件
│   ├── core/              # 核心布局组件
│   │   ├── TabsView.vue
│   │   └── ...
│   ├── custom/            # 业务组件
│   │   ├── DictSelect.vue
│   │   └── ...
│   └── WangEditor/        # 第三方组件封装
├── constants/             # 常量定义
│   ├── routes.js          # 路由常量
│   └── dictTypes.js       # 字典类型常量
├── directives/            # 自定义指令
│   └── permission.js      # 权限指令
├── layouts/               # 布局组件
│   ├── LayoutManager.vue  # 布局管理器
│   ├── sidebar/           # 侧边栏布局
│   ├── topbar/            # 顶部栏布局
│   ├── mixed/             # 混合布局
│   ├── doublecolumn/      # 双列布局
│   └── fullscreen/        # 全屏布局
├── locale/                # 国际化
├── plugins/               # 插件
├── router/                # 路由配置
│   ├── index.js           # 路由器实例
│   └── routes.js          # 常量路由
├── stores/                # Pinia Store
│   ├── index.js           # Store 入口
│   └── modules/           # Store 模块
│       ├── user.js
│       ├── app.js
│       └── ...
├── style/                 # 全局样式
│   ├── global.scss        # SCSS 变量
│   └── index.scss         # 全局样式入口
├── utils/                 # 工具函数
│   ├── request.js         # Axios 封装
│   ├── auth.js            # 认证工具
│   ├── message.js         # 消息提示
│   ├── useDict.js         # 字典工具
│   └── index.js           # 统一导出
├── views/                 # 页面视图
│   ├── login/             # 登录模块
│   │   ├── Login.vue
│   │   ├── components/    # 页面组件
│   │   ├── composables/   # 组合式函数
│   │   └── styles/        # 页面样式
│   ├── system/            # 系统管理
│   ├── permission/        # 权限管理
│   └── ...
├── App.vue                # 根组件
├── main.js                # 入口文件
├── permission.js          # 路由守卫
└── settings.js            # 全局配置
```

---

## 三、命名规范

### 3.1 文件命名

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| Vue 组件 | PascalCase | `UserManagement.vue`, `DictSelect.vue` |
| JS/TS 文件 | camelCase | `useLoginForm.js`, `request.js` |
| 工具函数文件 | camelCase | `formatDate.js`, `validate.js` |
| 样式文件 | camelCase / kebab-case | `user.scss`, `login-styles.scss` |
| 常量文件 | camelCase | `dictTypes.js`, `routes.js` |
| 目录 | camelCase / kebab-case | `userManagement/`, `login-styles/` |

### 3.2 组件命名

```vue
<!-- 正确 -->
<UserManagement />
<DictSelect />
<SidebarLayout />

<!-- 错误 -->
<user-management />
<dict_select />
<sidebar-layout />
```

### 3.3 变量命名

```javascript
// 常量 - 全大写下划线分隔
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api';

// 普通变量 - camelCase
let userName = '';
let isLoading = false;
let tableData = [];

// 布尔值 - is/has/can 前缀
let isVisible = false;
let hasPermission = true;
let canEdit = false;

// 数组 - 复数形式
let users = [];
let roleList = [];
let menuItems = [];

// 函数 - 动词开头
createUser();
fetchUserList();
handleSubmit();
validateForm();

// 事件处理 - handle 前缀
handleClick();
handleSubmit();
handleSearch();

// 异步函数 - 动词开头
async fetchData() {}
async loadUserInfo() {}
```

### 3.4 组合式函数命名

```javascript
// 必须以 use 开头
useLoginForm();
useUserTable();
usePermission();
useDict();
```

### 3.5 Store 命名

```javascript
// 必须以 use 开头，以 Store 结尾
useUserStore();
useAppStore();
useThemeStore();
useTabsStore();
```

---

## 四、代码风格规范

### 4.1 缩进与格式

- 使用 **2 个空格** 缩进
- 使用 **单引号** 作为字符串引号
- 语句结尾**不加分号**（除必要情况）
- 最大行长度 **100 字符**

```javascript
// 正确
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores'

const userName = ref('')
const isLoading = computed(() => store.isLoading)

// 错误
import { ref, computed } from "vue";
const userName = ref("");
```

### 4.2 Vue 单文件组件规范

```vue
<template>
  <!-- 模板中使用双引号 -->
  <div class="user-container">
    <a-input 
      v-model:value="userName" 
      placeholder="请输入用户名"
      @pressEnter="handleSearch" 
    />
  </div>
</template>

<script setup>
/**
 * 组件功能说明
 * @description 用户管理组件，包含增删改查功能
 * @author 作者名
 * @date 2024-01-01
 */

import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { message } from '@/utils'

// ==================== Props & Emits ====================
const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success', 'error', 'update:visible'])

// ==================== 状态定义 ====================
const userStore = useUserStore()
const loading = ref(false)
const formData = reactive({
  userName: '',
  email: '',
  phone: ''
})

// ==================== 计算属性 ====================
const canSubmit = computed(() => {
  return formData.userName && formData.email && !loading.value
})

// ==================== 方法定义 ====================
const fetchUserInfo = async () => {
  try {
    loading.value = true
    const res = await userStore.getUserInfo(props.userId)
    Object.assign(formData, res.data)
  } catch (error) {
    message.error(error.message)
    emit('error', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  // 提交逻辑
  emit('success', formData)
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.user-container {
  padding: $content-padding;
  
  :deep(.ant-input) {
    border-radius: 4px;
  }
}
</style>
```

### 4.3 API 模块规范

```javascript
// api/user/index.js
import { request } from '@/utils'

// 请求前缀统一使用大写常量
const PREFIX = '/user'

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function querySelf() {
  return request({
    url: `${PREFIX}/info`,
    method: 'GET'
  })
}

/**
 * 新增用户
 * @param {Object} data - 用户数据
 * @returns {Promise}
 */
export function addUser(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

/**
 * 修改用户
 * @param {Object} data - 用户数据
 * @returns {Promise}
 */
export function updateUser(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

/**
 * 删除用户
 * @param {string} id - 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return request({
    url: `${PREFIX}/remove/${id}`,
    method: 'DELETE'
  })
}

/**
 * 分页查询用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function queryUserList(params) {
  return request({
    url: `${PREFIX}/list`,
    method: 'POST',
    data: params
  })
}
```

### 4.4 Store 规范

```javascript
// stores/modules/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { querySelf, updateProfile } from '@/api/user'
import { AuthUtils } from '@/utils'

export const useUserStore = defineStore(
  'user',
  () => {
    // ==================== State ====================
    const userData = ref(null)
    const permissions = ref([])
    const roles = ref([])

    // ==================== Getters ====================
    const isAdmin = computed(() => {
      return roles.value.some(role => role.code === 'admin')
    })

    const userName = computed(() => {
      return userData.value?.userName || ''
    })

    // ==================== Actions ====================
    const fetchUserInfo = async () => {
      const res = await querySelf()
      if (res.code === 200) {
        userData.value = res.data.user
        permissions.value = res.data.permissions || []
        roles.value = res.data.roles || []
        return res.data
      }
      throw new Error(res.message)
    }

    const updateUserProfile = async (data) => {
      const res = await updateProfile(data)
      if (res.code === 200) {
        Object.assign(userData.value, data)
        return res.data
      }
      throw new Error(res.message)
    }

    const clearUserData = () => {
      userData.value = null
      permissions.value = []
      roles.value = []
    }

    return {
      userData,
      permissions,
      roles,
      isAdmin,
      userName,
      fetchUserInfo,
      updateUserProfile,
      clearUserData
    }
  },
  {
    // 持久化配置
    persist: {
      key: 'user-store',
      storage: localStorage,
      pick: ['userData', 'permissions', 'roles']
    }
  }
)
```

### 4.5 Composables 规范

```javascript
// composables/useUserTable.js
import { ref, reactive, computed } from 'vue'
import { queryUserList, deleteUser } from '@/api/user'
import { message, confirm } from '@/utils'

/**
 * 用户表格管理
 * @param {Object} options - 配置选项
 * @returns {Object} 表格相关状态和方法
 */
export function useUserTable(options = {}) {
  // 默认值配置
  const { immediate = true, pageSize = 10 } = options

  // ==================== 状态 ====================
  const loading = ref(false)
  const dataSource = ref([])
  const pagination = reactive({
    current: 1,
    pageSize,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`
  })
  const searchForm = reactive({
    userName: '',
    status: undefined
  })
  const selectedRowKeys = ref([])

  // ==================== 计算属性 ====================
  const hasSelected = computed(() => selectedRowKeys.value.length > 0)

  // ==================== 方法 ====================
  const fetchData = async () => {
    loading.value = true
    try {
      const params = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      const res = await queryUserList(params)
      if (res.code === 200) {
        dataSource.value = res.data.list
        pagination.total = res.data.total
      }
    } catch (error) {
      message.error(error.message)
    } finally {
      loading.value = false
    }
  }

  const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    fetchData()
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  const handleReset = () => {
    searchForm.userName = ''
    searchForm.status = undefined
    handleSearch()
  }

  const handleDelete = async (id) => {
    try {
      await confirm('确认删除该用户吗？')
      const res = await deleteUser(id)
      if (res.code === 200) {
        message.success('删除成功')
        fetchData()
      }
    } catch (error) {
      // 用户取消操作
    }
  }

  const handleBatchDelete = async () => {
    if (!hasSelected.value) return
    try {
      await confirm(`确认删除选中的 ${selectedRowKeys.value.length} 个用户吗？`)
      // 批量删除逻辑
      message.success('批量删除成功')
      selectedRowKeys.value = []
      fetchData()
    } catch (error) {
      // 用户取消操作
    }
  }

  // ==================== 初始化 ====================
  if (immediate) {
    fetchData()
  }

  return {
    loading,
    dataSource,
    pagination,
    searchForm,
    selectedRowKeys,
    hasSelected,
    fetchData,
    handleTableChange,
    handleSearch,
    handleReset,
    handleDelete,
    handleBatchDelete
  }
}
```

---

## 五、注释规范

### 5.1 文件头注释

```javascript
/**
 * @description 用户管理 API 模块
 * @author 作者名
 * @date 2024-01-01
 * @version 1.0.0
 */
```

### 5.2 函数/方法注释

```javascript
/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} [params.userName] - 用户名（可选）
 * @returns {Promise<Object>} 返回用户列表数据
 * @throws {Error} 请求失败时抛出错误
 * @example
 * const data = await fetchUserList({ pageNum: 1, pageSize: 10 })
 */
const fetchUserList = async (params) => {
  // 实现代码
}
```

### 5.3 行内注释

```javascript
// 正确：有意义的注释
// 计算已选中的可关闭标签页数量
const closableCount = tabs.filter(tab => tab.closable && !tab.pinned).length

// 错误：无意义的注释
const count = 10 // 设置 count 为 10
```

### 5.4 代码分段注释

```javascript
// ==================== Props & Emits ====================
const props = defineProps({})
const emit = defineEmits([])

// ==================== 状态定义 ====================
const loading = ref(false)

// ==================== 计算属性 ====================
const canSubmit = computed(() => {})

// ==================== 方法定义 ====================
const handleSubmit = () => {}

// ==================== 生命周期 ====================
onMounted(() => {})
```

---

## 六、组件设计规范

### 6.1 Props 定义规范

```javascript
const props = defineProps({
  // 基础类型
  userId: {
    type: String,
    required: true
  },
  
  // 带默认值的布尔值
  visible: {
    type: Boolean,
    default: false
  },
  
  // 带默认值的字符串
  placeholder: {
    type: String,
    default: '请输入'
  },
  
  // 数组类型
  columns: {
    type: Array,
    default: () => []
  },
  
  // 对象类型
  config: {
    type: Object,
    default: () => ({})
  },
  
  // 自定义验证
  status: {
    type: String,
    validator: (value) => ['active', 'inactive', 'pending'].includes(value)
  },
  
  // 多类型
  value: {
    type: [String, Number],
    default: ''
  }
})
```

### 6.2 事件命名规范

```javascript
// 正确：使用动词短语
emit('submit')
emit('search')
emit('update:visible')  // v-model 语法
emit('pageChange')

// 错误
emit('onSubmit')
emit('handleClick')
```

### 6.3 自定义组件 v-model

```vue
<template>
  <a-select 
    :value="modelValue"
    @update:value="handleChange"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
```

### 6.4 组件通信规范

```javascript
// 1. Props/Emits - 父子组件通信
// 父组件
<ChildComponent 
  :data="parentData" 
  @submit="handleSubmit" 
/>

// 2. Provide/Inject - 跨层级通信（谨慎使用）
// 祖先组件
provide('userInfo', userInfo)

// 后代组件
const userInfo = inject('userInfo')

// 3. Pinia - 全局状态
const userStore = useUserStore()
```

---

## 七、API 设计规范

### 7.1 请求封装

```javascript
// 统一使用 request 实例
import { request } from '@/utils'

// GET 请求
export function fetchUserInfo(id) {
  return request({
    url: `/user/${id}`,
    method: 'GET'
  })
}

// POST 请求（JSON 数据）
export function createUser(data) {
  return request({
    url: '/user/add',
    method: 'POST',
    data
  })
}

// POST 请求（表单数据）
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/file/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 文件下载
export function downloadFile(id) {
  return request({
    url: `/file/download/${id}`,
    method: 'GET',
    responseType: 'blob'
  })
}
```

### 7.2 错误处理规范

```javascript
// 在组件中
const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.fetchUserList(params)
    // 成功处理
    data.value = res.data
  } catch (error) {
    // 错误已在 request.js 拦截器中统一提示
    // 只需进行额外处理
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}
```

### 7.3 API 响应格式

```javascript
// 标准响应结构
{
  code: 200,        // 状态码 200 表示成功
  message: '成功',   // 提示信息
  data: {}          // 业务数据
}
```

---

## 八、样式规范

### 8.1 SCSS 变量使用

```scss
// style/global.scss
$bg-color: #181818;
$component-bg-color: #242424;
$sidebar-width: 228px;
$top-height: 52px;
$content-padding: 20px;

// 组件中使用
<style scoped lang="scss">
.container {
  padding: $content-padding;
  background: $bg-color;
}
</style>
```

### 8.2 样式作用域

```vue
<!-- 组件样式使用 scoped -->
<style scoped lang="scss">
.component-name {
  // 组件样式
}
</style>

<!-- 需要修改子组件样式时使用 :deep() -->
<style scoped lang="scss">
.component-name {
  :deep(.ant-input) {
    border-radius: 4px;
  }
}
</style>
```

### 8.3 CSS 命名规范

```scss
// BEM 命名规范
// Block（块）
.user-card { }

// Element（元素）
.user-card__header { }
.user-card__body { }
.user-card__footer { }

// Modifier（修饰符）
.user-card--active { }
.user-card--disabled { }
```

### 8.4 动态样式绑定

```vue
<template>
  <div 
    class="dynamic-box"
    :style="{ 
      background: token.colorPrimary,
      fontSize: token.fontSize + 'px'
    }"
  >
  </div>
</template>

<script setup>
import { theme } from 'ant-design-vue'
const { token } = theme.useToken()
</script>
```

---

## 九、最佳实践

### 9.1 性能优化

```javascript
// 1. 组件懒加载
const UserManagement = () => import('@/views/system/UserManagement.vue')

// 2. 大列表虚拟滚动
import { useVirtualList } from '@vueuse/core'

// 3. 防抖节流
import { debounce, throttle } from 'lodash-es'

const handleSearch = debounce(() => {
  fetchData()
}, 300)

// 4. 计算属性缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// 5. v-for 使用 key
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

### 9.2 安全规范

```javascript
// 1. 防止 XSS - 使用 v-html 时确保内容安全
// 错误
<div v-html="userInput"></div>

// 正确 - 使用 DOMPurify 净化
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(userInput)

// 2. 敏感信息不存储在本地
// 错误
localStorage.setItem('password', password)

// 正确 - 只存储必要的 token
sessionStorage.setItem('tempData', data)

// 3. 路由权限验证
// 已在 permission.js 中统一处理
```

### 9.3 代码复用

```javascript
// 1. 逻辑复用使用 Composables
// composables/useTable.js
export function useTable(api, options = {}) {
  // 通用表格逻辑
}

// 2. 组件复用
// components/custom/DictSelect.vue - 字典下拉框
// components/custom/DictTag.vue - 字典标签

// 3. 工具函数复用
// utils/format.js - 格式化函数
// utils/validate.js - 验证函数
```

### 9.4 路由规范

```javascript
// router/routes.js
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
      hidden: true,      // 不在菜单显示
      noAuth: true       // 不需要认证
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404/404.vue'),
    meta: {
      title: '404',
      hidden: true
    }
  }
]
```

### 9.5 表单处理规范

```vue
<template>
  <a-form 
    ref="formRef"
    :model="formData"
    :rules="rules"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 20 }"
  >
    <a-form-item label="用户名" name="userName">
      <a-input v-model:value="formData.userName" placeholder="请输入用户名" />
    </a-form-item>
    
    <a-form-item :wrapper-col="{ offset: 4 }">
      <a-space>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          提交
        </a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref()
const submitting = ref(false)

const formData = reactive({
  userName: '',
  email: '',
  phone: ''
})

const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    // 提交逻辑
  } catch (error) {
    // 验证失败
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>
```

---

## 十、工具推荐

### 10.1 VSCode 插件

- **Volar** - Vue 3 官方插件
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Auto Import** - 自动导入
- **Vue VSCode Snippets** - 代码片段

### 10.2 浏览器插件

- **Vue DevTools** - Vue 调试工具
- **Pinia DevTools** - Pinia 调试



## 十二、附录

### 12.1 常用快捷键

| 操作 | Windows | Mac |
|------|---------|-----|
| 格式化代码 | Alt + Shift + F | Option + Shift + F |
| 快速修复 | Ctrl + . | Cmd + . |
| 打开文件 | Ctrl + P | Cmd + P |
| 全局搜索 | Ctrl + Shift + F | Cmd + Shift + F |
| 命令面板 | Ctrl + Shift + P | Cmd + Shift + P |

### 12.2 项目命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```
