<template>
  <a-form-item label="选择模板（可选）">
    <a-select 
      v-model:value="selectedTemplateId" 
      placeholder="选择模板快速填充"
      allow-clear
      style="width: 100%"
      @change="handleTemplateSelect">
      <a-select-option 
        v-for="tpl in templateList" 
        :key="tpl.id" 
        :value="tpl.id">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>{{ tpl.name }}</span>
          <a-space :size="4">
            <a-tag v-if="tpl.isSystem === 1" color="blue" size="small">系统</a-tag>
            <a-tag :color="getTypeColor(tpl.type)" size="small">
              {{ getTypeLabel(tpl.type) }}
            </a-tag>
          </a-space>
        </div>
      </a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTemplate } from '@/api/announcement/template'
import { getTypeLabel, getTypeColor } from '../constants/announcementTypes'
import { replaceTemplateVariables } from '../utils/templateVariables'

const props = defineProps({
  modelValue: Number,
  templateList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'template-selected'])

const selectedTemplateId = ref(props.modelValue)

// 监听外部变化
watch(() => props.modelValue, (newVal) => {
  selectedTemplateId.value = newVal
})

// 选择模板
const handleTemplateSelect = async (templateId) => {
  if (!templateId) {
    emit('update:modelValue', null)
    emit('template-selected', null)
    return
  }
  
  try {
    // 调用使用模板接口（增加使用次数）
    const res = await useTemplate(templateId)
    const template = res.data
    
    // 替换变量
    const title = replaceTemplateVariables(template.title)
    const content = replaceTemplateVariables(template.content)
    
    emit('update:modelValue', templateId)
    emit('template-selected', {
      title,
      content,
      type: template.type,
      level: template.level
    })
  } catch (error) {
    console.error('使用模板失败:', error)
  }
}

// 移除旧的替换函数
</script>
