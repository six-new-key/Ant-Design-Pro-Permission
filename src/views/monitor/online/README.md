# 在线用户模块

## 功能说明

实时监控系统在线用户，支持查看用户登录信息和强制下线操作。

## 数据来源

- **在线判断**：Sa-Token会话（`StpUtil.searchTokenValue`）
- **详细信息**：Refresh Token（IP、浏览器、登录时间）

## 页面功能

### 1. 在线用户列表
- 用户ID
- 用户名
- IP地址
- 归属地（暂未实现，显示"未知"）
- 浏览器
- 操作系统
- 登录时间
- 剩余时长（实时倒计时）

### 2. 搜索功能
- 支持按用户名搜索

### 3. 强制下线
- 点击"强制下线"按钮
- 二次确认
- 清除用户的Access Token和Refresh Token
- 用户下次请求时需要重新登录

### 4. 自动刷新
- 每30秒自动刷新在线用户列表
- 剩余时长每秒自动更新

## 技术实现

### 后端
- **Controller**: `OnlineUserController`
- **Service**: `IOnlineUserService` / `OnlineUserServiceImpl`
- **VO**: `OnlineUserVo`
- **API**:
  - `GET /monitor/online/users` - 分页查询在线用户
  - `DELETE /monitor/online/users/{userId}` - 强制下线

### 前端
- **页面**: `src/views/monitor/online/OnlineUser.vue`
- **API**: `src/api/online/index.js`
- **Composables**:
  - `useOnlineUserTable.js` - 表格数据管理
  - `useOnlineUserOperations.js` - 操作逻辑
  - `useCountdown.js` - 倒计时功能

## 使用说明

1. 访问"系统监控 > 在线用户"菜单
2. 查看当前在线用户列表
3. 可按用户名搜索
4. 点击"强制下线"按钮可强制用户下线
5. 列表每30秒自动刷新，剩余时长实时倒计时

## 注意事项

1. 强制下线后，用户的所有Token会被清除
2. 用户下次请求时会被拦截器拦截，需要重新登录
3. IP归属地功能暂未实现，可后续集成IP解析API
4. 剩余时长小于5分钟时会显示为红色标签
