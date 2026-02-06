import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 倒计时Hook
 * 用于实时更新剩余时长
 */
export function useCountdown(dataSource) {
  const timer = ref(null)
  
  // 格式化剩余时长
  const formatRemaining = (seconds) => {
    if (seconds <= 0) {
      return '已过期'
    }
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}小时${minutes}分${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    } else {
      return `${secs}秒`
    }
  }
  
  // 启动倒计时
  const startCountdown = () => {
    timer.value = setInterval(() => {
      dataSource.value.forEach(item => {
        if (item.remainingSeconds > 0) {
          item.remainingSeconds--
        }
      })
    }, 1000)
  }
  
  // 停止倒计时
  const stopCountdown = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }
  
  onMounted(() => {
    startCountdown()
  })
  
  onUnmounted(() => {
    stopCountdown()
  })
  
  return {
    formatRemaining,
    startCountdown,
    stopCountdown
  }
}
