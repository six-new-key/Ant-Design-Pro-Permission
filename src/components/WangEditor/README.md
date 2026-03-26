# WangEditor 富文本编辑器组件

基于 `@wangeditor/editor-for-vue` 封装的生产级富文本编辑器组件。

## 快速开始

### 基础使用

```vue
<template>
  <WangEditor v-model="content" placeholder="请输入内容" :height="400" />
</template>

<script setup>
import { ref } from 'vue'
import WangEditor from '@/components/WangEditor/index.vue'

const content = ref('')
</script>
```

### 完整示例

```vue
<template>
  <WangEditor 
    v-model="content"
    placeholder="请输入内容"
    :height="500"
    mode="default"
    :max-length="10000"
    :upload-config="uploadConfig"
    @created="handleCreated"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import WangEditor from '@/components/WangEditor/index.vue'

const content = ref('')

// 上传配置
const uploadConfig = {
  image: {
    server: '/api/upload/image',
    fieldName: 'file',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/*']
  },
  video: {
    server: '/api/upload/video',
    fieldName: 'file',
    maxFileSize: 50 * 1024 * 1024 // 50MB
  }
}

const handleCreated = (editor) => {
  console.log('编辑器创建完成', editor)
}

const handleChange = (editor) => {
  console.log('内容变化', editor.getHtml())
}
</script>
```

## Props 配置

### 基础配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 内容（支持 v-model） | String | '' |
| placeholder | 占位符 | String | '请输入内容...' |
| height | 编辑器高度 | Number/String | 400 |
| mode | 模式（default/simple） | String | 'default' |
| disabled | 是否禁用 | Boolean | false |
| readOnly | 是否只读 | Boolean | false |
| autoFocus | 自动聚焦 | Boolean | false |
| scroll | 是否滚动 | Boolean | true |

### 工具栏配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| toolbarConfig | 工具栏配置 | Object | {} |
| excludeKeys | 排除的菜单 | Array | [] |
| insertKeys | 插入的菜单 | Object | null |
| hideToolbar | 隐藏工具栏 | Boolean | false |

### 编辑器配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| editorConfig | 编辑器配置 | Object | {} |
| maxLength | 最大字符数 | Number | undefined |
| uploadConfig | 上传配置 | Object | {} |
| menuConfig | 菜单配置 | Object | {} |

### 高级配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customPaste | 自定义粘贴 | Function | null |
| customAlert | 自定义提示 | Function | null |
| hoverbarKeys | 悬浮菜单配置 | Object | null |
| debounceTime | 防抖时间（ms） | Number | 300 |

## Events 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| created | 编辑器创建完成 | editor |
| change | 内容变化 | editor |
| focus | 获得焦点 | editor |
| blur | 失去焦点 | editor |
| destroyed | 编辑器销毁 | editor |
| maxLength | 达到最大长度 | editor |
| uploadBefore | 上传前 | file |
| uploadProgress | 上传进度 | progress |
| uploadSuccess | 上传成功 | file, res |
| uploadFailed | 上传失败 | file, res |
| uploadError | 上传错误 | file, err, res |

## Methods 方法

通过 `ref` 调用组件方法：

```vue
<template>
  <WangEditor ref="editorRef" v-model="content" />
  <button @click="handleGetHtml">获取 HTML</button>
</template>

<script setup>
import { ref } from 'vue'
import WangEditor from '@/components/WangEditor/index.vue'

const editorRef = ref()
const content = ref('')

const handleGetHtml = () => {
  const html = editorRef.value.getHtml()
  console.log(html)
}
</script>
```

### 内容操作

- `getHtml()` - 获取 HTML 内容
- `getText()` - 获取纯文本内容
- `setHtml(html)` - 设置 HTML 内容
- `clear()` - 清空内容
- `isEmpty()` - 判断是否为空

### 插入操作

- `insertText(text)` - 插入文本
- `insertHtml(html)` - 插入 HTML
- `insertNode(node)` - 插入节点

### 选区操作

- `focus(toEnd)` - 聚焦（toEnd: 是否聚焦到末尾）
- `blur()` - 失焦
- `selectAll()` - 全选

### 状态控制

- `enable()` - 启用编辑器
- `disable()` - 禁用编辑器
- `isDisabled()` - 是否禁用

### 历史操作

- `undo()` - 撤销
- `redo()` - 重做

### 全屏操作

- `fullScreen()` - 全屏
- `unFullScreen()` - 退出全屏
- `isFullScreen()` - 是否全屏

### 其他

- `getEditor()` - 获取编辑器实例
- `destroy()` - 销毁编辑器
- `getConfig()` - 获取配置
- `getAllMenuKeys()` - 获取所有菜单键

## 功能特性

### 1. 主题切换支持

组件自动跟随项目主题切换（明亮/暗黑模式），无需额外配置。

```vue
<template>
  <!-- 组件会自动根据 appStore.themeMode 切换主题 -->
  <WangEditor v-model="content" />
</template>
```

**主题变量自定义：**

如需自定义主题颜色，可在全局样式中覆盖 CSS 变量：

