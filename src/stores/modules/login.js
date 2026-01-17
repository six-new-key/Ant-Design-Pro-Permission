import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DYNAMIC_BG_TYPES } from '@/utils'

export const useLoginStore = defineStore('login', () => {
  // 状态定义
  const backgroundMode = ref('static') // 'dynamic' | 'static'
  const formPosition = ref('right') // 'left' | 'center' | 'right'
  const selectedStaticBg = ref('bg1') // 'bg1' | 'bg2' | 'bg3'
  const selectedDynamicBg = ref(DYNAMIC_BG_TYPES.AESTHETIC_FLUID) // 动态背景类型
  const selectedVisualQuality = ref('non-glass') // 'glass' | 'non-glass'
  
  // 静态背景图片列表
  const staticBackgrounds = ref([
    {
      id: 'bg1',
      name: '薄荷清晨',
      url: '/images/login/login-1.webp',
    },
    {
      id: 'bg2', 
      name: '焦糖日落',
      url: '/images/login/login-2.webp',
    },
    {
      id: 'bg3',
      name: '星空絮语', 
      url: '/images/login/login-3.webp',
    },
    {
      id: 'bg4',
      name: '复古唱片',
      url: '/images/login/login-4.webp', 
    },
    {
      id: 'bg5',
      name: '樱花雾雨',
      url: '/images/login/login-5.webp',
    },
    {
      id: 'bg6',
      name: '森系苔藓',
      url: '/images/login/login-6.webp',
    }
  ])
  
  // 动态背景类型列表
  const dynamicBackgrounds = ref([
    {
      id: DYNAMIC_BG_TYPES.AESTHETIC_FLUID,
      name: '优美流动',
    },
    {
      id: DYNAMIC_BG_TYPES.CHAOS_WAVES,
      name: '混沌波浪',
    },
    {
      id: DYNAMIC_BG_TYPES.SWIRLING_CURVES,
      name: '卷卷曲线',
    },
    {
      id: DYNAMIC_BG_TYPES.BLUR_GRADIENT,
      name: '模糊渐变',
    },
    {
      id: DYNAMIC_BG_TYPES.ABSTRACT_SHAPE,
      name: '抽象曲线',
    },
    {
      id: DYNAMIC_BG_TYPES.BLUR_DOT,
      name: '模糊圆点',
    }
  ])

  //视觉质感风格，玻璃态和非玻璃态
  const visualQualities = ref([
    {
      id: 'glass',
      name: '玻璃态'
    },
    {
      id: 'non-glass',
      name: '非玻璃态'
    }
  ])
  
  // 计算属性：当前背景URL
  const currentBackgroundUrl = computed(() => {
    if (backgroundMode.value === 'static') {
      const bg = staticBackgrounds.value.find(bg => bg.id === selectedStaticBg.value)
      return bg ? bg.url : staticBackgrounds.value[0].url
    }
    return null
  })
  
  // 计算属性：是否为动态背景
  const isDynamicBackground = computed(() => backgroundMode.value === 'dynamic')
  
  // 计算属性：是否为静态背景
  const isStaticBackground = computed(() => backgroundMode.value === 'static')
  
  // 计算属性：表单容器样式类
  const formContainerClass = computed(() => {
    const classes = ['login-form-container']
    
    if (isStaticBackground.value) {
      classes.push(`form-position-${formPosition.value}`)
    } else {
      classes.push('form-position-center')
    }
    
    return classes.join(' ')
  })
  
  // Actions
  const setBackgroundMode = (mode) => {
    backgroundMode.value = mode
    // 如果切换到动态背景，强制表单居中
    if (mode === 'dynamic') {
      setFormPosition('center')
    }
  }
  
  const setFormPosition = (position) => {
    // 只有在静态背景模式下才允许调整表单位置
    if (isStaticBackground.value) {
      formPosition.value = position
    }
  }
  
  const setSelectedStaticBg = (bgId) => {
    selectedStaticBg.value = bgId
  }
  
  const setSelectedDynamicBg = (bgType) => {
    selectedDynamicBg.value = bgType
  }
  
  // 主题切换 - 占位符
  const setThemeMode = (mode) => {
    console.log('主题切换功能待实现', mode)
  }
  
  // 语言切换 - 占位符
  const setLanguage = (lang) => {
    console.log('语言切换功能待实现', lang)
  }
  
  // 重置所有设置为默认值
  const resetToDefaults = () => {
    backgroundMode.value = 'static'
    formPosition.value = 'right'
    selectedStaticBg.value = 'bg1'
    selectedDynamicBg.value = DYNAMIC_BG_TYPES.AESTHETIC_FLUID
  }
  
  // 获取当前配置的摘要
  const getCurrentConfig = () => {
    return {
      backgroundMode: backgroundMode.value,
      formPosition: formPosition.value,
      selectedStaticBg: selectedStaticBg.value,
      selectedDynamicBg: selectedDynamicBg.value,
      currentBackgroundUrl: currentBackgroundUrl.value
    }
  }

  // 视觉质感风格切换
  const setVisualQuality = (quality) => {
    selectedVisualQuality.value = quality
  }
  
  return {
    // State
    backgroundMode,
    formPosition,
    selectedStaticBg,
    selectedDynamicBg,
    staticBackgrounds,
    dynamicBackgrounds,
    visualQualities,
    selectedVisualQuality,
    
    // Computed
    currentBackgroundUrl,
    isDynamicBackground,
    isStaticBackground,
    formContainerClass,
    
    // Actions
    setBackgroundMode,
    setFormPosition,
    setSelectedStaticBg,
    setSelectedDynamicBg,
    setThemeMode, // 占位符
    setLanguage, // 占位符
    resetToDefaults,
    getCurrentConfig,
    setVisualQuality,
  }
}, {
  persist: {
    storage: localStorage,
    paths: [
      'backgroundMode',
      'formPosition',
      'selectedStaticBg',
      'selectedDynamicBg',
      'selectedVisualQuality'
    ]
  }
})