<template>
  <div class="iframe-container">
    <iframe 
      v-if="iframeUrl" 
      :src="iframeUrl" 
      frameborder="0"
      class="iframe-content"
    ></iframe>
    <a-empty v-else description="未配置iframe地址" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 从路由 meta 中获取 iframe 地址
const iframeUrl = computed(() => route.meta?.iframeUrl || '')
</script>

<style scoped lang="scss">
.iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  .iframe-content {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
