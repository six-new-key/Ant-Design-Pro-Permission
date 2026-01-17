<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      zIndex: 9999
    }"
    @click.stop
  >
    <div
      v-for="item in menuItems"
      :key="item.key"
      class="context-menu-item"
      :class="{ 'context-menu-item--disabled': item.disabled }"
      @click="!item.disabled && handleItemClick(item)"
    >
      <t-icon :name="item.icon" class="context-menu-icon" />
      <span>{{ item.label }}</span>
    </div>
    <div v-if="hasDivider" class="context-menu-divider"></div>
    <div
      v-for="item in bottomMenuItems"
      :key="item.key"
      class="context-menu-item"
      :class="{ 'context-menu-item--disabled': item.disabled }"
      @click="!item.disabled && handleItemClick(item)"
    >
      <t-icon :name="item.icon" class="context-menu-icon" />
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  menuItems: {
    type: Array,
    default: () => []
  },
  bottomMenuItems: {
    type: Array,
    default: () => []
  }
})

// Emits定义
const emit = defineEmits(['close', 'item-click'])

// 计算属性
const hasDivider = computed(() => {
  return props.menuItems.length > 0 && props.bottomMenuItems.length > 0
})

// 处理菜单项点击
const handleItemClick = (item) => {
  emit('item-click', item)
  emit('close')
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (props.visible) {
    emit('close')
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 右键菜单样式 */
.context-menu {
  min-width: 160px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--td-text-color-primary);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.context-menu-item:hover:not(.context-menu-item--disabled) {
  background: var(--td-bg-color-container-hover);
}

.context-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--td-text-color-disabled);
}

.context-menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

.context-menu-divider {
  height: 1px;
  background: var(--td-border-level-1-color);
  margin: 4px 0;
}
</style>