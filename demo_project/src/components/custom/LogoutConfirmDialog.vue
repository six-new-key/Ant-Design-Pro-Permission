<template>
  <t-dialog v-model:visible="visible" header="退出登录" :width="400" :close-on-overlay-click="false"
    :close-on-esc-keydown="false" placement="center" @confirm="handleConfirm" @close="handleClose" theme="warning"
    body="确认退出登录吗？" />
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// 响应式数据
const isLoading = ref(false)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理关闭
const handleClose = () => {
  if (!isLoading.value) {
    visible.value = false
    emit('cancel')
  }
}

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}
</script>