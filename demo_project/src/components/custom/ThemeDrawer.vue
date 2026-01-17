<template>
    <t-drawer v-model:visible="visible" title="主题设置" placement="right" size="360px" :show-overlay="true"
        :close-on-overlay-click="true" :footer="false" class="theme-drawer">
        <div class="theme-drawer-content">
            <!-- 主题模式设置 -->
            <div class="setting-section">
                <h4 class="section-title">
                    主题模式
                </h4>
                <div class="theme-mode-options">
                    <div v-for="mode in themeModes" :key="mode.value" class="theme-mode-item"
                        :class="{ active: appStore.themeMode === mode.value }"
                        @click="handleThemeModeChange(mode.value)">
                        <t-icon :name="mode.icon" class="mode-icon" />
                        <span class="mode-label">{{ mode.label }}</span>
                        <t-icon v-if="appStore.themeMode === mode.value" name="check" class="check-icon" />
                    </div>
                </div>
            </div>

            <!-- 界面显示设置 -->
            <div class="setting-section">
                <h4 class="section-title">
                    界面显示
                </h4>
                <div class="ui-control-options">
                    <!-- 侧边栏主题控制 -->
                    <div class="ui-control-item">
                        <div class="control-info">
                            <t-icon :name="appStore.sidebarTheme === 'dark' ? 'sunny' : 'moon'" class="control-icon" />
                            <span class="control-label">菜单栏主题</span>
                        </div>
                        <t-switch v-model="sidebarThemeSwitch" @change="handleSidebarThemeChange" size="medium" />
                    </div>

                    <!-- 面包屑导航控制 -->
                    <div class="ui-control-item">
                        <div class="control-info">
                            <t-icon name="location" class="control-icon" />
                            <span class="control-label">面包屑导航</span>
                        </div>
                        <t-switch v-model="appStore.showBreadcrumb" @change="handleBreadcrumbChange" size="medium" />
                    </div>

                    <!-- 页签组件控制 -->
                    <div class="ui-control-item">
                        <div class="control-info">
                            <t-icon name="view-module" class="control-icon" />
                            <span class="control-label">页面标签</span>
                        </div>
                        <t-switch v-model="appStore.showPageTags" @change="handlePageTagsChange" size="medium" />
                    </div>

                    <!-- 页签抬高效果控制 -->
                    <div class="ui-control-item">
                        <div class="control-info">
                            <t-icon name="layers" class="control-icon" />
                            <span class="control-label">标签阴影效果</span>
                        </div>
                        <t-switch v-model="appStore.showPageTagsElevation" @change="handlePageTagsElevationChange"
                            size="medium" />
                    </div>
                </div>
            </div>

             <!-- 布局设置 -->
            <div class="setting-section">
                <h4 class="section-title">
                    布局设置
                </h4>
                <div class="layout-options">
                    <div v-for="layout in availableLayouts" :key="layout.name" class="layout-item"
                        :class="{ active: layoutStore.currentLayout === layout.name }"
                        @click="handleLayoutChange(layout.name)">
                        <div class="layout-preview">
                            <t-icon :name="layout.icon" class="layout-icon" />
                        </div>
                        <div class="layout-info">
                            <div class="layout-name">{{ layout.label }}</div>
                            <div class="layout-desc">{{ layout.description }}</div>
                        </div>
                        <t-icon v-if="layoutStore.currentLayout === layout.name" name="check" class="check-icon" />
                    </div>
                </div>
            </div>

            <!-- 页面动画设置 -->
            <div class="setting-section">
                <h4 class="section-title">
                    页面动效
                </h4>
                <div class="animation-options">
                    <div v-for="animation in pageAnimations" :key="animation.value" class="animation-item"
                        :class="{ active: appStore.currentPageAnimation === animation.value }"
                        @click="handleAnimationChange(animation.value)">
                        <div class="animation-content">
                            <t-icon :name="animation.icon" class="animation-icon" />
                            <span class="animation-label">{{ animation.label }}</span>
                        </div>
                        <t-icon v-if="appStore.currentPageAnimation === animation.value" name="check" class="check-icon" />
                    </div>
                </div>
            </div>
        </div>
    </t-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore ,PAGE_ANIMATIONS} from '@/store/modules/app'
