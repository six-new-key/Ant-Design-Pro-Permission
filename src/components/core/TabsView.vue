<template>
  <div class="tabs-view">
    <div class="tabs-container">
      <!-- 左侧区域 -->
      <div class="tabs-left-area left-right-common">
        <!-- 左滚动按钮 -->
        <a-button type="text" class="custom-btn" :disabled="!canScrollLeft" v-show="showScrollButtons"
          @click="scrollLeft">
          <LeftOutlined style="font-size: 10px;" />
        </a-button>
      </div>

      <!-- 中间区域 - 页签显示区 -->
      <div class="tabs-center-area">
        <div class="tabs-scroll-area" ref="tabsScrollArea" @wheel="handleWheel">
          <VueDraggable v-model="draggableTabsList" class="tabs-list" ref="tabsList" direction="horizontal"
            :animation="200" :filter="'.pinned'" :prevent-on-filter="true" @start="onDragStart" @end="onDragEnd">
            <TransitionGroup name="tabs-fade" type="transition">
              <div v-for="tab in tabsStore.activeTabs" :key="tab.path" :class="[
                'tab-item',
                {
                  'active': tab.path === tabsStore.activeTabPath,
                  'pinned': tab.pinned
                }
              ]" @click="handleTabClick(tab)" @contextmenu="handleTabRightClick($event, tab)"
                @mouseenter="hoveredTabPath = tab.path" @mouseleave="hoveredTabPath = null">
                <!-- 页签图标 -->
                <component v-if="tab.icon" :is="tab.icon" class="tab-icon" />

                <!-- 页签标题 -->
                <span class="tab-title">{{ tab.title }}</span>

                <!-- 固定图标 -->
                <PushpinOutlined :rotate="-45" v-if="tab.pinned" class="tab-pin-icon" />

                <!-- 关闭按钮 -->
                <CloseCircleOutlined v-else class="tab-close" @click.stop="handleTabClose(tab.path)" />
              </div>
            </TransitionGroup>
          </VueDraggable>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="tabs-right-area  left-right-common">

        <a-button type="text" class="custom-btn" :disabled="!canScrollRight" v-show="showScrollButtons"
          @click="scrollRight">
          <RightOutlined style="font-size: 10px;" />
        </a-button>

        <a-dropdown :trigger="['click']" arrow>
          <a-button type="text" class="custom-btn">
            <DownOutlined style="font-size: 10px;" />
          </a-button>

          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="refresh">
                <template #icon>
                  <ReloadOutlined />
                </template>
                刷新
              </a-menu-item>

              <a-menu-item key="togglePin" :disabled="tabsStore.activeTab?.path === HOME_PATH">
                <template #icon>
                  <PushpinOutlined :rotate="-45" v-if="!tabsStore.activeTab?.pinned" />
                  <PushpinFilled :rotate="-45" v-else />
                </template>
                {{ tabsStore.activeTab?.pinned ? '取消固定' : '固定' }}
              </a-menu-item>

              <a-menu-item key="fullscreen">
                <template #icon>
                  <ExpandOutlined v-if="!appStore.isFullscreen" />
                  <CompressOutlined v-else />
                </template>
                {{ appStore.isFullscreen ? '退出全屏' : '内容全屏' }}
              </a-menu-item>

              <a-menu-item key="openNewWindow">
                <template #icon>
                  <ExportOutlined />
                </template>
                新窗口打开
              </a-menu-item>

              <a-menu-divider />

              <a-menu-item key="closeCurrent" :disabled="menuDisabledStates.closeCurrent">
                <template #icon>
                  <CloseOutlined />
                </template>
                关闭当前
              </a-menu-item>

              <a-menu-item key="closeLeft" :disabled="menuDisabledStates.closeLeft">
                <template #icon>
                  <VerticalRightOutlined />
                </template>
                关闭左侧
              </a-menu-item>

              <a-menu-item key="closeRight" :disabled="menuDisabledStates.closeRight">
                <template #icon>
                  <VerticalLeftOutlined />
                </template>
                关闭右侧
              </a-menu-item>

              <a-menu-item key="closeOthers" :disabled="menuDisabledStates.closeOthers">
                <template #icon>
                  <VerticalAlignMiddleOutlined />
                </template>
                关闭其他
              </a-menu-item>

              <a-menu-item key="closeAll" :disabled="menuDisabledStates.closeAll">
                <template #icon>
                  <SwapOutlined />
                </template>
                关闭全部
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <a-button type="text" class="custom-btn" @click="handleLayoutSwitch">
          <ExpandOutlined v-if="!appStore.isFullscreen" style="font-size: 10px;" />
          <CompressOutlined v-else style="font-size: 10px;" />
        </a-button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <a-dropdown v-model:visible="contextMenuVisible" :trigger="[]" :overlayStyle="{
      position: 'fixed',
      left: contextMenuPosition.x + 'px',
      top: contextMenuPosition.y + 'px',
      zIndex: 9999
    }">
      <div style="position: fixed; pointer-events: none;"></div>

      <template #overlay>
        <a-menu @click="handleContextMenuClick">
          <a-menu-item key="refresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-menu-item>

          <a-menu-item key="togglePin" :disabled="contextMenuTab?.path === HOME_PATH">
            <template #icon>
              <PushpinOutlined :rotate="-45" v-if="!contextMenuTab?.pinned" />
              <PushpinFilled :rotate="-45" v-else />
            </template>
            {{ contextMenuTab?.pinned ? '取消固定' : '固定' }}
          </a-menu-item>

          <a-menu-item key="fullscreen">
            <template #icon>
              <ExpandOutlined v-if="!appStore.isFullscreen" />
              <CompressOutlined v-else />
            </template>
            {{ appStore.isFullscreen ? '退出全屏' : '内容全屏' }}
          </a-menu-item>

          <a-menu-item key="openNewWindow">
            <template #icon>
              <ExportOutlined />
            </template>
            新窗口打开
          </a-menu-item>

          <a-menu-divider />

          <a-menu-item key="closeCurrent" :disabled="contextMenuDisabledStates.closeCurrent">
            <template #icon>
              <CloseOutlined />
            </template>
            关闭当前
          </a-menu-item>

          <a-menu-item key="closeLeft" :disabled="contextMenuDisabledStates.closeLeft">
            <template #icon>
              <VerticalRightOutlined />
            </template>
            关闭左侧
          </a-menu-item>

          <a-menu-item key="closeRight" :disabled="contextMenuDisabledStates.closeRight">
            <template #icon>
              <VerticalLeftOutlined />
            </template>
            关闭右侧
          </a-menu-item>

          <a-menu-item key="closeOthers" :disabled="contextMenuDisabledStates.closeOthers">
            <template #icon>
              <VerticalAlignMiddleOutlined />
            </template>
            关闭其他
          </a-menu-item>

          <a-menu-item key="closeAll" :disabled="contextMenuDisabledStates.closeAll">
            <template #icon>
              <SwapOutlined />
            </template>
            关闭全部
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore, useAppStore, useThemeStore } from '@/stores'
import { theme } from 'ant-design-vue'
import { VueDraggable } from 'vue-draggable-plus'
import { HOME_PATH } from '@/constants/routes'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const appStore = useAppStore()
const themeStore = useThemeStore()
const { token } = theme.useToken()

