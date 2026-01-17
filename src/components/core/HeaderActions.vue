<template>
    <a-space :size="15">
        <!-- 搜索框 -->
        <div class="header-actions">
            <!-- 搜索 -->
            <div class="action-item search-trigger" @click="openSearchDialog">
                <div class="search-box">
                    <SearchOutlined class="search-icon" />
                    <span class="search-text">搜索</span>
                    <span class="search-shortcut">Ctrl K</span>
                </div>
            </div>
        </div>

        <a-tooltip title="刷新">
            <a-button type="text" :icon="h(SyncOutlined)" @click="handleRefresh" />
        </a-tooltip>

        <!-- 全屏按钮 -->
        <a-tooltip title="全屏">
            <a-button type="text" @click="toggleFullscreen">
                <template #icon>
                    <ExpandOutlined v-if="!isFullscreen" />
                    <CompressOutlined v-else />
                </template>
            </a-button>
        </a-tooltip>

        <!-- 主题切换按钮 -->
        <a-button type="text" @click="toggleThemeMode">
            <template #icon>
                <svg-icon :name="appStore.themeMode === 'dark' ? 'sun' : 'moon'" width="17px" height="17px"
                    :color="color" />
            </template>
        </a-button>

        <!-- 语言切换按钮 -->
        <a-dropdown arrow placement="bottomRight">
            <template #overlay>
                <a-menu @click="toggleLanguage">
                    <a-menu-item v-for="option in languageOptions" :key="option.key">
                        <template #icon>
                            <svg-icon :style="{ opacity: appStore.language === option.key ? 1 : 0 }" :color="dotColor"
                                :name="option.icon" :width="iconSize" :height="iconSize" />
                        </template>
                        {{ option.label }}
                    </a-menu-item>
                </a-menu>
            </template>
            <a-button type="text">
                <template #icon>
                    <svg-icon name="language" width="17px" height="17px" :color="color" />
                </template>
            </a-button>
        </a-dropdown>

        <!-- 用户头像下拉菜单 -->
        <a-dropdown arrow placement="bottomRight">
            <div class="user-info">
                <a-avatar>
                    <template #icon><user-outlined /></template>
                </a-avatar>
            </div>
            <template #overlay>
                <a-menu @click="handleMenuClick">
                    <a-menu-item key="profile">
                        <template #icon>
                            <user-outlined />
                        </template>
                        个人中心
                    </a-menu-item>
                    <a-menu-item key="settings">
                        <template #icon>
                            <setting-outlined />
                        </template>
                        个人设置
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="lock">
                        <template #icon>
                            <LockOutlined />
                        </template>
                        锁定屏幕
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout">
                        <template #icon>
                            <LogoutOutlined />
                        </template>
                        退出登录
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
    </a-space>

    <!-- 搜索对话框组件 -->
    <SearchDialog v-model="searchDialogVisible" />

    <!-- 锁屏对话框组件 -->
    <LockScreenDialog v-model="lockDialogVisible" />
</template>

<script setup>
import { computed, h, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SyncOutlined,
    SearchOutlined,
    LockOutlined
} from '@ant-design/icons-vue'
import { getLanguageOptions } from '@/locale'
import { themeChangeWithAnimation } from '@/utils'
import { useAppStore, useThemeStore, useUserStore } from '@/stores'
import SearchDialog from './SearchDialog.vue'
import LockScreenDialog from './LockScreenDialog.vue'
import { theme, Modal } from 'ant-design-vue'
import { logout } from "@/api";

const router = useRouter()
const appStore = useAppStore()
const themeStore = useThemeStore()
const userStore = useUserStore()
const isFullscreen = ref(false)
const languageOptions = getLanguageOptions()
const dotColor = computed(() => themeStore.primaryColorHex)
const iconSize = computed(() => {
    return themeStore.baseConfig.fontSize + 8 + 'px'
})
const { token } = theme.useToken()

// 搜索功能
const searchDialogVisible = ref(false)

// 打开搜索对话框
const openSearchDialog = () => {
    searchDialogVisible.value = true
}

// 锁屏功能
const lockDialogVisible = ref(false)

