<template>
  <div class="user-dropdown">
    <!-- 用户头像触发器 -->
    <div class="user-trigger" @click="toggleDropdown">
      <svg-icon name="avatar" width="32px" height="32px" class="user-avatar" />
    </div>

    <!-- 下拉菜单 -->
    <div class="dropdown-menu" :class="{ 'dropdown-menu--visible': isVisible }">
      <!-- 用户信息区域 -->
      <div class="user-info-section">
        <div>
          <svg-icon name="avatar" width="48px" height="48px" />
        </div>
        <div class="user-details">
          <div class="user-name">{{ userInfo.name || 'Admin' }}</div>
          <div class="user-email">{{ userInfo.email || 'admin@example.com' }}</div>
        </div>
      </div>

      <!-- 用户信息和菜单项之间的分割线 -->
      <div class="dropdown-divider"></div>

      <!-- 菜单项 -->
      <div class="menu-items">
        <div v-for="(item, index) in menuOptions" :key="item.value">
          <!-- 在锁定屏幕前添加分割线 -->
          <div v-if="item.value === 'lock'" class="dropdown-divider"></div>
          <!-- 在退出登录前添加分割线 -->
          <div v-if="item.value === 'logout'" class="dropdown-divider"></div>

          <div class="menu-item" :class="{ 'menu-item--danger': item.theme === 'error' }"
            @click="handleMenuClick(item)">
            <span class="menu-item-icon">
              <t-icon :name="getMenuIcon(item.value)" size="16px" />
            </span>
            <span class="menu-item-text">{{ item.content }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 锁定屏幕对话框 -->
    <LockScreenDialog v-model="showLockScreenDialog" @locked="handleLocked" />

    <!-- 退出登录确认对话框 -->
    <LogoutConfirmDialog v-model="showLogoutConfirmDialog" @confirm="handleLogout" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import LockScreenDialog from '@/components/lock-screen/LockScreenDialog.vue'
import LogoutConfirmDialog from '@/components/custom/LogoutConfirmDialog.vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 下拉菜单显示状态
const isVisible = ref(false)

// 锁定屏幕对话框显示状态
const showLockScreenDialog = ref(false)

// 退出登录确认对话框显示状态
const showLogoutConfirmDialog = ref(false)

// 切换下拉菜单显示状态
const toggleDropdown = (event) => {
  event.stopPropagation()
  isVisible.value = !isVisible.value
}

// 隐藏下拉菜单
const hideDropdown = () => {
  isVisible.value = false
}

// 获取菜单项图标
const getMenuIcon = (value) => {
  const iconMap = {
    docs: 'home',
    github: 'logo-github',
    help: 'help-circle',
    lock: 'lock-on',
    logout: 'logout'
  }
  return iconMap[value] || 'bulletpoint'
}

// 菜单选项
const menuOptions = [
  {
    content: '使用文档',
    value: 'docs'
  },
  {
    content: 'GitHub',
    value: 'github'
  },
  {
    content: '问题 & 帮助',
    value: 'help'
  },
  {
    content: '锁定屏幕',
    value: 'lock'
  },
  {
    content: '退出登录',
    value: 'logout',
    theme: 'error'
  }
]

// 处理菜单点击
const handleMenuClick = (data) => {
  // 隐藏下拉菜单
  isVisible.value = false

  const action = data.value
  switch (action) {
    case 'docs':
      window.open('https://vben.pro/guide/', '_blank')
      break
    case 'github':
      window.open('https://github.com/vbenjs/vue-vben-admin', '_blank')
      break
    case 'help':
      // 可以打开帮助对话框或跳转到帮助页面
      console.log('打开帮助页面')
      break
    case 'lock':
      handleLockScreen()
      break
    case 'logout':
      showLogoutConfirmDialog.value = true
      break
  }
}

// 锁定屏幕
const handleLockScreen = () => {
  showLockScreenDialog.value = true
}

// 处理锁定完成
const handleLocked = (lockData) => {
  console.log('屏幕已锁定:', lockData)
  // 这里可以添加锁定后的逻辑，比如跳转到锁屏页面或设置应用状态
  // 可以将锁定信息存储到store中
}

// 退出登录
const handleLogout = async () => {
  try {
    // 清除用户状态
    await userStore.logout()

    // 跳转到登录页面
    router.push('/login')

    // 显示退出成功提示
    console.log('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使退出失败，也强制跳转到登录页面
    router.push('/login')
  }
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  if (event.altKey) {
    switch (event.key.toLowerCase()) {
      case 'l':
        event.preventDefault()
        handleLockScreen()
        break
      case 'q':
        event.preventDefault()
        showLogoutConfirmDialog.value = true
        break
    }
  }
}

// 处理点击外部区域隐藏下拉菜单
const handleClickOutside = (event) => {
  // 检查点击是否在下拉菜单组件内部
  const dropdown = event.target.closest('.user-dropdown')
  if (!dropdown && isVisible.value) {
    // 立即隐藏菜单
    isVisible.value = false
  }
}

// 注册事件监听器
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 用户下拉菜单容器 */
.user-dropdown {
  position: relative;
  display: inline-block;
}

/* 用户头像触发器 */
.user-trigger {
  cursor: pointer;
}

.user-avatar {
  border-radius: 50%;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 250px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-menu--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* 用户信息区域 */
.user-info-section {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-large {
  flex-shrink: 0;
}

.user-avatar-large svg {
  border-radius: 50%;
  color: var(--td-text-color-primary);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分割线 */
.dropdown-divider {
  height: 1px;
  background: var(--td-border-level-1-color);
  margin: 0;
}

/* 菜单项容器 */
.menu-items {
  padding: 3px 0;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--td-text-color-primary);
}

.menu-item:hover {
  background: var(--td-bg-color-container-hover);
}

.menu-item--danger {
  color: var(--td-error-color);
}

.menu-item--danger:hover {
  background: var(--td-error-color-1);
  color: var(--td-error-color);
}

.menu-item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.menu-item-text {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dropdown-menu {
    width: 260px;
    right: -20px;
  }
}
</style>