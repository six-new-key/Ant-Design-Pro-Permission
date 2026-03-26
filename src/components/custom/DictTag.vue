<template>
  <a-tag :color="tagColor">
    {{ label }}
  </a-tag>
</template>

<script setup>
import { computed } from 'vue'
import { useDict } from '@/utils/useDict'

const props = defineProps({
  // 字典值
  value: {
    type: [String, Number],
    required: true
  },
  // 字典类型
  dictType: {
    type: String,
    required: true
  },
  // 颜色映射（可选）
  // 格式：{ '1': 'success', '0': 'default' }
  colorMap: {
    type: Object,
    default: () => ({})
  }
})

// 加载字典数据
const { getLabel } = useDict(props.dictType)

// 显示标签
const label = computed(() => {
  return getLabel(props.value)
})

// 标签颜色
const tagColor = computed(() => {
  const valueStr = String(props.value)
  return props.colorMap[valueStr] || 'default'
})
</script>
