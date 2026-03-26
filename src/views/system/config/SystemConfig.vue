<template>
  <div class="system-config-container" :style="cssVars">
    <a-card :bordered="false">
      <template #title>
        <a-tabs v-model:activeKey="activeTab">
          <!-- Tab 1: 分组管理 -->
          <a-tab-pane key="group" tab="分组管理" />

          <!-- Tab 2: 功能管理 -->
          <a-tab-pane key="feature" tab="功能管理" />

          <!-- Tab 3: 配置管理 -->
          <a-tab-pane key="config" tab="配置管理" />
        </a-tabs>
      </template>

      <!-- Tab 内容 -->
      <GroupManagement 
        v-if="activeTab === 'group'" 
        @jump-to-feature="handleJumpToFeature" />
      <FeatureManagement 
        v-else-if="activeTab === 'feature'" 
        :filter-group-code="filterGroupCode"
        @jump-to-config="handleJumpToConfig" />
      <ConfigManagement 
        v-else-if="activeTab === 'config'" 
        :filter-feature-code="filterFeatureCode"
        @reset-filter="handleResetFilter" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { theme } from 'ant-design-vue'
import GroupManagement from './components/GroupManagement.vue'
import FeatureManagement from './components/FeatureManagement.vue'
import ConfigManagement from './components/ConfigManagement.vue'

const { token } = theme.useToken()

const activeTab = ref('group')
const filterGroupCode = ref(null)
const filterFeatureCode = ref(null)

// 从分组跳转到功能
const handleJumpToFeature = (groupCode) => {
  filterGroupCode.value = groupCode
  filterFeatureCode.value = null // 清空配置过滤
  activeTab.value = 'feature'
}

// 从功能跳转到配置
const handleJumpToConfig = (featureCode) => {
  filterFeatureCode.value = featureCode
  activeTab.value = 'config'
}

// 重置配置过滤
const handleResetFilter = () => {
  filterFeatureCode.value = null
}

// CSS 变量映射
const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-text-tertiary': t.colorTextTertiary,
    '--color-primary': t.colorPrimary,
    '--color-primary-bg': t.colorPrimaryBg,
    '--color-primary-bg-hover': t.colorPrimaryBgHover,
    '--color-primary-border': t.colorPrimaryBorder,
    '--color-border': t.colorBorder,
    '--color-border-secondary': t.colorBorderSecondary,
    '--color-fill-alter': t.colorFillAlter,
    '--color-bg-container': t.colorBgContainer,
    '--border-radius': `${t.borderRadius}px`,
    '--border-radius-sm': `${t.borderRadiusSM}px`,
    '--font-size-sm': `${t.fontSizeSM}px`,
    '--font-size-lg': `${t.fontSizeLG}px`
  }
})
</script>

<style lang="scss" scoped>
@import './styles/config.scss';
</style>
