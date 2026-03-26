<template>
  <div class="dynamic-config-input">
    <!-- 布尔型 - Switch开关 -->
    <a-switch 
      v-if="type === 'boolean'"
      v-model:checked="booleanValue"
      checked-children="启用" 
      un-checked-children="禁用"
      @change="handleChange" />
    
    <!-- 字符串 - Input输入框 -->
    <a-input 
      v-else-if="type === 'string'"
      v-model:value="localValue"
      :placeholder="meta?.placeholder || '请输入'"
      @change="handleChange" />
    
    <!-- 长文本 - Textarea多行输入 -->
    <a-textarea 
      v-else-if="type === 'text'"
      v-model:value="localValue"
      :rows="meta?.rows || 4"
      :placeholder="meta?.placeholder || '请输入'"
      @change="handleChange" />
    
    <!-- 数字 - InputNumber数字输入 -->
    <a-input-number 
      v-else-if="type === 'number'"
      v-model:value="numberValue"
      :min="meta?.min"
      :max="meta?.max"
      :placeholder="meta?.placeholder || '请输入'"
      style="width: 100%"
      @change="handleChange">
      <template v-if="meta?.unit" #addonAfter>
        {{ meta.unit }}
      </template>
    </a-input-number>
    
    <!-- 下拉选择 - Select -->
    <a-select 
      v-else-if="type === 'select'"
      v-model:value="selectValue"
      :mode="meta?.mode || 'single'"
      :placeholder="meta?.placeholder || '请选择'"
      :allowClear="true"
      style="width: 100%"
      @change="handleChange">
      <a-select-option 
        v-for="opt in meta?.options" 
        :key="opt.value" 
        :value="opt.value">
        {{ opt.label }}
      </a-select-option>
    </a-select>
    
    <!-- JSON对象 - Textarea with JSON格式化 -->
    <a-textarea 
      v-else-if="type === 'json'"
      v-model:value="localValue"
      :rows="6"
      placeholder='{"key": "value"}'
      @change="handleChange" />
    
    <!-- 默认 - Input -->
    <a-input 
      v-else
      v-model:value="localValue"
      placeholder="请输入"
      @change="handleChange" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: ''
  },
  type: {
    type: String,
    required: true
  },
  meta: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 本地值
const localValue = ref(props.modelValue)

// 布尔值处理
const booleanValue = computed({
  get: () => {
    if (typeof props.modelValue === 'boolean') {
      return props.modelValue
    }
    return props.modelValue === 'true' || props.modelValue === true
  },
  set: (val) => {
    localValue.value = val ? 'true' : 'false'
  }
})

// 数字值处理
const numberValue = computed({
  get: () => {
    const num = Number(props.modelValue)
    return isNaN(num) ? undefined : num
  },
  set: (val) => {
    localValue.value = val !== undefined && val !== null ? String(val) : ''
  }
})

// Select值处理（支持多选）
const selectValue = computed({
  get: () => {
    if (props.meta?.mode === 'multiple' || props.meta?.mode === 'tags') {
      // 多选模式：返回数组
      if (Array.isArray(props.modelValue)) {
        return props.modelValue
      }
      return props.modelValue ? props.modelValue.split(',') : []
    }
    // 单选模式：返回字符串
    return props.modelValue
  },
  set: (val) => {
    if (props.meta?.mode === 'multiple' || props.meta?.mode === 'tags') {
      // 多选模式：转为逗号分隔的字符串
      localValue.value = Array.isArray(val) ? val.join(',') : val
    } else {
      // 单选模式：直接赋值
      localValue.value = val
    }
  }
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
}, { immediate: true })

// 处理值变化
const handleChange = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}
</script>

<style scoped lang="scss">
.dynamic-config-input {
  width: 100%;
}
</style>
