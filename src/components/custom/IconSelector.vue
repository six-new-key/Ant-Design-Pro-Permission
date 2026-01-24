<template>
  <a-modal
    :open="visible"
    title="选择图标"
    width="900px"
    centered
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <template #footer>
      <a-space>
        <a-button @click="handleClear">清空选择</a-button>
        <a-button type="primary" @click="handleConfirm" :disabled="!selectedIcon">确定</a-button>
      </a-space>
    </template>
    <div :style="cssVars" class="icon-selector">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-input
          :value="searchKeyword"
          placeholder="搜索图标名称..."
          allow-clear
          @update:value="searchKeyword = $event"
          @input="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <a-radio-group :value="activeCategory" button-style="solid" @update:value="activeCategory = $event" @change="handleCategoryChange">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="direction">方向</a-radio-button>
          <a-radio-button value="suggestion">提示</a-radio-button>
          <a-radio-button value="edit">编辑</a-radio-button>
          <a-radio-button value="data">数据</a-radio-button>
          <a-radio-button value="other">其他</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 图标列表 - 使用分页优化性能 -->
      <div class="icon-list" v-if="paginatedIcons.length > 0">
        <div
          v-for="iconName in paginatedIcons"
          :key="iconName"
          :class="['icon-item', { active: selectedIcon === iconName }]"
          @click="handleSelectIcon(iconName)"
        >
          <component :is="iconName" class="icon" />
          <div class="icon-name">{{ iconName }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <a-empty v-else description="未找到匹配的图标" />

      <!-- 分页 - 只在图标数量大于单页数量时显示 -->
      <div class="pagination" v-if="filteredIcons.length > pageSize">
        <a-pagination
          v-model:current="currentPage"
          :total="filteredIcons.length"
          :pageSize="pageSize"
          :show-size-changer="false"
          :show-total="total => `共 ${total} 个图标`"
          size="small"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { theme } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import * as AntdIcons from '@ant-design/icons-vue'

const { useToken } = theme
const { token } = useToken()

// 定义组件名称
defineOptions({
  name: 'IconSelector'
})

// 定义 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  value: {
    type: String,
    default: ''
  }
})

// 定义 emits
const emit = defineEmits(['update:visible', 'update:value', 'change'])

// 响应式数据
const searchKeyword = ref('')
const activeCategory = ref('all')
const selectedIcon = ref(props.value)
const currentPage = ref(1)
const pageSize = ref(40) // 每页显示40个图标

// 计算属性 - CSS 变量
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border': t.colorBorder,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--color-bg-container': t.colorBgContainer,
    '--color-primary-bg': t.colorPrimaryBg,
    '--color-primary-border': t.colorPrimaryBorder
  }
})

// 获取所有 Ant Design 图标
const allIcons = Object.keys(AntdIcons).filter(key => 
  (key.endsWith('Outlined') || key.endsWith('Filled') || key.endsWith('TwoTone')) &&
  key !== 'createFromIconfontCN' &&
  key !== 'default'
)

// 图标分类
const iconCategories = {
  direction: [
    'StepBackwardOutlined', 'StepForwardOutlined', 'FastBackwardOutlined', 'FastForwardOutlined',
    'ShrinkOutlined', 'ArrowsAltOutlined', 'DownOutlined', 'UpOutlined', 'LeftOutlined', 'RightOutlined',
    'CaretUpOutlined', 'CaretDownOutlined', 'CaretLeftOutlined', 'CaretRightOutlined',
    'UpCircleOutlined', 'DownCircleOutlined', 'LeftCircleOutlined', 'RightCircleOutlined',
    'DoubleRightOutlined', 'DoubleLeftOutlined', 'VerticalLeftOutlined', 'VerticalRightOutlined',
    'VerticalAlignTopOutlined', 'VerticalAlignMiddleOutlined', 'VerticalAlignBottomOutlined',
    'ForwardOutlined', 'BackwardOutlined', 'RollbackOutlined', 'EnterOutlined', 'RetweetOutlined',
    'SwapOutlined', 'SwapLeftOutlined', 'SwapRightOutlined', 'ArrowUpOutlined', 'ArrowDownOutlined',
    'ArrowLeftOutlined', 'ArrowRightOutlined', 'PlayCircleOutlined', 'UpSquareOutlined',
    'DownSquareOutlined', 'LeftSquareOutlined', 'RightSquareOutlined', 'LoginOutlined', 'LogoutOutlined',
    'MenuFoldOutlined', 'MenuUnfoldOutlined', 'BorderBottomOutlined', 'BorderHorizontalOutlined',
    'BorderInnerOutlined', 'BorderOuterOutlined', 'BorderLeftOutlined', 'BorderRightOutlined',
    'BorderTopOutlined', 'BorderVerticleOutlined', 'PicCenterOutlined', 'PicLeftOutlined', 'PicRightOutlined',
    'RadiusBottomleftOutlined', 'RadiusBottomrightOutlined', 'RadiusUpleftOutlined', 'RadiusUprightOutlined',
    'FullscreenOutlined', 'FullscreenExitOutlined'
  ],
  suggestion: [
    'QuestionOutlined', 'QuestionCircleOutlined', 'PlusOutlined', 'PlusCircleOutlined', 'PauseOutlined',
    'PauseCircleOutlined', 'MinusOutlined', 'MinusCircleOutlined', 'PlusSquareOutlined', 'MinusSquareOutlined',
    'InfoOutlined', 'InfoCircleOutlined', 'ExclamationOutlined', 'ExclamationCircleOutlined',
    'CloseOutlined', 'CloseCircleOutlined', 'CloseSquareOutlined', 'CheckOutlined', 'CheckCircleOutlined',
    'CheckSquareOutlined', 'ClockCircleOutlined', 'WarningOutlined', 'IssuesCloseOutlined',
    'StopOutlined'
  ],
  edit: [
    'EditOutlined', 'FormOutlined', 'CopyOutlined', 'ScissorOutlined', 'DeleteOutlined',
    'SnippetsOutlined', 'DiffOutlined', 'HighlightOutlined', 'AlignCenterOutlined', 'AlignLeftOutlined',
    'AlignRightOutlined', 'BgColorsOutlined', 'BoldOutlined', 'ItalicOutlined', 'UnderlineOutlined',
    'StrikethroughOutlined', 'RedoOutlined', 'UndoOutlined', 'ZoomInOutlined', 'ZoomOutOutlined',
    'FontColorsOutlined', 'FontSizeOutlined', 'LineHeightOutlined', 'DashOutlined', 'SmallDashOutlined',
    'SortAscendingOutlined', 'SortDescendingOutlined', 'DragOutlined', 'OrderedListOutlined',
    'UnorderedListOutlined', 'RadiusSettingOutlined', 'ColumnWidthOutlined', 'ColumnHeightOutlined'
  ],
  data: [
    'AreaChartOutlined', 'PieChartOutlined', 'BarChartOutlined', 'DotChartOutlined', 'LineChartOutlined',
    'RadarChartOutlined', 'HeatMapOutlined', 'FallOutlined', 'RiseOutlined', 'StockOutlined',
    'BoxPlotOutlined', 'FundOutlined', 'SlidersOutlined'
  ],
  other: [] // 其他分类，包含未分类的图标
}