// 模板引用
const tabsScrollArea = ref(null)
const tabsList = ref(null)

// 悬停状态管理
const hoveredTabPath = ref(null)

// 滚动按钮状态
const showScrollButtons = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuTab = ref(null)
const contextMenuPosition = ref({ x: 0, y: 0 })

// 拖拽相关
const draggableTabsList = computed({
  get: () => tabsStore.activeTabs,
  set: (newOrder) => {
    tabsStore.reorderTabs(newOrder)
  }
})

// 拖拽事件处理
const onDragStart = (evt) => {
  // 拖拽开始时的处理
  console.log('拖拽开始:', evt)
}

const onDragEnd = (evt) => {
  // 拖拽结束时的处理
  console.log('拖拽结束:', evt)
  // 拖拽结束后重新检查滚动状态
  nextTick(() => {
    checkScrollState()
  })
}

// 检查滚动状态
const checkScrollState = () => {
  if (!tabsScrollArea.value || !tabsList.value) return

  const scrollArea = tabsScrollArea.value
  const scrollWidth = scrollArea.scrollWidth
  const clientWidth = scrollArea.clientWidth
  const scrollLeft = scrollArea.scrollLeft

  // 判断是否需要显示滚动按钮
  showScrollButtons.value = scrollWidth > clientWidth

  // 判断左右滚动按钮的可用状态
  // 添加1像素的容差值来处理浮点数精度问题
  canScrollLeft.value = scrollLeft > 1
  canScrollRight.value = scrollLeft < (scrollWidth - clientWidth - 1)
}

