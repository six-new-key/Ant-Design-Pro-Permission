<template>
  <div class="page-template">
    <a-card :title="title">
      <a-result
        status="info"
        :title="title"
        :sub-title="`这是${title}页面，功能正在开发中...`"
      >
        <template #extra>
          <a-button type="primary">返回首页</a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '页面'
  }
})
</script>