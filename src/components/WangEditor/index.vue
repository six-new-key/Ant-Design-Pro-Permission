<template>
  <div 
    class="wang-editor-wrapper" 
    :class="wrapperClass"
    :style="containerStyle">
    <!-- 工具栏 -->
    <Toolbar
      v-if="!hideToolbar"
      class="wang-editor-toolbar"
      :style="computedToolbarStyle"
      :editor="editorRef"
      :defaultConfig="finalToolbarConfig"
      :mode="mode"
    />
    
    <!-- 编辑器 -->
    <Editor
      class="wang-editor-content"
      :style="computedEditorStyle"
      v-model="valueHtml"
      :defaultConfig="finalEditorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onFocus="handleFocus"
      @onBlur="handleBlur"
      @onDestroyed="handleDestroyed"
      @onMaxLength="handleMaxLength"
      @customAlert="handleCustomAlert"
      @customPaste="handleCustomPaste"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useAppStore } from '@/stores/modules/app'
import { getToolbarConfig } from './config/defaultToolbar'
import { getEditorConfig } from './config/defaultEditor'
import { getMenuConfig } from './config/defaultMenu'
import { getImageUploadConfig, getVideoUploadConfig } from './config/defaultUpload'
import { validateLink, validateImageSrc, validateVideoSrc } from './utils/validate'
import { parseLinkUrl, parseImageSrc, parseVideoSrc, cleanEmptyHtml, deepMerge } from './utils/format'
import { debounce } from './utils/debounce'

// 获取主题状态
const appStore = useAppStore()

// ==================== Props ====================
const props = defineProps({
  // 基础配置
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  height: {
    type: [Number, String],
    default: 400
  },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'simple'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  autoFocus: {
    type: Boolean,
    default: false
  },
  scroll: {
    type: Boolean,
    default: true
  },
  
  // 工具栏配置
  toolbarConfig: {
    type: Object,
    default: () => ({})
  },
  excludeKeys: {
    type: Array,
    default: () => []
  },
  insertKeys: {
    type: Object,
    default: null
  },
  hideToolbar: {
    type: Boolean,
    default: false
  },
  
  // 编辑器配置
  editorConfig: {
    type: Object,
    default: () => ({})
  },
  maxLength: {
    type: Number,
    default: undefined
  },
  
  // 上传配置
  uploadConfig: {
    type: Object,
    default: () => ({})
  },
  
  // 菜单配置
  menuConfig: {
    type: Object,
    default: () => ({})
  },
  
  // 高级配置
  customPaste: {
    type: Function,
    default: null
  },
  customAlert: {
    type: Function,
    default: null
  },
  hoverbarKeys: {
    type: Object,
    default: null
  },
  
  // 样式配置
  containerStyle: {
    type: Object,
    default: () => ({})
  },
  toolbarStyle: {
    type: Object,
    default: () => ({})
  },
  editorStyle: {
    type: Object,
    default: () => ({})
  },
  
  // 其他
  debounceTime: {
    type: Number,
    default: 300
  }
})

// ==================== Emits ====================
const emit = defineEmits([
  'update:modelValue',
  'created',
  'change',
  'focus',
  'blur',
  'destroyed',
  'maxLength',
  'uploadBefore',
  'uploadProgress',
  'uploadSuccess',
  'uploadFailed',
  'uploadError'
])

// ==================== 状态 ====================
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.modelValue || '')

// 是否已创建
const isCreated = ref(false)

// ==================== 计算属性 ====================
// 包装器类名
const wrapperClass = computed(() => {
  return {
    'wang-editor-disabled': props.disabled,
    'wang-editor-readonly': props.readOnly,
    'wang-editor-no-toolbar': props.hideToolbar,
    'dark-theme': appStore.themeMode === 'dark'
  }
})

// 工具栏样式
const computedToolbarStyle = computed(() => {
  return {
    borderBottom: '1px solid #ccc',
    ...props.toolbarStyle
  }
})

// 编辑器样式
const computedEditorStyle = computed(() => {
  const height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return {
    height,
    overflowY: props.scroll ? 'auto' : 'hidden',
    ...props.editorStyle
  }
})

// 最终工具栏配置
const finalToolbarConfig = computed(() => {
  let config = getToolbarConfig(props.mode, props.toolbarConfig)
  
  // 排除菜单
  if (props.excludeKeys && props.excludeKeys.length > 0) {
    config.excludeKeys = props.excludeKeys
  }
  
  // 插入菜单
  if (props.insertKeys) {
    config.insertKeys = props.insertKeys
  }
  
  return config
})