// 监听全局点击事件，点击其他地方时隐藏菜单
onMounted(() => {
  tabsStore.initTabs()
  // 添加当前路由为页签（首页已在 initTabs 中添加，无需重复添加）
  if (route.path && route.path !== HOME_PATH) {
    tabsStore.addTab(route)
  }

  // 初始化滚动状态检查
  nextTick(() => {
    checkScrollState()
    // 监听滚动区域的滚动事件
    if (tabsScrollArea.value) {
      tabsScrollArea.value.addEventListener('scroll', checkScrollState)
    }
  })

  // 添加全局事件监听
  document.addEventListener('click', hideContextMenu)
  document.addEventListener('contextmenu', hideContextMenu)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
  document.removeEventListener('contextmenu', hideContextMenu)
})

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath) {
    tabsStore.addTab(route)
    // 路由变化时也需要滚动到激活页签
    nextTick(() => {
      scrollToActiveTab()
      checkScrollState()
    })
  }
}, { immediate: true })

// 监听页签变化，更新滚动状态
watch(() => tabsStore.activeTabs.length, () => {
  nextTick(() => {
    checkScrollState()
  })
})

// 计算下拉菜单项的禁用状态
const menuDisabledStates = computed(() => {
  const currentIndex = tabsStore.activeTabIndex
  const currentTab = tabsStore.activeTab

  //判断当前页签是否可关闭
  const isCurrentClosable = currentTab?.closable && !currentTab?.pinned

  // 检查左侧是否有可关闭的页签
  const hasClosableLeftTabs = tabsStore.activeTabs
    .slice(0, currentIndex)
    .some(tab => tab.closable && !tab.pinned)

  // 检查右侧是否有可关闭的页签
  const hasClosableRightTabs = tabsStore.activeTabs
    .slice(currentIndex + 1)
    .some(tab => tab.closable && !tab.pinned)

  // 检查是否有其他可关闭的页签
  const hasOtherClosableTabs = tabsStore.activeTabs
    .filter(tab => tab.path !== currentTab?.path)
    .some(tab => tab.closable && !tab.pinned)

  // 检查是否有任何可关闭的页签
  const hasAnyClosableTabs = tabsStore.activeTabs
    .some(tab => tab.closable && !tab.pinned)

  return {
    closeLeft: !hasClosableLeftTabs,
    closeRight: !hasClosableRightTabs,
    closeOthers: !hasOtherClosableTabs,
    closeAll: !hasAnyClosableTabs,
    closeCurrent: !isCurrentClosable
  }
})

// 页签点击事件
const handleTabClick = (tab) => {
  tabsStore.setActiveTab(tab.path)
  router.push(tab.path)
  // 滚动到激活的页签
  nextTick(() => {
    scrollToActiveTab()
  })
}

// 滚动到激活的页签
const scrollToActiveTab = () => {
  if (!tabsScrollArea.value || !tabsList.value) return

  const activeTabElement = tabsList.value.querySelector('.tab-item.active')
  if (!activeTabElement) return

  const scrollContainer = tabsScrollArea.value
  const containerWidth = scrollContainer.clientWidth
  const currentScrollLeft = scrollContainer.scrollLeft
  const tabLeft = activeTabElement.offsetLeft
  const tabWidth = activeTabElement.offsetWidth
  const tabRight = tabLeft + tabWidth

  // 计算可视区域的边界
  const visibleLeft = currentScrollLeft
  const visibleRight = currentScrollLeft + containerWidth

  // 预留一些边距，避免页签紧贴边缘
  const margin = 50

  let targetScrollLeft = currentScrollLeft

  // 如果页签在可视区域左侧外面，滚动使其显示在左侧
  if (tabLeft < visibleLeft) {
    targetScrollLeft = Math.max(0, tabLeft - margin)
  }
  // 如果页签在可视区域右侧外面，滚动使其显示在右侧
  else if (tabRight > visibleRight) {
    targetScrollLeft = tabRight - containerWidth + margin
  }

  // 只有需要滚动时才执行滚动
  if (targetScrollLeft !== currentScrollLeft) {
    scrollContainer.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    })
  }
}

