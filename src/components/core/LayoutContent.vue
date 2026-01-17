<template>
    <!-- 刷新loading状态 -->
    <div v-if="isRefreshing" class="refresh-loading">
        <a-spin tip="刷新中..." />
    </div>
    <transition appear mode="out-in" v-else :enter-active-class="`animate__animated ${getEnterAnimation}`">
        <router-view :key="routerViewKey" />
    </transition>
</template>

<script setup>
import { ref, watch, nextTick,computed } from 'vue'
import { useAppStore } from '@/stores'
import { PAGE_ANIMATION_CONFIG } from '@/utils'

const appStore = useAppStore()

// 刷新状态管理
const isRefreshing = ref(false)
const routerViewKey = ref(0)


// 动画效果计算属性 - 使用统一配置
const getEnterAnimation = computed(() => {
    return PAGE_ANIMATION_CONFIG.getAnimationClass(appStore.currentPageAnimation)
})

// 监听刷新状态
watch(
    () => appStore.shouldRefresh,
    (shouldRefresh) => {
        if (shouldRefresh) {
            // 执行页面刷新
            handlePageRefresh()
            // 重置刷新状态
            appStore.resetRefresh()
        }
    }
)

// 处理页面刷新
const handlePageRefresh = async () => {
    // 显示刷新加载状态
    isRefreshing.value = true

    // 等待一小段时间让用户看到刷新提示
    await new Promise(resolve => setTimeout(resolve, 300))

    // 更新router-view的key来强制重新渲染组件
    routerViewKey.value += 1

    // 等待DOM更新完成
    await nextTick()

    // 隐藏刷新加载状态
    isRefreshing.value = false
}
</script>

<style scoped lang="scss">
.refresh-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}
</style>