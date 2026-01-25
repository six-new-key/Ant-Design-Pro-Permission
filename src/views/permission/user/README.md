# 用户管理模块

## 📁 文件结构

```
src/views/permission/user/
├── User.vue                          # 主组件（约 400 行）
├── composables/                      # 可组合函数（业务逻辑）
│   ├── useDict.js                   # 字典数据管理
│   ├── useUserTable.js              # 表格相关逻辑
│   ├── useUserSearch.js             # 搜索功能
│   ├── useUserForm.js               # 用户表单（新增/编辑）
│   ├── useUserOperations.js         # 用户操作（删除、启用/禁用、踢人）
│   ├── useRoleAssign.js             # 角色分配
│   └── usePasswordReset.js          # 密码重置
├── styles/
│   └── user.scss                    # 样式文件
└── README.md                         # 本文件
```

## 🎯 重构目标

将原来 800+ 行的单文件组件拆分为多个职责清晰的模块，提高代码可维护性和复用性。

## 📦 Composables 说明

### useDict.js
**职责**：字典数据管理
- 加载用户状态和性别字典
- 提供性别标签和颜色映射方法

**导出**：
- `statusDict` - 状态字典数据
- `genderDict` - 性别字典数据
- `fetchDictData()` - 加载字典数据
- `getGenderLabel()` - 获取性别标签
- `getGenderColor()` - 获取性别颜色

---

### useUserTable.js
**职责**：表格数据和配置管理
- 表格列定义
- 分页配置
- 数据加载
- 行选择
- 全屏监听

**导出**：
- `loading` - 加载状态
- `tableData` - 表格数据
- `selectedRowKeys` - 选中的行
- `pagination` - 分页配置
- `columns` - 表格列配置
- `tableMaxHeight` - 表格最大高度
- `fetchUserList()` - 加载用户列表
- `onSelectChange()` - 行选择变化
- `getCheckboxProps()` - 复选框属性
- `handleTableChange()` - 表格变化处理

---

### useUserSearch.js
**职责**：搜索功能
- 搜索表单管理
- 搜索和重置操作

**导出**：
- `searchForm` - 搜索表单数据
- `handleSearch()` - 执行搜索
- `handleReset()` - 重置搜索

---

### useUserForm.js
**职责**：用户表单管理（新增/编辑）
- 表单数据和验证规则
- 头像上传
- 新增/编辑用户

**导出**：
- `userDialogVisible` - 弹窗显示状态
- `submitLoading` - 提交加载状态
- `isEdit` - 是否编辑模式
- `userFormRef` - 表单引用
- `userForm` - 表单数据
- `userFormRules` - 验证规则
- `uploadUrl` - 上传地址
- `uploadHeaders` - 上传请求头
- `beforeAvatarUpload()` - 上传前校验
- `handleAvatarChange()` - 上传回调
- `handleAdd()` - 打开新增弹窗
- `handleEdit()` - 打开编辑弹窗
- `handleUserSubmit()` - 提交表单

---

### useUserOperations.js
**职责**：用户操作管理
- 删除用户
- 批量删除
- 启用/禁用
- 踢人下线

**导出**：
- `handleDelete()` - 删除单个用户
- `handleBatchDelete()` - 批量删除
- `handleToggleStatus()` - 切换状态
- `handleKickout()` - 踢人下线

---

### useRoleAssign.js
**职责**：角色分配管理
- 角色列表加载
- 角色分配操作

**导出**：
- `roleDialogVisible` - 弹窗显示状态
- `roleSubmitLoading` - 提交加载状态
- `currentUser` - 当前操作用户
- `roleList` - 角色列表
- `selectedRoles` - 已选角色
- `availableRoles` - 可选角色
- `fetchRoleList()` - 加载角色列表
- `handleAssignRole()` - 打开角色分配弹窗
- `addRole()` - 添加角色
- `removeRole()` - 移除角色
- `handleSaveRoles()` - 保存角色分配

---

### usePasswordReset.js
**职责**：密码重置管理
- 密码表单管理
- 密码重置操作

**导出**：
- `passwordDialogVisible` - 弹窗显示状态
- `passwordSubmitLoading` - 提交加载状态
- `currentUser` - 当前操作用户
- `passwordFormRef` - 表单引用
- `passwordForm` - 表单数据
- `passwordFormRules` - 验证规则
- `handleResetPassword()` - 打开密码重置弹窗
- `handlePasswordSubmit()` - 提交密码重置

---

## 🔧 使用示例

在其他组件中复用 composables：

```javascript
import { useDict } from '@/views/permission/user/composables/useDict'

export default {
  setup() {
    const { genderDict, fetchDictData, getGenderLabel } = useDict()
    
    onMounted(() => {
      fetchDictData()
    })
    
    return {
      genderDict,
      getGenderLabel
    }
  }
}
```

## ✨ 重构优势

1. **代码可读性提升**：每个文件职责单一，易于理解
2. **易于维护**：修改某个功能只需关注对应的 composable
3. **逻辑复用**：composables 可以在其他组件中复用
4. **易于测试**：独立的 composables 更容易进行单元测试
5. **团队协作**：多人可以同时开发不同的 composables，减少冲突

## 📊 代码行数对比

| 文件 | 行数 | 说明 |
|------|------|------|
| **重构前** | | |
| User.vue | ~850 行 | 单文件包含所有逻辑 |
| **重构后** | | |
| User.vue | ~400 行 | 主组件（模板 + 组合逻辑） |
| useDict.js | ~50 行 | 字典管理 |
| useUserTable.js | ~150 行 | 表格管理 |
| useUserSearch.js | ~40 行 | 搜索功能 |
| useUserForm.js | ~170 行 | 表单管理 |
| useUserOperations.js | ~90 行 | 用户操作 |
| useRoleAssign.js | ~90 行 | 角色分配 |
| usePasswordReset.js | ~80 行 | 密码重置 |
| user.scss | ~200 行 | 样式文件 |
| **总计** | ~1270 行 | 但结构清晰，易于维护 |

虽然总行数略有增加（因为增加了注释和文档），但每个文件都很小，职责清晰，维护成本大大降低。
