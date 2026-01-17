<div align="center">
  <h1>Ant Design Pro Vue</h1>
  <p>开箱即用的中后台前端解决方案</p>
</div>

<div align="center">

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2-1890FF.svg)](https://antdv.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## ✨ 特性

- 🎨 **现代化 UI**: 基于 Ant Design Vue 4.x，提供精美的界面设计
- 🌓 **主题定制**: 支持明暗主题切换，可自定义主题色、字体大小、圆角等
- 🌍 **国际化**: 内置中英文支持，集成自动翻译功能
- 🤖 **AI 对话**: 集成 Ant Design X Vue，支持 AI 对话功能
- 📝 **Markdown 渲染**: 支持代码高亮、数学公式(KaTeX)、流程图(Mermaid)
- 💻 **代码编辑器**: 集成 Monaco Editor
- 🔐 **权限管理**: 完整的权限控制和路由守卫
- 📦 **状态管理**: 基于 Pinia，支持状态持久化
- 🎯 **TypeScript 友好**: 完整的类型支持
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🚀 **开发体验**: 组件自动导入、热更新、开发工具支持

## 📦 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **构建工具**: [Vite 7](https://vitejs.dev/) - 下一代前端构建工具
- **UI 组件库**: [Ant Design Vue 4](https://antdv.com/) - 企业级 UI 设计语言
- **AI 组件**: [Ant Design X Vue](https://x.ant.design/) - AI 对话组件
- **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 官方状态管理库
- **路由管理**: [Vue Router 4](https://router.vuejs.org/) - Vue 官方路由
- **HTTP 请求**: [Axios](https://axios-http.com/) - 基于 Promise 的 HTTP 客户端
- **样式处理**: [SCSS](https://sass-lang.com/) - CSS 预处理器
- **Markdown**: [vue-renderer-markdown](https://github.com/mengdu/vue-renderer-markdown) - Markdown 渲染器
- **代码编辑器**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 编辑器核心
- **图标库**: [@ant-design/icons-vue](https://antdv.com/components/icon) - Ant Design 图标

## 📁 项目结构

```
ant-design-pro-vue/
├── doc/                    # 组件文档
│   ├── Attachments.md     # 附件组件文档
│   ├── Bubble.md          # 气泡组件文档
│   ├── Conversations.md   # 对话组件文档
│   └── ...
├── lang/                   # 国际化语言包
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   └── js/                # 第三方 JS 库
├── src/
│   ├── api/               # API 接口定义
│   ├── assets/            # 项目资源文件
│   │   └── icons/         # SVG 图标
│   ├── components/        # 公共组件
│   │   ├── core/          # 核心组件
│   │   ├── custom/        # 自定义组件
│   │   └── PageTemplate.vue
│   ├── layouts/           # 布局组件
│   │   ├── sidebar/       # 侧边栏布局
│   │   ├── topbar/        # 顶栏布局
│   │   ├── mixed/         # 混合布局
│   │   ├── doublecolumn/  # 双列布局
│   │   ├── fullscreen/    # 全屏布局
│   │   └── LayoutManager.vue
│   ├── locale/            # 国际化配置
│   ├── plugins/           # 插件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   │   └── modules/       # 状态模块
│   ├── style/             # 全局样式
│   │   └── global.scss    # 全局 SCSS 变量
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   │   ├── Dashboard/     # 仪表盘
│   │   ├── Form/          # 表单页面
│   │   ├── List/          # 列表页面
│   │   ├── Profile/       # 详情页面
│   │   ├── Result/        # 结果页面
│   │   ├── Exception/     # 异常页面
│   │   ├── Account/       # 账户中心
│   │   ├── User/          # 用户管理
│   │   ├── Editor/        # 编辑器
│   │   ├── Llm/           # AI 对话
│   │   ├── login/         # 登录页面
│   │   └── ...
│   ├── App.vue            # 根组件
│   ├── main.js            # 应用入口
│   ├── permission.js      # 权限控制
│   └── settings.js        # 全局配置
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
└── package.json           # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 6.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## ⚙️ 配置说明

### 环境变量

项目支持多环境配置，通过 `.env.*` 文件管理：

**开发环境 (`.env.development`)**
```env
NODE_ENV = 'development'
VITE_APP_BASE_API = '/api'
VITE_DEV_SERVE = 'http://localhost:8201'
```

**生产环境 (`.env.production`)**
```env
NODE_ENV = 'production'
VITE_APP_BASE_API = '/api'
VITE_PROD_SERVE = 'http://your-production-server.com'
```

### 全局配置

在 `src/settings.js` 中配置项目基础信息：

```javascript
export const settings = {
  projectName: 'Ant Design Pro',      // 项目名称
  bgColor: '#181818',                 // 页面背景色
  componentBgColor: '#242424',        // 组件背景色
  sidebarWidth: 228,                  // 侧边栏宽度
  sidebarWidthCollapsed: 48,          // 侧边栏折叠宽度
  firstColumnWidth: 70,               // 双列布局首列宽度
  secondColumnWidth: 210,             // 双列布局第二列宽度
  scriptUrl: '//at.alicdn.com/...',  // Iconfont 地址
}
```

### 代理配置

在 `vite.config.js` 中配置开发服务器代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8201',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## 🎨 主题定制

项目支持丰富的主题定制功能：

- **主题模式**: 明亮/暗黑模式切换
- **主题色**: 自定义主题色
- **布局模式**: 侧边栏/顶栏/混合/双列/全屏布局
- **组件样式**: 字体大小、圆角、线框模式等

主题配置通过 Pinia Store 管理，支持持久化存储。

## 📚 功能模块

### 仪表盘 (Dashboard)
- 数据概览
- 图表展示
- 快捷操作

### 表单页面 (Form)
- 基础表单
- 高级表单
- 分步表单

### 列表页面 (List)
- 基础列表
- 卡片列表
- 表格列表
- 搜索列表

### 详情页面 (Profile)
- 基础详情
- 高级详情

### 结果页面 (Result)
- 成功页面
- 失败页面

### 异常页面 (Exception)
- 403 无权限
- 404 页面不存在
- 500 服务器错误

### 编辑器 (Editor)
- 流程图编辑器
- 思维导图编辑器
- Koni 编辑器

### AI 对话 (LLM)
- 智能对话
- 上下文管理
- Markdown 渲染
- 代码高亮

### 账户中心
- 个人中心
- 个人设置

## 🔐 权限管理

项目实现了完整的权限控制系统：

1. **路由守卫**: 在 `src/permission.js` 中配置
2. **Token 认证**: 基于 Token 的身份验证
3. **自动跳转**: 未登录自动跳转到登录页
4. **用户信息**: 自动获取并缓存用户信息

## 🌍 国际化

项目内置国际化支持：

- 支持中文、英文
- 自动翻译功能（基于有道翻译 API）
- 语言切换持久化
- 日期时间本地化

## 📖 组件文档

项目在 `doc/` 目录下提供了详细的组件使用文档：

- `Attachments.md` - 附件上传组件
- `Bubble.md` - 气泡消息组件
- `Conversations.md` - 对话列表组件
- `Prompts.md` - 提示词组件
- `Sender.md` - 消息发送组件
- `Suggestion.md` - 建议组件
- `ThoughtChain.md` - 思维链组件
- `VueMarkdownRenderer.md` - Markdown 渲染器
- `Welcome.md` - 欢迎页组件
- `XProvider.md` - AI 上下文提供者
- `XRequest.md` - AI 请求组件
- `XStream.md` - AI 流式响应组件
- `useXAgent.md` - AI Agent Hook
- `useXChat.md` - AI Chat Hook

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/` 中配置路由
3. 在菜单配置中添加菜单项

### 添加新组件

1. 在 `src/components/` 下创建组件
2. 如需全局注册，在 `src/plugins/` 中配置

### 调用 API

1. 在 `src/api/` 中定义接口
2. 使用 Axios 实例发起请求
3. 统一的错误处理和拦截器

### 状态管理

1. 在 `src/stores/modules/` 中创建 Store
2. 使用 Pinia 的 Composition API
3. 支持状态持久化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## 💬 交流与支持

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/ant-design-pro-vue/issues)
- 发起 [Discussion](https://github.com/your-username/ant-design-pro-vue/discussions)

## 🙏 鸣谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [Ant Design X](https://x.ant.design/)

---

<div align="center">
  Made with ❤️ by Your Team
</div>
