<template>
    <a-layout style="height: 100vh; width: 100%;">
        <!-- 页签区域 -->
        <transition name="tabs-fade">
            <TabsView v-if="appStore.tabsShow" />
        </transition>
        <!-- 全屏内容区域 -->
        <a-layout-content class="fullscreen-content">
            <LayoutContent />
        </a-layout-content>
    </a-layout>
</template>

<script setup>
import { useAppStore } from '@/stores'
import LayoutContent from '@/components/core/LayoutContent.vue'
import TabsView from '@/components/core/TabsView.vue'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
.fullscreen-content {
    height: calc(100vh - $top-height);
    overflow-y: scroll;
    width: 100%;
    padding: $content-padding;
}
</style>