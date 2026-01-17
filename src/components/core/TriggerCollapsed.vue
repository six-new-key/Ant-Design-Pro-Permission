<template>
    <div class="custom-trigger" @click.stop
        :class="{ 'collapsed': collapsed, 'theme-mode-trigger': appStore.sidebarTheme === 'dark' }">
        <a-button type="text" @click="handleToggleCollapse">
            <template #icon>
                <AlignRightOutlined style="font-size: 10px;" v-if="!collapsed" />
                <AlignLeftOutlined style="font-size: 10px;" v-else />
            </template>
        </a-button>
        <a-tooltip v-if="!collapsed" :title="appStore.sidebarFixed ? '取消' : '固定'">
            <a-button type="text" @click="handlePinClick">
                <template #icon>
                    <PushpinFilled :rotate="-45" style="font-size: 10px;" v-if="appStore.sidebarFixed" />
                    <PushpinOutlined :rotate="-45" style="font-size: 10px;" v-else />
                </template>
            </a-button>
        </a-tooltip>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores'
import { theme } from 'ant-design-vue'
import { AlignLeftOutlined, AlignRightOutlined, PushpinOutlined, PushpinFilled } from '@ant-design/icons-vue'

const appStore = useAppStore()
const collapsed = ref(appStore.sidebarCollapsed)
const { token } = theme.useToken()

// Emits
const emit = defineEmits(['trigger-collapse', 'pin-click'])

// 切换折叠按钮点击事件
const handleToggleCollapse = () => {
    emit('trigger-collapse')
}

// 固定按钮点击事件
const handlePinClick = () => {
    emit('pin-click')
}

// 监听store中的状态变化
watch(() => appStore.sidebarCollapsed, (newVal) => {
    collapsed.value = newVal
})
</script>

<style lang="scss" scoped>
.custom-trigger {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-right: 1px solid v-bind('token.colorFillSecondary');

    &.collapsed {
        padding: 0;
        justify-content: center;
    }

    &.theme-mode-trigger {
        background: $component-bg-color;
        
        :where(.ant-btn):hover {
            background: rgb(52, 52, 57);
        }

        :where(.ant-btn)>span {
            color: #fff;
        }
    }
}
</style>