// 左滚动按钮点击事件
const scrollLeft = () => {
  if (!tabsScrollArea.value) return

  const scrollAmount = 400 // 每次滚动的距离
  const currentScrollLeft = tabsScrollArea.value.scrollLeft

  tabsScrollArea.value.scrollTo({
    left: Math.max(0, currentScrollLeft - scrollAmount),
    behavior: 'smooth'
  })

  // 滚动完成后检查状态
  setTimeout(() => {
    checkScrollState()
  }, 300)
}

// 右滚动按钮点击事件
const scrollRight = () => {
  if (!tabsScrollArea.value) return

  const scrollAmount = 400 // 每次滚动的距离
  const currentScrollLeft = tabsScrollArea.value.scrollLeft
  const maxScrollLeft = tabsScrollArea.value.scrollWidth - tabsScrollArea.value.clientWidth

  tabsScrollArea.value.scrollTo({
    left: Math.min(maxScrollLeft, currentScrollLeft + scrollAmount),
    behavior: 'smooth'
  })

  // 滚动完成后检查状态
  setTimeout(() => {
    checkScrollState()
  }, 300)
}

// 页签关闭事件
const handleTabClose = (path) => {
  tabsStore.removeTab(path)

  // 如果关闭的是当前页签，需要跳转到新的激活页签
  if (path === route.path && tabsStore.activeTabPath !== path) {
    router.push(tabsStore.activeTabPath)
  }

  // 关闭页签后滚动到新的激活页签
  nextTick(() => {
    scrollToActiveTab()
  })
}

