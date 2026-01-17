import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generate } from '@ant-design/colors'
import { COLOR_PRESETS, rgbToHex } from '@/utils'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const primaryColor = ref(COLOR_PRESETS[0].color) // 默认使用第一个预设色
  const colorPresets = ref(COLOR_PRESETS)
  const customColors = ref([])
  const colorMode = ref('preset') // 'preset' | 'custom'
  const selectedPresetIndex = ref(0)
  const colorPalette = ref([])
  
  // 基础配置状态
  const baseConfig = ref({
    fontSize: 14,
    wireframe: false,
    borderRadius: 4,
    tabShadow: false,
    maskMode: true, //分为点击蒙层自动关闭和不关闭两种模式，true为点击蒙层自动关闭
  })

  // 计算属性
  const primaryColorHex = computed(() => {
    return rgbToHex(primaryColor.value)
  })
  
  const currentColorPalette = computed(() => {
    if (colorPalette.value.length === 0) {
      return generate(rgbToHex(primaryColor.value))
    }
    return colorPalette.value
  })
  
  const allAvailableColors = computed(() => {
    return [
      ...colorPresets.value.map(preset => preset.color),
      ...customColors.value
    ]
  })

  // 方法
  const setPrimaryColor = (color, mode = 'preset', presetIndex = -1) => {
    primaryColor.value = color
    colorMode.value = mode
    
    if (mode === 'preset' && presetIndex >= 0) {
      selectedPresetIndex.value = presetIndex
    }
    
    // 生成新的色板
    generateColorPalette()
  }
  
  const selectPresetColor = (index) => {
    if (index >= 0 && index < colorPresets.value.length) {
      const preset = colorPresets.value[index]
      setPrimaryColor(preset.color, 'preset', index)
    }
  }
  
  const setCustomColor = (color) => {
    // 添加到自定义颜色历史（避免重复）
    if (!customColors.value.includes(color)) {
      customColors.value.unshift(color)
      // 限制自定义颜色历史数量
      if (customColors.value.length > 10) {
        customColors.value = customColors.value.slice(0, 10)
      }
    }
    
    setPrimaryColor(color, 'custom')
  }
  
  const generateColorPalette = () => {
    try {
      const hexColor = rgbToHex(primaryColor.value)
      colorPalette.value = generate(hexColor)
    } catch (error) {
      console.error('生成颜色色板失败:', error)
      // 使用默认色板
      colorPalette.value = generate('#1890ff')
    }
  }
  
  const resetToDefault = () => {
    setPrimaryColor(COLOR_PRESETS[0].color, 'preset', 0)
  }
  
  const clearCustomColors = () => {
    customColors.value = []
  }
  
  // 基础配置方法
  const setBaseConfig = (config) => {
    baseConfig.value = { ...baseConfig.value, ...config }
  }
  
  const setFontSize = (size) => {
    baseConfig.value.fontSize = Math.max(14, Math.min(20, size))
  }
  
  const setWireframe = (value) => {
    baseConfig.value.wireframe = value
  }
  
  const setBorderRadius = (radius) => {
    baseConfig.value.borderRadius = Math.max(0, Math.min(16, radius))
  }

  // 处理页签阴影效果切换
  const setTabShadow = (value) => {
    baseConfig.value.tabShadow = value
  }

  const setMaskMode = (value) => {
    baseConfig.value.maskMode = value
  }

  return {
    // 状态
    primaryColor,
    colorPresets,
    customColors,
    colorMode,
    selectedPresetIndex,
    colorPalette,
    baseConfig,
    // 计算属性
    primaryColorHex,
    currentColorPalette,
    allAvailableColors,
    // 方法
    setPrimaryColor,
    selectPresetColor,
    setCustomColor,
    generateColorPalette,
    resetToDefault,
    clearCustomColors,
    setBaseConfig,
    setFontSize,
    setTabShadow,
    setWireframe,
    setBorderRadius,
    setMaskMode,
  }
}, {
  // 持久化配置
  persist: {
    key: 'theme-store',
    storage: localStorage,
    paths: ['primaryColor', 'customColors', 'colorMode', 'selectedPresetIndex', 'baseConfig']
  }
})