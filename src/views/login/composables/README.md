# 登录页面 Composables 说明

本目录包含登录页面的所有业务逻辑，按功能模块拆分为独立的 composable 函数。

## 文件结构

```
composables/
├── useLoginForm.js          # 表单数据和验证
├── useLoginAuth.js          # 登录认证逻辑
├── useCaptcha.js            # 验证码管理
├── useBackgroundControl.js  # 背景控制（动态/静态）
├── useThemeControl.js       # 主题和语言控制
└── useLoginStyles.js        # 样式计算
```

## 模块说明

### useLoginForm.js
负责登录表单的数据管理和验证规则。

**导出：**
- `formRef` - 表单引用
- `formData` - 表单数据（用户名、密码、验证码等）
- `rules` - 表单验证规则
- `resetForm()` - 重置表单
- `validateForm()` - 验证表单

### useLoginAuth.js
负责登录认证流程。

**导出：**
- `loading` - 登录加载状态
- `doLogin()` - 执行登录（包含表单验证和验证码检查）
- `doLoginSubmit()` - 提交登录请求

### useCaptcha.js
负责验证码的管理和交互。

**导出：**
- `dragVerify` - 装饰性滑块验证引用
- `verifyRef` - AJ-Captcha 验证码引用
- `captchaType` - 验证码类型
- `handleVerifySuccess()` - 验证成功回调
- `handleCaptchaPass()` - 滑块验证通过
- `showCaptcha()` - 显示验证码弹窗
- `resetCaptcha()` - 重置验证码

### useBackgroundControl.js
负责登录页面背景的控制和切换。

**导出：**
- `handleDynamicBgChange()` - 切换动态背景
- `handleStaticBgChange()` - 切换静态背景
- `handleVisualQualityChange()` - 切换视觉风格
- `handleFormPositionChange()` - 切换表单位置

**内部功能：**
- 动态背景初始化和销毁
- 背景图片预加载
- 主题色变化时更新动态背景
- 监听主题模式变化

### useThemeControl.js
负责主题和语言的控制。

**导出：**
- `color` - 计算的颜色值
- `dotColor` - 点图标颜色
- `iconSize` - 图标大小
- `toggleThemeMode()` - 切换主题模式
- `handleLanguageChange()` - 切换语言

### useLoginStyles.js
负责登录页面的样式计算。

**导出：**
- `token` - Ant Design 主题 token
- `loginContainerStyle` - 登录容器样式
- `controlPanelStyle` - 控制面板样式

## 使用示例

```vue
<script setup>
import { useLoginForm } from './composables/useLoginForm'
import { useLoginAuth } from './composables/useLoginAuth'
import { useCaptcha } from './composables/useCaptcha'
import { useBackgroundControl } from './composables/useBackgroundControl'
import { useThemeControl } from './composables/useThemeControl'
import { useLoginStyles } from './composables/useLoginStyles'

// 组合各个功能模块
const { formRef, formData, rules, validateForm, resetForm } = useLoginForm()
const { loading, doLogin } = useLoginAuth()
const { dragVerify, verifyRef, captchaType, showCaptcha, resetCaptcha } = useCaptcha()
const { handleDynamicBgChange, handleStaticBgChange } = useBackgroundControl()
const { toggleThemeMode, handleLanguageChange } = useThemeControl()
const { token, loginContainerStyle } = useLoginStyles()

// 处理登录
const handleLogin = async () => {
  try {
    await doLogin(formData, validateForm, showCaptcha)
  } catch (error) {
    resetForm()
    resetCaptcha()
  }
}
</script>
```

## 设计原则

1. **单一职责**：每个 composable 只负责一个功能领域
2. **可复用性**：逻辑与组件解耦，便于测试和复用
3. **清晰的依赖**：通过参数传递依赖，避免隐式耦合
4. **统一的命名**：使用 `use` 前缀，遵循 Vue 3 Composition API 规范
