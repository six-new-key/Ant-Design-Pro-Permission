<template>
  <a-drawer :open="visible" :closable="false" :title="null" @update:open="$emit('update:visible', $event)"
    placement="right" :width="360" :maskClosable="currentMaskMode">
    <!--  头部  -->
    <div style="display: flex; align-items: center; justify-content: space-between">
      <div :style="{
        fontSize: token.fontSize + 2 + 'px',
        fontWeight: 'bold',
        color: titleColor,
      }">
        系统配置
      </div>
      <a-button shape="circle" type="text">
        <template #icon>
          <CloseOutlined @click="handleClose" style="opacity: 0.6" />
        </template>
      </a-button>
    </div>

    <!-- 布局风格 -->
    <div class="section">
      <a-divider>布局</a-divider>

      <div class="layout-grid">
        <div v-for="config in availableLayoutConfigs" :key="config.key" class="layout-card" :style="{
          border: currentLayout === config.key ? cardBorderColor : '',
          borderRadius: token.borderRadius + 'px',
        }" @click="handleLayoutSwitch(config.key)">
          <a-tooltip :title="config.name">
            <div class="preview-container" :style="{ borderRadius: token.borderRadius + 'px' }">
              <!-- 根据布局类型显示不同的预览图 -->
              <div v-if="config.key === 'sidebar'" class="preview-sidebar">
                <div class="sidebar"></div>
                <div class="content"></div>
              </div>
              <div v-else-if="config.key === 'topbar'" class="preview-topbar">
                <div class="topbar"></div>
                <div class="content"></div>
              </div>
              <div v-else-if="config.key === 'mixed'" class="preview-mixed">
                <div class="topbar"></div>
                <div class="main">
                  <div class="sidebar"></div>
                  <div class="content"></div>
                </div>
              </div>
              <div v-else-if="config.key === 'doublecolumn'" class="preview-doublecolumn">
                <div class="first-column"></div>
                <div class="second-column"></div>
                <div class="content"></div>
              </div>
              <div v-else-if="config.key === 'fullscreen'" class="preview-fullscreen">
                <div class="fullscreen-content">
                  <div class="floating-actions-preview">
                    <div class="floating-btn-preview"></div>
                    <div class="floating-btn-preview"></div>
                    <div class="floating-btn-preview"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="currentLayout === config.key" class="active-badge" :style="{ background: token.colorPrimary }">
              <CheckOutlined />
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>

    <!-- 主题模式切换 -->
    <div class="section">
      <a-divider>模式</a-divider>

      <div class="theme-mode-grid">
        <a-tooltip title="明亮模式">
          <div :style="{
            border: currentThemeMode === 'light' ? cardBorderColor : '',
            borderRadius: token.borderRadius + 'px',
          }" class="theme-mode-card" @click="handleThemeModeSwitch('light')">
            <div class="theme-mode-preview light-preview" :style="{ borderRadius: token.borderRadius + 'px' }">
              <div class="preview-header"></div>
              <div class="preview-body"></div>
            </div>
            <div v-if="currentThemeMode === 'light'" class="active-badge" :style="{ background: token.colorPrimary }">
              <CheckOutlined />
            </div>
          </div>
        </a-tooltip>

        <a-tooltip title="暗黑模式">
          <div :style="{
            border: currentThemeMode === 'dark' ? cardBorderColor : '',
            borderRadius: token.borderRadius + 'px',
          }" class="theme-mode-card" @click="handleThemeModeSwitch('dark')">
            <div class="theme-mode-preview dark-preview" :style="{ borderRadius: token.borderRadius + 'px' }">
              <div class="preview-header"></div>
              <div class="preview-body"></div>
            </div>
            <div v-if="currentThemeMode === 'dark'" class="active-badge" :style="{ background: token.colorPrimary }">
              <CheckOutlined />
            </div>
          </div>
        </a-tooltip>
      </div>
    </div>

    <!-- 侧边栏/顶栏主题切换 -->
    <div class="section">
      <a-divider>侧边栏/顶栏</a-divider>

      <div class="theme-switch-list">
        <div class="theme-switch-item">
          <div class="theme-switch-info">
            <h4 class="theme-switch-name" :style="{ color: titleColor }">
              深色侧边栏
            </h4>
          </div>
          <a-switch :checked="currentSidebarTheme === 'dark'" :disabled="currentLayout === 'topbar'" @change="
            (checked) => handleSidebarThemeSwitch(checked ? 'dark' : 'light')
          " />
        </div>

        <div class="theme-switch-item">
          <div class="theme-switch-info">
            <h4 class="theme-switch-name" :style="{ color: titleColor }">
              深色顶栏
            </h4>
          </div>
          <a-switch :checked="currentHeaderTheme === 'dark'" :disabled="currentLayout === 'sidebar' || currentLayout === 'doublecolumn'
            " @change="
              (checked) => handleHeaderThemeSwitch(checked ? 'dark' : 'light')
            " />
        </div>
      </div>
    </div>

    <!-- 自定义系统主题色 -->
    <div class="setting-section">
      <a-divider>主题</a-divider>

      <!-- 预设主题色 -->
      <div class="theme-colors">
        <a-tooltip v-for="(preset, index) in themeStore.colorPresets" :key="index" :title="preset.name">
          <div class="color-item" :class="{
            active:
              themeStore.selectedPresetIndex === index &&
              themeStore.colorMode === 'preset',
          }" :style="{ backgroundColor: preset.color }" @click="handlePresetColorSelect(index)" :title="preset.name">
            <CheckOutlined v-if="
              themeStore.selectedPresetIndex === index &&
              themeStore.colorMode === 'preset'
            " class="check-icon" />
          </div>
        </a-tooltip>

        <!-- 自定义颜色选择器 -->
        <a-tooltip title="自定义" placement="left">
          <div class="custom-color-container" @click="handleCustomColorClick">
            <color-picker v-model:pureColor="customColor" @pureColorChange="handleCustomColorChange"
              :theme="appStore.themeMode === 'dark' ? 'black' : 'white'" />
            <CheckOutlined v-if="themeStore.colorMode === 'custom'" :style="{ color: token.colorPrimary }"
              class="check-icon" />
          </div>
        </a-tooltip>
      </div>
    </div>

    <!-- 基础配置 -->
    <div class="section">
      <a-divider>基础</a-divider>

      <div class="base-config-list">
        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">页面动画</h4>
          </div>
          <a-select v-model:value="appStore.currentPageAnimation" style="width: 100px" @change="handleAnimationChange">
            <a-select-option v-for="animation in pageAnimations" :key="animation.value" :value="animation.value">{{
              animation.label }}</a-select-option>
          </a-select>
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">文字</h4>
          </div>
          <a-input-number v-model:value="currentFontSize" :min="14" :max="18" :step="1" @change="handleFontSizeChange"
            style="width: 100px" />
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">圆角</h4>
          </div>
          <a-input-number v-model:value="currentBorderRadius" :min="1" :max="16" :step="1"
            @change="handleBorderRadiusChange" style="width: 100px" />
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">页签</h4>
          </div>
          <a-switch v-model:checked="currentTabsShow" @change="handleTabsShowChange" />
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">线宽风格</h4>
          </div>
          <a-switch v-model:checked="currentWireframe" @change="handleWireframeChange" />
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">页签阴影</h4>
          </div>
          <a-switch v-model:checked="currentTabShadow" @change="handleTabShadowChange" />
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4 class="config-name" :style="{ color: titleColor }">
              点击蒙层关闭
            </h4>
          </div>
          <a-switch v-model:checked="currentMaskMode" @change="handleMaskModeChange" />
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, ref, h } from "vue";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { useAppStore, useThemeStore } from "@/stores";
import { PAGE_ANIMATION_CONFIG } from "@/utils";
import { theme } from "ant-design-vue";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  availableLayoutConfigs: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["update:visible", "layout-switch"]);

