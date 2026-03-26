<template>
  <a-radio-group
    v-bind="$attrs"
    :value="modelValue"
    @update:value="handleChange"
  >
    <a-radio
      v-for="item in dict"
      :key="item.value"
      :value="valueType === 'number' ? Number(item.value) : item.value"
    >
      {{ item.label }}
    </a-radio>
  </a-radio-group>
</template>

<script setup>
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
const { dict } = useDict(props.dictType)

// 值变化处理
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