// 打开锁屏对话框
const openLockDialog = () => {
    lockDialogVisible.value = true
}

//颜色复杂计算
const color = computed(() => {
    if (appStore.themeMode === 'dark' || (appStore.layout === 'topbar' || appStore.layout === 'mixed') && appStore.headerTheme === 'dark') {
        return '#fff'
    } else {
        return '#333'
    }
})

const anticonColor = computed(() => {
    if (appStore.headerTheme === "dark" && (appStore.layout === 'topbar' || appStore.layout === 'mixed')) {
        return '#fff'
    } else {
        return ''
    }
})

// 按钮hover样式
const btnHoverColor = computed(() => {
    if (appStore.headerTheme === "dark" && (appStore.layout === 'topbar' || appStore.layout === 'mixed')) {
        return 'rgba(255,255,255,0.1)'
    } else {
        return 'rgba(0,0,0,0.1)'
    }
})

const textColor = computed(() => {
    if (appStore.headerTheme === "dark" && (appStore.layout === 'topbar' || appStore.layout === 'mixed')) {
        return '#fff'
    } else {
        return token.value.colorTextSecondary
    }
})

const searchBgColor = computed(() => {
    if (appStore.headerTheme === "dark" && (appStore.layout === 'topbar' || appStore.layout === 'mixed')) {
        return 'rgba(255,255,255,0.1)'
    } else {
        return token.value.colorFillSecondary
    }
})

// 刷新页面
const handleRefresh = () => {
    appStore.triggerRefresh()
}

// 主题切换
const toggleThemeMode = async (e) => {
    await themeChangeWithAnimation(e, () => {
        appStore.setThemeMode(appStore.themeMode === 'dark' ? 'light' : 'dark')
    }, {
        themeMode: appStore.themeMode === 'dark' ? 'light' : 'dark'
    })
}

// 语言切换
const toggleLanguage = ({ key }) => {
    appStore.setLanguage(key)
}

// 处理用户菜单点击
const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'profile':
            router.push('/profile')
            break
        case 'settings':
            router.push('/settings')
            break
        case 'lock':
            openLockDialog()
            break
        case 'logout':
            // 这里应该调用登出逻辑
            doLogout()
            break
    }
}

// 返回登录
const doLogout = () => {
    // 确认退出登录
    Modal.confirm({
        title: '确认退出登录吗？',
        okText: '确定',
        okType: 'primary',
        centered: true,
        onOk: async () => {
            // 调用退出登录接口
            await logout()
            userStore.handleLogout()
        }
    })
}

// 全屏切换
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

// 键盘快捷键监听
const handleKeydown = (event) => {
    // 检查是否按下了 Ctrl+K (Windows/Linux) 或 Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault() // 阻止浏览器默认行为
        openSearchDialog()
    }
}

// 生命周期
onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
// 搜索框样式
.header-actions {
    display: flex;
    align-items: center;
    border-radius: v-bind('token.borderRadius + "px"');
}

.action-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.search-trigger {
    .search-box {
        height: 34px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-radius: v-bind('token.borderRadius + "px"');
        background: v-bind('searchBgColor');
        min-width: 150px;
        opacity: 0.8;
        border: 1px solid transparent;

        &:hover {
            opacity: 1;
        }

        .search-icon {
            color: v-bind('textColor');
            font-size: v-bind('token.fontSize + "px"');
        }

        .search-text {
            margin-left: 8px;
            flex: 1;
            color: v-bind('textColor');
            font-size: v-bind('token.fontSize + "px"');
        }

        .search-shortcut {
            display: flex;
            align-items: center;
            height: 22px;
            color: v-bind('token.colorTextSecondary');
            font-size: v-bind('token.fontSize - 2 + "px"');
            border-radius: v-bind('token.borderRadius + "px"');
            padding: 6px;
            background: v-bind('token.colorBgContainer');
            border: 1px solid v-bind('token.colorBorder');
            font-family: monospace;
        }
    }
}

.user-info {
    cursor: pointer;
}

.ant-btn:hover {
    background: v-bind('btnHoverColor');
}

.anticon {
    color: v-bind('anticonColor');
}
</style>