const appStore = useAppStore();
const themeStore = useThemeStore();
const { token } = theme.useToken();

const titleColor = computed(() => {
  return appStore.themeMode === "dark" ? "#ffffff" : "#000000";
});

const cardBorderColor = computed(() => {
  return "1px solid " + token.value.colorPrimary;
});

// 自定义颜色响应式变量
const customColor = ref(themeStore.primaryColorHex);

// 基础配置响应式变量
const currentFontSize = ref(themeStore.baseConfig.fontSize);
const currentBorderRadius = ref(themeStore.baseConfig.borderRadius);
const currentWireframe = ref(themeStore.baseConfig.wireframe);
const currentTabShadow = ref(themeStore.baseConfig.tabShadow);
const currentMaskMode = ref(themeStore.baseConfig.maskMode);
const currentTabsShow = ref(appStore.tabsShow);

// 当前布局
const currentLayout = computed(() => appStore.layout);

// 页面动画效果选项 - 使用统一配置
const pageAnimations = PAGE_ANIMATION_CONFIG.options;

// 当前主题模式
const currentThemeMode = computed(() => appStore.themeMode || "light");

// 当前侧边栏主题
const currentSidebarTheme = computed(() => appStore.sidebarTheme || "light");

// 当前顶部主题
const currentHeaderTheme = computed(() => appStore.headerTheme || "light");

