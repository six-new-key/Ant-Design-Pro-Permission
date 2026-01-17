<template>
  <div class="slider-captcha" :class="{ 'success': isSuccess, 'failed': isFailed }">
    <!-- 滑块轨道 -->
    <div class="slider-track" ref="trackRef">
      <!-- 成功状态背景 -->
      <div class="success-bg" :style="{ width: successWidth }"></div>
      
      <!-- 滑块文字提示 -->
      <div class="slider-text" :class="{ 'hide': isDragging || isSuccess }">
        {{ sliderText }}
      </div>
      
      <!-- 成功文字 -->
      <div class="success-text" v-if="isSuccess">
        <check-outlined /> 验证成功
      </div>
      
      <!-- 失败文字 -->
      <div class="failed-text" v-if="isFailed">
        <close-outlined /> 验证失败，请重试
      </div>
    </div>
    
    <!-- 滑块按钮 -->
    <div 
      class="slider-button" 
      ref="buttonRef"
      :style="{ left: buttonLeft }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <div class="slider-icon">
        <right-outlined v-if="!isSuccess && !isFailed" />
        <check-outlined v-if="isSuccess" />
        <close-outlined v-if="isFailed" />
      </div>
    </div>
    
    <!-- 刷新按钮 -->
    <div class="refresh-button" @click="handleRefresh" v-if="isFailed">
      <reload-outlined />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RightOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons-vue'

// Props
const props = defineProps({
  sliderText: {
    type: String,
    default: '请拖动滑块完成验证'
  },
  successText: {
    type: String,
    default: '验证成功'
  },
  threshold: {
    type: Number,
    default: 5 // 验证成功的误差范围（像素）
  }
})

// Emits
const emit = defineEmits(['success', 'fail', 'refresh'])

// 响应式数据
const trackRef = ref(null)
const buttonRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const buttonLeft = ref('0px')
const isSuccess = ref(false)
const isFailed = ref(false)
const trackWidth = ref(0)

// 计算属性
const successWidth = computed(() => {
  if (isSuccess.value) {
    return '100%'
  }
  return currentX.value + 'px'
})

// 鼠标按下事件
const handleMouseDown = (e) => {
  if (isSuccess.value || isFailed.value) return
  
  isDragging.value = true
  startX.value = e.clientX
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
}

// 触摸开始事件
const handleTouchStart = (e) => {
  if (isSuccess.value || isFailed.value) return
  
  isDragging.value = true
  startX.value = e.touches[0].clientX
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
  e.preventDefault()
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - startX.value
  updatePosition(deltaX)
}

// 触摸移动事件
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  
  const deltaX = e.touches[0].clientX - startX.value
  updatePosition(deltaX)
}

// 更新位置
const updatePosition = (deltaX) => {
  const maxX = trackWidth.value - 50 // 50是按钮宽度
  currentX.value = Math.max(0, Math.min(deltaX, maxX))
  buttonLeft.value = currentX.value + 'px'
}

// 鼠标释放事件
const handleMouseUp = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  checkSuccess()
}

// 触摸结束事件
const handleTouchEnd = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  checkSuccess()
}

// 检查验证是否成功
const checkSuccess = () => {
  const maxX = trackWidth.value - 50
  const successRange = maxX - props.threshold
  
  if (currentX.value >= successRange) {
    // 验证成功
    isSuccess.value = true
    currentX.value = maxX
    buttonLeft.value = maxX + 'px'
    emit('success')
  } else {
    // 验证失败
    isFailed.value = true
    setTimeout(() => {
      resetSlider()
    }, 1000)
    emit('fail')
  }
}

// 重置滑块
const resetSlider = () => {
  currentX.value = 0
  buttonLeft.value = '0px'
  isSuccess.value = false
  isFailed.value = false
}

// 刷新按钮点击事件
const handleRefresh = () => {
  resetSlider()
  emit('refresh')
}

// 初始化
onMounted(() => {
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateTrackWidth)
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('resize', updateTrackWidth)
})

// 更新轨道宽度
const updateTrackWidth = () => {
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth
  }
}

// 暴露方法给父组件
defineExpose({
  reset: resetSlider
})
</script>

<style scoped lang="scss">
.slider-captcha {
  position: relative;
  width: 100%;
  height: 50px;
  user-select: none;
  
  .slider-track {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f7f9fa;
    border: 1px solid #e4e7ed;
    border-radius: 25px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    
    .success-bg {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, #52c41a, #73d13d);
      border-radius: 25px;
      transition: width 0.3s ease;
    }
    
    .slider-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #909399;
      font-size: 14px;
      font-weight: 500;
      pointer-events: none;
      transition: opacity 0.3s ease;
      
      &.hide {
        opacity: 0;
      }
    }
    
    .success-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
    
    .failed-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #f56c6c;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
  }
  
  .slider-button {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 46px;
    height: 46px;
    background: #fff;
    border-radius: 50%;
    cursor: grab;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
    
    .slider-icon {
      font-size: 16px;
      color: #909399;
      transition: color 0.3s ease;
    }
  }
  
  .refresh-button {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
    font-size: 14px;
    transition: color 0.3s ease;
    z-index: 3;
    
    &:hover {
      color: #1890ff;
    }
  }
  
  // 成功状态
  &.success {
    .slider-track {
      border-color: #52c41a;
    }
    
    .slider-button {
      background: #52c41a;
      
      .slider-icon {
        color: #fff;
      }
    }
  }
  
  // 失败状态
  &.failed {
    .slider-track {
      border-color: #f56c6c;
      background: #fef0f0;
    }
    
    .slider-button {
      background: #f56c6c;
      
      .slider-icon {
        color: #fff;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .slider-captcha {
    height: 45px;
    
    .slider-button {
      width: 41px;
      height: 41px;
      
      .slider-icon {
        font-size: 14px;
      }
    }
    
    .slider-text,
    .success-text,
    .failed-text {
      font-size: 13px;
    }
  }
}
</style>