```css
/* 自定义明亮主题 */
:root {
  --w-e-textarea-bg-color: #ffffff;
  --w-e-textarea-color: #333333;
}

/* 自定义暗黑主题 */
html[theme-mode="dark"] {
  --w-e-textarea-bg-color: #1f1f1f;
  --w-e-textarea-color: #d4d4d4;
}
```

**支持的主题变量：**
- `--w-e-textarea-bg-color` - 编辑器背景色
- `--w-e-textarea-color` - 编辑器文字颜色
- `--w-e-toolbar-bg-color` - 工具栏背景色
- `--w-e-toolbar-color` - 工具栏文字颜色
- `--w-e-dropdown-bg-color` - 下拉菜单背景色
- 更多变量请查看组件源码

### 2. 完整工具栏

- **文本格式**：标题、加粗、斜体、下划线、删除线
- **颜色**：文字颜色、背景色
- **字体**：字号、字体、行高
- **列表**：无序列表、有序列表、待办事项
- **对齐**：左对齐、居中、右对齐、两端对齐
- **插入**：链接、图片、视频、表格、代码块、分割线
- **操作**：撤销、重做、全屏

### 2. 完整工具栏

```javascript
const uploadConfig = {
  image: {
    server: '/api/upload/image',
    fieldName: 'file',
    maxFileSize: 5 * 1024 * 1024,
    maxNumberOfFiles: 10,
    allowedFileTypes: ['image/*'],
    meta: { token: 'xxx' },
    headers: { Authorization: 'Bearer xxx' },
    timeout: 10 * 1000,
    withCredentials: true
  }
}
```

### 3. 图片上传

```javascript
const uploadConfig = {
  video: {
    server: '/api/upload/video',
    fieldName: 'file',
    maxFileSize: 50 * 1024 * 1024,
    maxNumberOfFiles: 5,
    allowedFileTypes: ['video/*'],
    meta: { token: 'xxx' },
    headers: { Authorization: 'Bearer xxx' },
    timeout: 60 * 1000,
    withCredentials: true
  }
}
```

### 4. 视频上传

```javascript
const menuConfig = {
  // 颜色配置
  colors: ['#000000', '#ffffff', '#ff0000'],
  
  // 字体配置
  fontFamily: [
    { name: '黑体', value: '黑体' },
    { name: '宋体', value: '宋体' }
  ],
  
  // 字号配置
  fontSize: ['12px', '14px', '16px', '18px', '20px'],
  
  // 行高配置
  lineHeight: ['1', '1.5', '2', '2.5', '3'],
  
  // 表情配置
  emotions: [
    { alt: '😀', src: 'https://...' }
  ]
}
```

### 5. 菜单配置

```vue
<WangEditor 
  v-model="content" 
  :read-only="true"
  :hide-toolbar="true"
/>
```

### 6. 只读模式

```vue
<WangEditor 
  v-model="content" 
  :disabled="true"
/>
```

### 7. 禁用模式

```vue
<WangEditor 
  v-model="content" 
  :max-length="10000"
  @maxLength="handleMaxLength"
/>
```

### 8. 最大长度限制

```vue
<WangEditor 
  v-model="content" 
  :custom-paste="handleCustomPaste"
/>

<script setup>
const handleCustomPaste = (editor, event, callback) => {
  // 自定义粘贴逻辑
  console.log('粘贴事件', event)
  return true // 返回 false 阻止粘贴
}
</script>
```

### 9. 自定义粘贴

```vue
<WangEditor 
  v-model="content" 
  :custom-alert="handleCustomAlert"
/>

<script setup>
const handleCustomAlert = (info, type) => {
  // 自定义提示逻辑
  console.log(info, type)
}
</script>
```

### 10. 自定义提示

内容变化自动防抖（默认 300ms），减少不必要的更新。

### 11. 防抖优化

1. **编辑器实例**：使用 `shallowRef` 存储，避免深度监听
2. **内存管理**：组件销毁时自动销毁编辑器实例
3. **空内容处理**：自动清理空段落标签（`<p><br></p>`）
4. **上传配置**：需要后端接口返回标准格式：`{ code: 200, data: { url: '...' } }`
5. **样式隔离**：使用 scoped 样式，避免全局污染

## 项目结构

```
WangEditor/
├── index.vue                 # 主组件（包含所有样式和逻辑）
├── README.md                 # 使用文档
├── config/                   # 配置文件
│   ├── defaultToolbar.js    # 工具栏配置
│   ├── defaultEditor.js     # 编辑器配置
│   ├── defaultMenu.js       # 菜单配置
│   └── defaultUpload.js     # 上传配置
└── utils/                    # 工具函数
    ├── validate.js          # 验证函数
    ├── format.js            # 格式化函数
    └── debounce.js          # 防抖函数
```

## 更新日志

### v1.0.0 (2026-02-10)

- ✅ 完整封装 WangEditor 5.x
- ✅ 支持 v-model 双向绑定
- ✅ 支持明亮/暗黑主题自动切换
- ✅ 完整工具栏配置
- ✅ 图片/视频上传
- ✅ 菜单配置（颜色、字体、字号、行高、表情）
- ✅ 生命周期钩子
- ✅ 自定义粘贴和提示
- ✅ 内容变化防抖
- ✅ 完整的暴露方法
- ✅ 内存管理和资源清理
- ✅ 只读/禁用模式
- ✅ 最大长度限制