// 处理抽屉关闭
const handleClose = () => {
  emit("update:visible", false);
};

// 处理布局切换
const handleLayoutSwitch = (layoutKey) => {
  // 直接在子组件中处理布局切换
  appStore.setLayout(layoutKey);

  // 触发父组件的布局切换事件（用于显示加载状态）
  emit("layout-switch", layoutKey);

  handleClose()
};

// 处理主题模式切换
const handleThemeModeSwitch = (mode) => {
  appStore.setThemeMode(mode);
  
  handleClose()
};

// 处理侧边栏主题切换
const handleSidebarThemeSwitch = (theme) => {
  appStore.setSidebarTheme(theme);
};

// 处理顶部主题切换
const handleHeaderThemeSwitch = (theme) => {
  appStore.setHeaderTheme(theme);
};

// 处理预设主题色选择
const handlePresetColorSelect = (index) => {
  themeStore.selectPresetColor(index);
};

// 处理自定义颜色点击
const handleCustomColorClick = () => {
  // 点击时设置为自定义模式
  if (themeStore.colorMode !== "custom") {
    themeStore.setPrimaryColor(customColor.value, "custom");
  }
};

// 处理自定义颜色变化
const handleCustomColorChange = (color) => {
  customColor.value = color;
  themeStore.setCustomColor(color);
};

// 处理基础配置变化
const handleFontSizeChange = (value) => {
  if (value !== null && value !== undefined) {
    themeStore.setFontSize(value);
  }
};

const handleBorderRadiusChange = (value) => {
  if (value !== null && value !== undefined) {
    themeStore.setBorderRadius(value);
  }
};

// 处理页签显示切换
const handleTabsShowChange = (checked) => {
  appStore.setTabsShow(checked);
};

const handleWireframeChange = (checked) => {
  themeStore.setWireframe(checked);
};

// 处理页签阴影效果切换
const handleTabShadowChange = (checked) => {
  themeStore.setTabShadow(checked);
};

// 处理动画效果切换
const handleAnimationChange = (value) => {
  appStore.setPageAnimation(value);
};

const handleMaskModeChange = (checked) => {
  themeStore.setMaskMode(checked);
};
</script>

<style scoped lang="scss">
.section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 16px;
  }
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.layout-card {
  cursor: pointer;
  position: relative;
}

.preview-container {
  width: 100%;
  height: 64px;
  overflow: hidden;
  position: relative;
}

