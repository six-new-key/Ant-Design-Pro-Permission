<template>
  <!-- 搜索对话框 -->
  <a-modal
    v-model:open="visible"
    :footer="null"
    :width="600"
    @cancel="handleClose"
    title="搜索页面"
    :maskClosable="themeStore.baseConfig.maskMode"
  >

    <!-- 搜索输入框 -->
    <a-input
      ref="searchInputRef"
      v-model:value="searchQuery"
      placeholder="搜索全局页面"
      :bordered="false"
      @input="handleSearchInput"
      @keydown="handleKeydown"
      size="large"
      class="search-input"
      :style="{ background: token.colorFillSecondary, padding: '12px' }"
    >
      <template #prefix>
        <SearchOutlined
          :style="{
            fontSize: token.fontSize + 2 + 'px',
            opacity: 0.8,
            marginRight: '6px',
          }"
        />
      </template>
      <template #suffix>
        <div
          :style="{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius + 'px',
            padding: '0 10px',
          }"
        >
          <EnterOutlined
            :style="{ fontSize: token.fontSize - 2 + 'px', opacity: 0.8 }"
          />
        </div>
      </template>
    </a-input>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searchResults.length > 0">
      <div
        v-for="(item, index) in searchResults"
        :key="item.path"
        class="search-result-item"
        :style="{
          background:
            selectedIndex === index
              ? token.colorPrimary
              : token.colorFillTertiary,
          borderRadius: token.borderRadius + 'px',
          color: selectedIndex === index ? '#fff' : '',
        }"
        @click="navigateToItem(item)"
        @mouseenter="selectedIndex = index"
      >
        <div class="result-icon">
          <component :is="item.icon" v-if="item.icon" />
          <FileOutlined v-else />
        </div>
        <div class="result-content">
          <div
            class="result-title"
            v-html="highlightText(item.title, searchQuery)"
          ></div>
          <div
            :style="{
              fontSize: token.fontSize - 2 + 'px',
              color: token.colorTextTertiary,
            }"
          >
            {{ item.path }}
          </div>
        </div>
        <div class="result-action">
          <EnterOutlined :style="{ fontSize: token.fontSize - 2 + 'px' }" />
        </div>
      </div>
    </div>

    <!-- 未输入搜索关键字提示 -->
    <div v-else-if="!searchQuery.trim()" class="wait-search">
      <FileSearchOutlined
        :style="{ fontSize: token.fontSize + 20 + 'px', marginBottom: '10px' }"
      />
      <div>输入'页面'关键字开始搜索吧</div>
    </div>

    <!-- 无结果提示 -->
    <div
      class="no-results"
      v-else-if="searchQuery.trim() && searchResults.length === 0"
    >
      <FileSearchOutlined
        :style="{ fontSize: token.fontSize + 20 + 'px', marginBottom: '10px' }"
      />
      <div class="no-results-text">未找到相关结果</div>
    </div>

    <!-- 底部操作提示 -->
    <div
      class="search-footer"
      :style="{ borderTop: '1px solid ' + token.colorBorder }"
    >
      <div class="footer-item">
        <div
          :style="{
            background: token.colorFillSecondary,
            borderRadius: token.borderRadius + 'px',
            padding: '0 10px',
            marginRight: '8px',
          }"
        >
          <EnterOutlined :style="{ fontSize: token.fontSize - 2 + 'px' }" />
        </div>
        <span>选择</span>
      </div>
      <a-divider
        type="vertical"
        :style="{
          background: token.colorBorder,
          height: '16px',
          margin: '0 20px',
          marginTop: '3px',
        }"
      />
      <div class="footer-item">
        <div
          :style="{
            background: token.colorFillSecondary,
            borderRadius: token.borderRadius + 'px',
            padding: '0 10px',
            marginRight: '8px',
          }"
        >
          <ArrowUpOutlined :style="{ fontSize: token.fontSize - 2 + 'px' }" />
        </div>
        <div
          :style="{
            background: token.colorFillSecondary,
            borderRadius: token.borderRadius + 'px',
            padding: '0 10px',
            marginRight: '8px',
          }"
        >
          <ArrowDownOutlined :style="{ fontSize: token.fontSize - 2 + 'px' }" />
        </div>
        <span>切换</span>
      </div>
      <a-divider
        type="vertical"
        :style="{
          background: token.colorBorder,
          height: '16px',
          margin: '0 20px',
          marginTop: '3px',
        }"
      />
      <div class="footer-item">
        <div
          :style="{
            background: token.colorFillSecondary,
            borderRadius: token.borderRadius + 'px',
            padding: '0 8px',
            marginRight: '8px',
          }"
        >
          <!-- <EnterOutlined :style="{ fontSize: token.fontSize - 2 + 'px' }" /> -->
          <span
            :style="{ fontSize: token.fontSize - 4 + 'px', fontWeight: 'bold' }"
            >ESC</span
          >
        </div>
        <span>退出</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  SearchOutlined,
  FileOutlined,
  EnterOutlined,
} from "@ant-design/icons-vue";
import { message } from "@/utils";
import { getAllMenuItems, searchMenuItems, highlightText } from "@/utils";
import { theme } from "ant-design-vue";
import {  useThemeStore } from "@/stores";

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const themeStore = useThemeStore();

const { token } = theme.useToken();
// Emits
const emit = defineEmits(["update:modelValue"]);

// Router
const router = useRouter();

// 响应式数据
const searchQuery = ref("");
const searchResults = ref([]);
const selectedIndex = ref(0);
const searchInputRef = ref(null);
const menuItems = ref([]);

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 初始化菜单数据
onMounted(() => {
  menuItems.value = getAllMenuItems();
});

// 监听对话框打开状态
watch(visible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    // 关闭时重置状态
    searchQuery.value = "";
    searchResults.value = [];
    selectedIndex.value = 0;
  }
});

// 关闭对话框
const handleClose = () => {
  visible.value = false;
};

// 处理搜索输入
const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = searchMenuItems(searchQuery.value, menuItems.value);
    selectedIndex.value = 0;
  } else {
    searchResults.value = [];
  }
};

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      searchResults.value.length - 1
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (searchResults.value[selectedIndex.value]) {
      navigateToItem(searchResults.value[selectedIndex.value]);
    }
  } else if (e.key === "Escape") {
    handleClose();
  }
};

// 导航到选中项
const navigateToItem = (item) => {
  router.push(item.path);
  handleClose();
  message.success(`导航到: ${item.title}`);
};
</script>

<style scoped lang="scss">
.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 0;

  .search-result-item {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    .result-icon {
      margin-right: 12px;
      display: flex;
      justify-content: center;
      opacity: 0.8;
    }

    .result-content {
      flex: 1;

      .result-title {
        margin-bottom: 2px;
      }
    }

    .result-action {
      opacity: 0.8;
      font-size: 12px;
    }
  }
}

.wait-search {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
}

.no-results {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
}

.search-footer {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  opacity: 0.8;

  .footer-item {
    display: flex;
    align-items: center;
  }
}
</style>