// 计算属性 - 过滤后的图标列表
const filteredIcons = computed(() => {
  let icons = allIcons

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    const categoryIcons = iconCategories[activeCategory.value]
    if (categoryIcons && categoryIcons.length > 0) {
      icons = icons.filter(icon => categoryIcons.includes(icon))
    } else {
      // 其他分类：排除已分类的图标
      const categorizedIcons = Object.values(iconCategories)
        .flat()
        .filter(icon => icon !== undefined)
      icons = icons.filter(icon => !categorizedIcons.includes(icon))
    }
  }

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    icons = icons.filter(icon => icon.toLowerCase().includes(keyword))
  }

  return icons
})

// 计算属性 - 分页后的图标列表
const paginatedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIcons.value.slice(start, end)
})

// 监听 props.value 变化
watch(() => props.value, (newVal) => {
  selectedIcon.value = newVal
})

// 监听 props.visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedIcon.value = props.value
    searchKeyword.value = ''
    activeCategory.value = 'all'
    currentPage.value = 1 // 重置分页
  }
})

// 监听过滤条件变化，重置分页
watch([searchKeyword, activeCategory], () => {
  currentPage.value = 1
})

// 方法
const handleSearch = () => {
  // 搜索时自动切换到全部分类
  if (searchKeyword.value) {
    activeCategory.value = 'all'
  }
}

const handleCategoryChange = () => {
  // 切换分类时清空搜索
  searchKeyword.value = ''
}

const handleSelectIcon = (iconName) => {
  selectedIcon.value = iconName
}

const handleConfirm = () => {
  emit('update:value', selectedIcon.value)
  emit('change', selectedIcon.value)
  emit('update:visible', false)
}

const handleClear = () => {
  selectedIcon.value = ''
  emit('update:value', '')
  emit('change', '')
  emit('update:visible', false)
}

const handleCancel = () => {
  // 点击遮罩层或X按钮时，恢复原值（不保存修改）
  selectedIcon.value = props.value
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.icon-selector {
  .search-bar {
    margin-bottom: 16px;
  }

  .category-tabs {
    margin-bottom: 16px;
    
    :deep(.ant-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    max-height: 450px;
    overflow-y: auto;
    padding: 8px;
    background: var(--color-fill-alter);
    border-radius: var(--border-radius);
    margin-bottom: 16px;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border-secondary);
      border-radius: 3px;

      &:hover {
        background: var(--color-border);
      }
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      background: var(--color-bg-container);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      &.active {
        background: var(--color-primary-bg);
        border-color: var(--color-primary-border);
        
        .icon {
          color: var(--color-primary);
        }
        
        .icon-name {
          color: var(--color-primary);
        }
      }

      .icon {
        font-size: 24px;
        color: var(--color-text);
        margin-bottom: 8px;
        transition: all 0.3s;
      }

      .icon-name {
        font-size: 12px;
        color: var(--color-text);
        text-align: center;
        word-break: break-all;
        line-height: 1.4;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: all 0.3s;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }
}
</style>