import { useLayoutStore } from '@/store/modules/layout'
import { THEME_MODE } from '@/utils/theme'

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Store
const appStore = useAppStore()
const layoutStore = useLayoutStore()

// 响应式数据
const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// 主题模式选项
const themeModes = [
    { value: THEME_MODE.LIGHT, label: '浅色', icon: 'sunny' },
    { value: THEME_MODE.DARK, label: '深色', icon: 'moon' },
    { value: THEME_MODE.AUTO, label: '系统', icon: 'desktop' }
]

// 页面动画效果选项
const pageAnimations = [
    // 滑动动效
    { value: PAGE_ANIMATIONS.SLIDE_LEFT, label: '从左滑入', icon: 'chevron-right' },
    { value: PAGE_ANIMATIONS.SLIDE_RIGHT, label: '从右滑入', icon: 'chevron-left' },
    { value: PAGE_ANIMATIONS.SLIDE_UP, label: '从下滑入', icon: 'chevron-up' },
    { value: PAGE_ANIMATIONS.SLIDE_DOWN, label: '从上滑入', icon: 'chevron-down' },
    // 淡入淡出动效
    { value: PAGE_ANIMATIONS.FADE, label: '淡入淡出', icon: 'view-module' },
    { value: PAGE_ANIMATIONS.FADE_IN_UP, label: '淡入向上', icon: 'arrow-up' },
    { value: PAGE_ANIMATIONS.FADE_IN_DOWN, label: '淡入向下', icon: 'arrow-down' },
    { value: PAGE_ANIMATIONS.FADE_IN_LEFT, label: '淡入向左', icon: 'arrow-left' },
    { value: PAGE_ANIMATIONS.FADE_IN_RIGHT, label: '淡入向右', icon: 'arrow-right' },
    { value: PAGE_ANIMATIONS.ZOOM_IN_DOWN, label: '放大向下', icon: 'aspect-ratio' },
    { value: PAGE_ANIMATIONS.BOUNCE_IN_LEFT, label: '弹跳向左', icon: 'call-received' },
    { value: PAGE_ANIMATIONS.BOUNCE_IN_RIGHT, label: '弹跳向右', icon: 'call-made' },
    // 旋转动效
    { value: PAGE_ANIMATIONS.ROTATE_IN_DOWN_LEFT, label: '左下旋转', icon: 'rotate-ccw' },
    { value: PAGE_ANIMATIONS.ROTATE_IN_DOWN_RIGHT, label: '右下旋转', icon: 'rotate-cw' },
    { value: PAGE_ANIMATIONS.ROTATE_IN_UP_LEFT, label: '左上旋转', icon: 'undo' },
    { value: PAGE_ANIMATIONS.ROTATE_IN_UP_RIGHT, label: '右上旋转', icon: 'redo' },
    // 光速动效
    { value: PAGE_ANIMATIONS.LIGHT_SPEED_IN_LEFT, label: '光速左入', icon: 'fast-forward' },
    { value: PAGE_ANIMATIONS.LIGHT_SPEED_IN_RIGHT, label: '光速右入', icon: 'fast-rewind' },
    // 缩放动效
    { value: PAGE_ANIMATIONS.ZOOM, label: '缩放效果', icon: 'fullscreen' },
    // 弹跳动效
    { value: PAGE_ANIMATIONS.BOUNCE, label: '弹跳效果', icon: 'jump' },
    // 翻转动效
    { value: PAGE_ANIMATIONS.FLIP, label: '翻转效果', icon: 'swap' },
    // 摆动动效
    { value: PAGE_ANIMATIONS.SWING, label: '摆动效果', icon: 'vibration' },
    { value: PAGE_ANIMATIONS.JELLO, label: '果冻效果', icon: 'blur-on' },
    // 心跳动效
    { value: PAGE_ANIMATIONS.PULSE, label: '脉冲效果', icon: 'radio-button-checked' }
]

// 侧边栏主题开关状态
const sidebarThemeSwitch = computed({
    get: () => appStore.sidebarTheme === 'dark',
    set: (value) => {
        appStore.setSidebarTheme(value ? 'dark' : 'light')
    }
})

// 可用布局列表
const availableLayouts = computed(() => {
    return layoutStore.getAvailableLayouts()
})