// 最终编辑器配置
const finalEditorConfig = computed(() => {
  // 基础配置
  let config = getEditorConfig(props, props.editorConfig)
  
  // 菜单配置
  const menuConf = getMenuConfig(props.menuConfig)
  
  // 上传配置
  const uploadCallbacks = {
    onBeforeUpload: (file) => {
      emit('uploadBefore', file)
      return file
    },
    onProgress: (progress) => {
      emit('uploadProgress', progress)
    },
    onSuccess: (file, res) => {
      emit('uploadSuccess', file, res)
    },
    onFailed: (file, res) => {
      emit('uploadFailed', file, res)
    },
    onError: (file, err, res) => {
      emit('uploadError', file, err, res)
    }
  }
  
  // 图片上传配置
  if (props.uploadConfig.image) {
    menuConf.uploadImage = getImageUploadConfig(
      props.uploadConfig.image,
      uploadCallbacks
    )
  }
  
  // 视频上传配置
  if (props.uploadConfig.video) {
    menuConf.uploadVideo = getVideoUploadConfig(
      props.uploadConfig.video,
      uploadCallbacks
    )
  }
  
  // 链接配置
  menuConf.insertLink = {
    checkLink: validateLink,
    parseLinkUrl: parseLinkUrl
  }
  menuConf.editLink = {
    checkLink: validateLink,
    parseLinkUrl: parseLinkUrl
  }
  
  // 图片配置
  menuConf.insertImage = {
    checkImage: validateImageSrc,
    parseImageSrc: parseImageSrc
  }
  menuConf.editImage = {
    checkImage: validateImageSrc,
    parseImageSrc: parseImageSrc
  }
  
  // 视频配置
  menuConf.insertVideo = {
    checkVideo: validateVideoSrc,
    parseVideoSrc: parseVideoSrc
  }
  
  // 合并菜单配置
  config.MENU_CONF = deepMerge(config.MENU_CONF || {}, menuConf)
  
  // Hoverbar 配置
  if (props.hoverbarKeys) {
    config.hoverbarKeys = props.hoverbarKeys
  }
  
  // 最大长度配置
  if (props.maxLength) {
    config.maxLength = props.maxLength
  }
  
  return config
})

// ==================== 方法 ====================
// 编辑器创建完成
const handleCreated = (editor) => {
  editorRef.value = editor
  isCreated.value = true
  
  // 设置禁用状态
  if (props.disabled || props.readOnly) {
    editor.disable()
  }
  
  emit('created', editor)
}

// 内容变化（防抖）
const debouncedEmitChange = debounce((editor) => {
  const html = cleanEmptyHtml(valueHtml.value)
  emit('update:modelValue', html)
  emit('change', editor)
}, props.debounceTime)

const handleChange = (editor) => {
  debouncedEmitChange(editor)
}

// 聚焦
const handleFocus = (editor) => {
  emit('focus', editor)
}

// 失焦
const handleBlur = (editor) => {
  emit('blur', editor)
}

// 销毁
const handleDestroyed = (editor) => {
  emit('destroyed', editor)
}

// 达到最大长度
const handleMaxLength = (editor) => {
  emit('maxLength', editor)
}

// 自定义 Alert
const handleCustomAlert = (info, type) => {
  if (props.customAlert) {
    props.customAlert(info, type)
  }
}

// 自定义粘贴
const handleCustomPaste = (editor, event, callback) => {
  if (props.customPaste) {
    return props.customPaste(editor, event, callback)
  }
  return true
}

// ==================== 监听 ====================
// 监听 modelValue 变化（外部修改）
watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal || ''
  }
})

// 监听禁用状态
watch(() => props.disabled, (newVal) => {
  const editor = editorRef.value
  if (!editor) return
  
  if (newVal) {
    editor.disable()
  } else if (!props.readOnly) {
    editor.enable()
  }
})

// 监听只读状态
watch(() => props.readOnly, (newVal) => {
  const editor = editorRef.value
  if (!editor) return
  
  if (newVal) {
    editor.disable()
  } else if (!props.disabled) {
    editor.enable()
  }
})

// ==================== 生命周期 ====================
// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
    editorRef.value = null
  }
})

