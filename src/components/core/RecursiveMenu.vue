<template>
  <!-- 有子菜单的情况 -->
  <a-sub-menu v-if="menuItem.children && menuItem.children.length > 0" :key="menuItem.path">
    <template #icon>
      <component :is="menuItem.meta?.icon" v-if="menuItem.meta?.icon" />
    </template>
    <template #title>{{ menuItem.meta?.title || menuItem.name }}</template>

    <!-- 递归渲染子菜单 -->
    <RecursiveMenu
      v-for="child in menuItem.children"
      :key="child.path"
      :menu-item="child"
    />
  </a-sub-menu>

  <!-- 没有子菜单的情况（叶子节点） -->
  <a-menu-item v-else :key="menuItem.path">
    <template #icon>
      <component :is="menuItem.meta?.icon" v-if="menuItem.meta?.icon" />
    </template>
    
    <!-- 外链（新窗口打开） -->
    <a 
      v-if="menuItem.meta?.isLink" 
      :href="menuItem.meta?.linkUrl" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {{ menuItem.meta?.title || menuItem.name }}
    </a>
    
    <!-- 内部路由或内嵌iframe -->
    <router-link v-else :to="menuItem.path">
      {{ menuItem.meta?.title || menuItem.name }}
    </router-link>
  </a-menu-item>
</template>

<script setup>
/**
 * 递归菜单组件
 * 支持任意层级的菜单渲染
 * 支持外链（新窗口）和内嵌iframe
 */
defineProps({
  menuItem: {
    type: Object,
    required: true
  }
})
</script>