// 处理布局切换
const handleLayoutChange = async (layoutName) => {
    await layoutStore.setLayout(layoutName)
    handleApply();
}

// 方法
const handleThemeModeChange = (mode) => {
    appStore.setThemeMode(mode)
    handleApply();
}

// 处理面包屑导航开关变化
const handleBreadcrumbChange = (value) => {
    appStore.setBreadcrumbVisible(value)
}

// 处理侧边栏主题开关变化
const handleSidebarThemeChange = (value) => {
    appStore.setSidebarTheme(value ? 'dark' : 'light')
}

// 处理页签组件开关变化
const handlePageTagsChange = (value) => {
    appStore.setPageTagsVisible(value)
}

// 处理页签抬高效果开关变化
const handlePageTagsElevationChange = (value) => {
    appStore.setPageTagsElevation(value)
}

// 处理动画效果切换
const handleAnimationChange = (animation) => {
    appStore.setPageAnimation(animation)
    handleApply();
}

const handleApply = () => {
    // 主题变化是实时应用的，这里只需要关闭抽屉
    visible.value = false
}



// 导出方法和数据
defineExpose({
    visible,
    handleApply
})
</script>

<style scoped>
.theme-drawer-content {
    padding: 0;
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
}

/* 隐藏滚动条 */
.theme-drawer-content::-webkit-scrollbar {
    display: none;
}

.setting-section {
    padding: 0;
}

.setting-section:last-of-type {
    border-bottom: none;
    flex: 1;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: bold;
    color: var(--td-text-color-primary);
}

.section-icon {
    margin-right: 8px;
    color: var(--td-text-color-secondary);
}

/* 主题模式选项 */
.theme-mode-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px;
}

.theme-mode-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
}

.theme-mode-item:hover {
    border-color: var(--td-brand-color);
    background: var(--td-bg-color-container-hover);
}

.theme-mode-item.active {
    border-color: var(--td-brand-color);
}

.mode-icon {
    margin-right: 12px;
    font-size: 16px;
    color: var(--td-text-color-secondary);
}

.theme-mode-item.active .mode-icon {
    color: var(--td-brand-color);
}

.mode-label {
    flex: 1;
    font-size: 14px;
    color: var(--td-text-color-primary);
}

.check-icon {
    color: var(--td-brand-color);
    font-size: 16px;
}

/* 界面控制选项 */
.ui-control-options {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.ui-control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
}

.control-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.control-icon {
    margin-right: 12px;
    font-size: 16px;
    color: var(--td-text-color-secondary);
}

.control-label {
    font-size: 14px;
    color: var(--td-text-color-primary);
}

/* 动画选项样式 */
.animation-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 15px;
}

.animation-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 4px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
    min-height: 40px;
    position: relative;
    margin: 0 4px 4px 0;
}

.animation-item:hover {
    border-color: var(--td-brand-color);
    background: var(--td-bg-color-container-hover);
}

.animation-item.active {
    border-color: var(--td-brand-color);
    background: var(--td-brand-color-light);
}

.animation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
}

.animation-icon {
    font-size: 16px;
    color: var(--td-text-color-secondary);
}

.animation-item.active .animation-icon {
    color: var(--td-brand-color);
}

.animation-label {
    font-size: 11px;
    color: var(--td-text-color-primary);
    text-align: center;
    line-height: 1.1;
}

.animation-item .check-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    color: var(--td-brand-color);
}

/* 布局选项样式 */
.layout-options {
    padding: 15px;
}

.layout-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--td-bg-color-container);
}

.layout-item:last-child {
    margin-bottom: 0;
}

.layout-item:hover {
    border-color: var(--td-brand-color);
    background: var(--td-bg-color-container-hover);
}

.layout-item.active {
    border-color: var(--td-brand-color);
    background: var(--td-brand-color-light);
}

.layout-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 6px;
    background: var(--td-bg-color-page);
}

.layout-icon {
    font-size: 18px;
    color: var(--td-text-color-secondary);
}

.layout-item.active .layout-icon {
    color: var(--td-brand-color);
}

.layout-info {
    flex: 1;
}

.layout-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
}

.layout-desc {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    line-height: 1.4;
}
</style>