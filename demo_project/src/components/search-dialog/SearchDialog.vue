<template>
  <!-- 搜索对话框 -->
  <t-dialog v-model:visible="visible" width="550px" :footer="false" @close="handleClose">
    <template #header>
      <div class="search-input-wrapper">
        <t-icon name="search" size="small" />
        <input ref="searchInputRef" v-model="searchValue" placeholder="搜索导航菜单" class="search-input"
          @keydown.esc="handleClose" />
      </div>
    </template>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searchResults.length > 0">
      <div class="search-result-item" v-for="item in searchResults" :key="item.name"
        @click="navigateToSearchResult(item)">
        <t-icon :name="item.icon" class="result-icon" />
        <span class="result-text">{{ item.title }}</span>
      </div>
    </div>
    <div class="no-results" v-else-if="searchValue && searchResults.length === 0">
      <p>暂无搜索结果</p>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'

const router = useRouter()
const appStore = useAppStore()

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// 搜索相关
const searchValue = ref('')
const searchResults = ref([])
const searchInputRef = ref(null)

// 计算属性：对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 打开搜索对话框时的处理
const handleOpen = () => {
  // 确保菜单数据已初始化
  if (appStore.menuItems.length === 0) {
    appStore.initMenuItems()
  }
  // 自动对焦到搜索输入框
  setTimeout(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  }, 100)
}

// 关闭搜索对话框
const handleClose = () => {
  visible.value = false
  searchValue.value = ''
  searchResults.value = []
}

// 搜索功能 - 实时搜索
const performSearch = () => {
  if (searchValue.value.trim()) {
    searchResults.value = appStore.searchMenuItems(searchValue.value)
  } else {
    searchResults.value = []
  }
}

// 导航到搜索结果
const navigateToSearchResult = (item) => {
  router.push(item.path)
  handleClose()
}

// 监听搜索输入变化
watch(searchValue, () => {
  performSearch()
})

// 监听对话框打开状态
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    handleOpen()
  }
})

// 键盘快捷键处理
const handleGlobalKeydown = (event) => {
  // Ctrl + K 打开搜索
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    visible.value = true
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// 暴露打开方法给父组件
defineExpose({
  open: () => {
    visible.value = true
    handleOpen()
  }
})
</script>

<style scoped>
/* 搜索输入框区域 */
.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--td-bg-color-container);
  width: 97%;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--td-text-color-primary);
  line-height: 1.5;
  font-size: 15px;
}

.search-input::placeholder {
  color: var(--td-text-color-placeholder);
}

/* 搜索结果区域 */
.search-results {
  padding: 8px 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--td-brand-color-light);
  margin-bottom: 10px;
  border-radius: 6px;
}

.search-result-item:hover {
  background: var(--td-brand-color-focus);
  transform: translateY(-1px);
}

.search-result-item:focus {
  outline: none;
  background: var(--td-brand-color-focus);
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px var(--td-brand-color);
}

.search-result-item:active {
  transform: translateY(0);
  background: var(--td-brand-color);
}

.result-icon {
  color: var(--td-brand-color);
  font-size: 16px;
  margin-right: 12px;
}

.result-text {
  flex: 1;
  color: var(--td-brand-color);
  font-size: 14px;
  font-weight: 500;
}

.no-results {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}
</style>