/* 侧边栏布局预览 */
.preview-sidebar {
  display: flex;
  height: 100%;
  background: #eee;

  .sidebar {
    width: 22px;
    background: #ccc;
  }

  .content {
    flex: 1;
    margin: 6px;
    border-radius: 4px;
    background: #ddd;
  }
}

/* 顶部导航布局预览 */
.preview-topbar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #eee;

  .topbar {
    height: 14px;
    background: #ccc;
    position: relative;
  }

  .content {
    flex: 1;
    background: #ddd;
    margin: 6px;
    border-radius: 4px;
    position: relative;
  }
}

/* 混合布局预览 */
.preview-mixed {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #eee;

  .topbar {
    height: 12px;
    background: #ccc;
  }

  .main {
    display: flex;
    flex: 1;

    .sidebar {
      width: 18px;
      background: #ddd;
    }

    .content {
      flex: 1;
      background: #ddd;
      margin: 4px;
      border-radius: 3px;
    }
  }
}

/* 全屏布局预览 */
.preview-fullscreen {
  display: flex;
  height: 100%;
  background: #eee;
  position: relative;

  .fullscreen-content {
    width: 100%;
    height: 100%;
    background: #eee;
    border-radius: 4px;
    margin: 2px;
    position: relative;
  }

  .floating-actions-preview {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .floating-btn-preview {
      width: 6px;
      height: 6px;
      background: #1890ff;
      border-radius: 50%;
      opacity: 0.8;

      &:nth-child(2) {
        background: #52c41a;
      }

      &:nth-child(3) {
        background: #faad14;
      }
    }
  }
}

/* 双列布局预览 */
.preview-doublecolumn {
  display: flex;
  height: 100%;
  background: #eee;

  .first-column {
    width: 12px;
    position: relative;
    background: #ccc;
  }

  .second-column {
    width: 16px;
    background: #ddd;
    position: relative;
  }

  .content {
    flex: 1;
    background: #ddd;
    margin: 6px;
    border-radius: 4px;
    position: relative;
  }
}

.active-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
}

/* 主题模式切换样式 */
.theme-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.theme-mode-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: #fff;
}

.theme-mode-preview {
  width: 100%;
  height: 64px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.light-preview {
  background: #eee;

  .preview-header {
    height: 20px;
    background: #ddd;
    border-bottom: 1px solid #e8e8e8;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 8px;
      transform: translateY(-50%);
      width: 16px;
      height: 2px;
      background: #bfbfbf;
      border-radius: 1px;
    }
  }

  .preview-body {
    flex: 1;
    background: #ffffff;
    margin: 6px;
    border-radius: 4px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 6px;
      left: 6px;
      right: 6px;
      height: 1px;
      background: #f0f0f0;
    }
  }
}

.dark-preview {
  background: #1f1f1f;

  .preview-header {
    height: 20px;
    background: linear-gradient(135deg, #141414 0%, #0f0f0f 100%);
    border-bottom: 1px solid #303030;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 8px;
      transform: translateY(-50%);
      width: 16px;
      height: 2px;
      background: #595959;
      border-radius: 1px;
    }
  }

  .preview-body {
    flex: 1;
    background: #262626;
    margin: 6px;
    border-radius: 4px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 6px;
      left: 6px;
      right: 6px;
      height: 1px;
      background: #404040;
    }
  }
}

/* 主题切换列表样式 */
.theme-switch-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.theme-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  transition: all 0.2s ease;
}

.theme-switch-info {
  flex: 1;
}

.theme-switch-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 4px 0;
  opacity: 0.8;
}

/* 基础配置列表样式 */
.base-config-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  transition: all 0.2s ease;
}

.config-info {
  flex: 1;
}

.config-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 4px 0;
  opacity: 0.8;
}

/* 主题色选择器样式 */
.setting-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 16px;
  }
}

.theme-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  border-radius: 12px;
}

.color-item {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.check-icon {
  color: #fff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

/* 自定义颜色选择器样式 */
.custom-color-container {
  margin-top: 6px;
}
</style>
