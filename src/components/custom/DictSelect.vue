<template>
  <a-select
    v-bind="$attrs"
    :value="modelValue"
    :loading="loading"
    :options="options"
    @update:value="handleChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useDict } from '@/utils/useDict'

const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  // 字典类型
  dictType: {
    type: String,
    required: true
  },
  // 值类型转换（string | number）
  valueType: {
    type: String,
    default: 'string',
    validator: (value) => ['string', 'number'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 加载字典数据
const { dict, loading } = useDict(props.dictType)

// 转换为Select组件的options格式
const options = computed(() => {
  return dict.value.map(item => ({
    label: item.label,
    value: props.valueType === 'number' ? Number(item.value) : item.value
  }))
})

// 值变化处理
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