// 下拉菜单点击事件
const handleMenuClick = ({ key }) => {
  const currentPath = tabsStore.activeTabPath

  switch (key) {
    case 'refresh':
      appStore.triggerRefresh()
      break

    case 'togglePin':
      tabsStore.toggleTabPin(currentPath)
      break

    case 'fullscreen':
      handleLayoutSwitch()
      break

    case 'openNewWindow':
      handleOpenNewWindow(currentPath)
      break

    case 'closeCurrent':
      tabsStore.removeTab(currentPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeLeft':
      tabsStore.closeLeftTabs(currentPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeRight':
      tabsStore.closeRightTabs(currentPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeOthers':
      tabsStore.closeOtherTabs(currentPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeAll':
      tabsStore.closeAllTabs()
      if (tabsStore.activeTabPath !== currentPath) {
        router.push(tabsStore.activeTabPath)
      }
      nextTick(() => {
        scrollToActiveTab()
      })
      break
  }
}

// 打开新窗口
const handleOpenNewWindow = (path) => {
  window.open(path, '_blank')
  tabsStore.closeAllTabs()
}

// 鼠标滚轮事件
const handleWheel = (e) => {
  // 只有在页签溢出时才处理滚轮事件
  if (!showScrollButtons.value) return

  e.preventDefault()

  const scrollAmount = 400 // 每次滚动的距离
  const currentScrollLeft = tabsScrollArea.value.scrollLeft
  const maxScrollLeft = tabsScrollArea.value.scrollWidth - tabsScrollArea.value.clientWidth

  // 根据滚轮方向决定滚动方向
  // deltaY > 0 表示向下滚动，对应页签向左滚动
  // deltaY < 0 表示向上滚动，对应页签向右滚动
  let targetScrollLeft

  if (e.deltaY > 0) {
    // 向左滚动
    targetScrollLeft = Math.max(0, currentScrollLeft - scrollAmount)
  } else {
    // 向右滚动
    targetScrollLeft = Math.min(maxScrollLeft, currentScrollLeft + scrollAmount)
  }

  // 使用平滑滚动
  tabsScrollArea.value.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth'
  })

  // 滚轮滚动后更新按钮状态
  setTimeout(() => {
    checkScrollState()
  }, 100)
}

// 切换布局
// 处理布局切换
const handleLayoutSwitch = () => {
  // 如果当前不是全屏布局，先记录当前布局再切换为全屏
  if (appStore.layout !== 'fullscreen') {
    appStore.setPrevLayout(appStore.layout) // 假设 store 提供 setPrevLayout 来保存
    appStore.setLayout('fullscreen')
    appStore.toggleFullscreen(true)
  } else {
    // 如果当前已是全屏，则恢复之前保存的布局
    appStore.setLayout(appStore.prevLayout || 'sidebar') // 默认回退 side
    appStore.toggleFullscreen(false)
  }
}

// 右键菜单处理
const handleTabRightClick = (event, tab) => {
  event.preventDefault()
  event.stopPropagation()

  // 设置右键菜单的目标页签
  contextMenuTab.value = tab

  // 设置菜单位置
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }

  // 显示菜单
  contextMenuVisible.value = true
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 右键菜单点击事件
const handleContextMenuClick = ({ key }) => {
  const targetPath = contextMenuTab.value?.path

  if (!targetPath) return

  switch (key) {
    case 'refresh':
      // 如果右键的是当前页签，则刷新
      if (targetPath === tabsStore.activeTabPath) {
        appStore.triggerRefresh()
      } else {
        // 如果不是当前页签，先切换到该页签再刷新
        tabsStore.setActiveTab(targetPath)
        router.push(targetPath)
        nextTick(() => {
          appStore.triggerRefresh()
        })
      }
      break

    case 'togglePin':
      tabsStore.toggleTabPin(targetPath)
      break

    case 'fullscreen':
      // 如果右键的不是当前页签，先切换到该页签
      if (targetPath !== tabsStore.activeTabPath) {
        tabsStore.setActiveTab(targetPath)
        router.push(targetPath)
      }
      handleLayoutSwitch()
      break

    case 'openNewWindow':
      handleOpenNewWindow(targetPath)
      break

    case 'closeCurrent':
      tabsStore.removeTab(targetPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeLeft':
      tabsStore.closeLeftTabs(targetPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeRight':
      tabsStore.closeRightTabs(targetPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeOthers':
      tabsStore.closeOtherTabs(targetPath)
      nextTick(() => {
        scrollToActiveTab()
      })
      break

    case 'closeAll':
      tabsStore.closeAllTabs()
      if (tabsStore.activeTabPath !== targetPath) {
        router.push(tabsStore.activeTabPath)
      }
      nextTick(() => {
        scrollToActiveTab()
      })
      break
  }

  // 隐藏菜单
  contextMenuVisible.value = false
}

// 计算右键菜单项的禁用状态
const contextMenuDisabledStates = computed(() => {
  if (!contextMenuTab.value) return {}

  const targetTab = contextMenuTab.value
  const targetIndex = tabsStore.activeTabs.findIndex(tab => tab.path === targetTab.path)

  // 判断目标页签是否可关闭
  const isTargetClosable = targetTab?.closable && !targetTab?.pinned

  // 检查目标页签左侧是否有可关闭的页签
  const hasClosableLeftTabs = tabsStore.activeTabs
    .slice(0, targetIndex)
    .some(tab => tab.closable && !tab.pinned)

  // 检查目标页签右侧是否有可关闭的页签
  const hasClosableRightTabs = tabsStore.activeTabs
    .slice(targetIndex + 1)
    .some(tab => tab.closable && !tab.pinned)

  // 检查是否有其他可关闭的页签
  const hasOtherClosableTabs = tabsStore.activeTabs
    .filter(tab => tab.path !== targetTab?.path)
    .some(tab => tab.closable && !tab.pinned)

  // 检查是否有任何可关闭的页签
  const hasAnyClosableTabs = tabsStore.activeTabs
    .some(tab => tab.closable && !tab.pinned)

  return {
    closeLeft: !hasClosableLeftTabs,
    closeRight: !hasClosableRightTabs,
    closeOthers: !hasOtherClosableTabs,
    closeAll: !hasAnyClosableTabs,
    closeCurrent: !isTargetClosable
  }
})
</script>

<style scoped lang="scss">
.tabs-view {
  border-top: 1px solid v-bind('token.colorFillSecondary');
  border-bottom: 1px solid v-bind('token.colorFillSecondary');
  position: relative;
  background: v-bind('token.colorBgContainer');
  //页签阴影效果
  box-shadow: v-bind('themeStore.baseConfig.tabShadow ? "0 2px 4px rgba(0, 0, 0, 0.08)" : "none"');

  .tabs-container {
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;

    .left-right-common {
      height: 100%;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      min-width: 0;
    }

    // 左侧区域
    .tabs-left-area {
      box-shadow: v-bind('themeStore.baseConfig.tabShadow ? "4px 0 4px rgba(0, 0, 0, 0.08)" : "none"');
    }

    // 中间区域 - 页签显示区
    .tabs-center-area {
      flex: 1;
      min-width: 0;
      overflow: hidden;

      .tabs-scroll-area {
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        cursor: default;
        height: 100%;
        padding: 2px 0;

        &:active {
          cursor: grabbing;
        }

        // 隐藏滚动条但保持滚动功能
        &::-webkit-scrollbar {
          display: none;
        }

        -ms-overflow-style: none;
        scrollbar-width: none;

        .tabs-list {
          display: flex;
          align-items: center;
          height: 100%;
          white-space: nowrap;
          min-width: max-content;
          padding: 0 8px;
        }

        .tab-item {
          display: flex;
          align-items: center;
          height: $tab-height;
          padding: 0 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
          margin: 0 2px;
          border-radius: v-bind('themeStore.baseConfig.borderRadius + "px"');
          background: transparent;

          &:not(.active):not(:has(+ .active)):not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 30%;
            transform: translateX(-50%);
            width: 1px;
            height: 16px;
            background: v-bind('token.colorFill');
            border-radius: 2px;
            transition: all 0.2s;
          }

          .tab-content {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
          }

          .tab-title {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: all 0.2s;
          }

          .tab-close {
            transition: all 0.2s;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-left: 5px;
            font-size: 12px;
            color: v-bind('token.colorText');

            &:hover {
              background: v-bind('appStore.themeMode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"');
              color: v-bind('token.colorText');
            }
          }

          // 悬停效果
          &:hover {
            background: v-bind('appStore.themeMode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"');
          }

          // 激活状态
          &.active {
            background: v-bind('token.colorPrimary + "12"');
            color: v-bind('token.colorPrimary');
            border: 1px dashed v-bind('token.colorPrimary');

            // 激活状态下的关闭按钮样式
            .tab-close {
              color: v-bind('token.colorPrimary');

              &:hover {
                background: v-bind('appStore.themeMode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"');
              }
            }
          }

          // 固定页签样式
          &.pinned {
            .tab-pin-icon {
              transition: all 0.2s;
            }

            &:hover {
              .tab-pin-icon {
                transform: scale(1.1);
              }
            }
          }

          .tab-icon {
            margin-right: 4px;
            font-size: 14px;
          }

          .tab-pin-icon {
            font-size: 12px;
            margin-left: 4px;
          }
        }
      }
    }

    // 右侧区域
    .tabs-right-area {
      box-shadow: v-bind('themeStore.baseConfig.tabShadow ? "-4px 0 4px rgba(0, 0, 0, 0.08)" : "none"');
    }

    :where(.custom-btn) {
      opacity: 0.8;
      height: 100%;
      width: 100%;
      padding: 4px 12px;
      border-radius: 0;
      border-left: 1px solid v-bind('token.colorBorderSecondary');
      border-right: 1px solid v-bind('token.colorBorderSecondary');
    }

    .tabs-fade-move,
    .tabs-fade-enter-active,
    .tabs-fade-leave-active {
      transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
    }

    .tabs-fade-enter-from,
    .tabs-fade-leave-to {
      opacity: 0;
      transform: scaleY(0.01) translate(30px, 0);
    }

    .tabs-fade-leave-active {
      position: absolute;
    }
  }
}
</style>