// ==================== 暴露方法 ====================
defineExpose({
  // 获取编辑器实例
  getEditor: () => editorRef.value,
  
  // 内容操作
  getHtml: () => editorRef.value?.getHtml() || '',
  getText: () => editorRef.value?.getText() || '',
  setHtml: (html) => {
    if (editorRef.value) {
      editorRef.value.setHtml(html)
    }
  },
  clear: () => {
    if (editorRef.value) {
      editorRef.value.clear()
    }
  },
  isEmpty: () => editorRef.value?.isEmpty() || true,
  
  // 插入操作
  insertText: (text) => {
    if (editorRef.value) {
      editorRef.value.insertText(text)
    }
  },
  insertHtml: (html) => {
    if (editorRef.value) {
      editorRef.value.dangerouslyInsertHtml(html)
    }
  },
  insertNode: (node) => {
    if (editorRef.value) {
      editorRef.value.insertNode(node)
    }
  },
  
  // 选区操作
  focus: (toEnd = false) => {
    if (editorRef.value) {
      editorRef.value.focus(toEnd)
    }
  },
  blur: () => {
    if (editorRef.value) {
      editorRef.value.blur()
    }
  },
  selectAll: () => {
    if (editorRef.value) {
      editorRef.value.selectAll()
    }
  },
  
  // 状态控制
  enable: () => {
    if (editorRef.value) {
      editorRef.value.enable()
    }
  },
  disable: () => {
    if (editorRef.value) {
      editorRef.value.disable()
    }
  },
  isDisabled: () => editorRef.value?.isDisabled() || false,
  
  // 历史操作
  undo: () => {
    if (editorRef.value) {
      editorRef.value.undo()
    }
  },
  redo: () => {
    if (editorRef.value) {
      editorRef.value.redo()
    }
  },
  
  // 全屏操作
  fullScreen: () => {
    if (editorRef.value) {
      editorRef.value.fullScreen()
    }
  },
  unFullScreen: () => {
    if (editorRef.value) {
      editorRef.value.unFullScreen()
    }
  },
  isFullScreen: () => editorRef.value?.isFullScreen || false,
  
  // 其他
  destroy: () => {
    if (editorRef.value) {
      editorRef.value.destroy()
      editorRef.value = null
    }
  },
  getConfig: () => editorRef.value?.getConfig() || {},
  getAllMenuKeys: () => editorRef.value?.getAllMenuKeys() || []
})
</script>

<style scoped lang="scss">
.wang-editor-wrapper {
  border: 1px solid #bbb;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

// 全局主题变量（不使用 scoped）
</style>

<style lang="scss">
// 明亮主题（默认）
:root {
  --w-e-textarea-bg-color: #fff;
  --w-e-textarea-color: #333;
  --w-e-textarea-border-color: #ccc;
  --w-e-textarea-slight-border-color: #e8e8e8;
  --w-e-textarea-slight-color: #d4d4d4;
  --w-e-textarea-slight-bg-color: #f5f7fa;
  --w-e-textarea-selected-border-color: #B4D5FF;
  --w-e-toolbar-color: #595959;
  --w-e-toolbar-bg-color: #fff;
  --w-e-toolbar-active-color: #333;
  --w-e-toolbar-active-bg-color: #f1f1f1;
  --w-e-toolbar-disabled-color: #999;
  --w-e-toolbar-border-color: #e8e8e8;
  --w-e-dropdown-bg-color: #fff;
  --w-e-dropdown-border-color: #e8e8e8;
  --w-e-dropdown-color: #333;
  --w-e-dropdown-hover-bg-color: #f1f1f1;
  --w-e-dropdown-hover-color: #333;
  --w-e-modal-button-bg-color: #fafafa;
  --w-e-modal-button-border-color: #d9d9d9;
}

// 暗黑主题
html[theme-mode="dark"],
html.dark {
  --w-e-textarea-bg-color: #1f1f1f;
  --w-e-textarea-color: #d4d4d4;
  --w-e-textarea-border-color: #434343;
  --w-e-textarea-slight-border-color: #2d2d2d;
  --w-e-textarea-slight-color: #595959;
  --w-e-textarea-slight-bg-color: #262626;
  --w-e-textarea-selected-border-color: #0e639c;
  --w-e-toolbar-color: #d4d4d4;
  --w-e-toolbar-bg-color: #1f1f1f;
  --w-e-toolbar-active-color: #fff;
  --w-e-toolbar-active-bg-color: #2d2d2d;
  --w-e-toolbar-disabled-color: #595959;
  --w-e-toolbar-border-color: #434343;
  --w-e-dropdown-bg-color: #1f1f1f;
  --w-e-dropdown-border-color: #434343;
  --w-e-dropdown-color: #d4d4d4;
  --w-e-dropdown-hover-bg-color: #2d2d2d;
  --w-e-dropdown-hover-color: #fff;
  --w-e-modal-button-bg-color: #262626;
  --w-e-modal-button-border-color: #434343;
}
</style>
