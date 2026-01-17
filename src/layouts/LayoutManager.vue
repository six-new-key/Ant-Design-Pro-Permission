<template>
  <div class="layout-manager">
    <!-- 全局锁屏组件 -->
    <LockScreen v-if="appStore.isScreenLocked" />

    <!-- 布局组件加载完成后渲染 -->
    <component v-if="isLayoutLoaded && currentLayout && !appStore.isScreenLocked" :is="currentLayout" />
    <!-- 加载中状态 -->
    <div v-else-if="!appStore.isScreenLocked" class="layout-loading">
      <a-spin size="large" tip="数据加载中..." />
    </div>

    <!-- 布局切换按钮 -->
    <div class="layout-switcher-trigger" v-if="!showLayoutDrawer && !appStore.isScreenLocked">
      <a-button type="primary" @click="showLayoutDrawer = true">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-button>
    </div>

    <!-- 布局切换抽屉 -->
    <AppSettingsDrawer v-model:visible="showLayoutDrawer" :available-layout-configs="getEnabledLayouts()"
      @layout-switch="handleLayoutSwitch" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { getEnabledLayouts, getLayoutConfig, getDefaultLayoutConfig } from '@/utils/layout.config.js'
import { SettingOutlined } from '@ant-design/icons-vue'
import AppSettingsDrawer from '@/components/core/AppSettingsDrawer.vue'
import LockScreen from '@/components/core/LockScreen.vue'

const appStore = useAppStore()

// 插件化布局组件映射
const layoutComponents = ref({})
// 布局加载状态
const isLayoutLoaded = ref(false)

// 抽屉显示状态
const showLayoutDrawer = ref(false)

// 基于配置文件加载布局组件
const loadLayoutComponents = async () => {
  try {
    // 获取启用的布局配置
    const enabledConfigs = getEnabledLayouts()

    console.log('📋 开始加载布局组件，共', enabledConfigs.length, '个布局')

    // 并行加载所有布局组件
    const loadPromises = enabledConfigs.map(async (config) => {
      try {
        // 动态导入组件
        const module = await config.component()
        layoutComponents.value[config.key] = module.default

        console.log(`✓ 成功加载布局: ${config.name} (${config.key})`)
        return { success: true, config }
      } catch (error) {
        console.error(`✗ 加载布局失败: ${config.name} (${config.key})`, error)
        return { success: false, config, error }
      }
    })

    // 等待所有布局组件加载完成
    const results = await Promise.all(loadPromises)

    // 统计加载结果
    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount

    if (successCount === 0) {
      console.error('❌ 没有成功加载任何布局组件！请检查配置文件和组件路径')
    } else {
      console.log(`✅ 布局加载完成: ${successCount} 个成功, ${failedCount} 个失败`)

      // 显示加载的布局列表
      const loadedLayouts = Object.keys(layoutComponents.value)
      console.log('📦 已加载的布局:', loadedLayouts.join(', '))
    }

    isLayoutLoaded.value = true
  } catch (error) {
    console.error('💥 布局系统初始化失败:', error)
    isLayoutLoaded.value = true // 即使失败也要停止加载状态
  }
}

// 根据全局配置确定当前布局
const currentLayout = computed(() => {
  if (!isLayoutLoaded.value || Object.keys(layoutComponents.value).length === 0) {
    return null
  }

  const globalLayout = appStore.layout || 'sidebar'
  const layoutConfig = getLayoutConfig(globalLayout)

  if (!layoutConfig || !layoutComponents.value[globalLayout]) {
    console.warn(`⚠️ 布局 '${globalLayout}' 不存在或未启用，回退到默认布局`)

    // 回退到默认布局
    const defaultConfig = getDefaultLayoutConfig()
    if (defaultConfig && layoutComponents.value[defaultConfig.key]) {
      return layoutComponents.value[defaultConfig.key]
    }

    // 如果默认布局也不可用，使用第一个可用的布局
    const firstAvailableKey = Object.keys(layoutComponents.value)[0]
    return layoutComponents.value[firstAvailableKey]
  }

  return layoutComponents.value[globalLayout]
})

// 获取当前布局配置信息
const currentLayoutConfig = computed(() => {
  const globalLayout = appStore.layout || 'sidebar'
  return getLayoutConfig(globalLayout) || getDefaultLayoutConfig()
})

// 获取已加载的布局组件列表
const getLoadedLayoutKeys = () => Object.keys(layoutComponents.value)

// 处理布局切换（显示加载状态）
const handleLayoutSwitch = (layoutKey) => {
  // 显示加载状态300ms
  isLayoutLoaded.value = false

  setTimeout(() => {
    isLayoutLoaded.value = true
  }, 300)
}

// 组件挂载时加载所有布局组件
onMounted(async () => {
  await loadLayoutComponents()
})

// 暴露方法供外部使用
defineExpose({
  getLoadedLayoutKeys,
  currentLayoutConfig
})
</script>

<style scoped lang="scss">
.layout-manager {
  width: 100%;
  height: 100vh;
}

.layout-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.layout-loading p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 布局切换按钮样式 */
.layout-switcher-trigger {
  position: fixed;
  right: 0;
  top: 50%;
  z-index: 9;

  .ant-btn {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>