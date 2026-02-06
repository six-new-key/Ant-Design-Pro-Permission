<template>
  <div class="cron-result-wrapper">
    <div class="result-title">最近5次运行时间</div>
    <div class="result-list">
      <div v-if="loading" class="loading">计算结果中...</div>
      <div v-else-if="resultList.length === 0" class="empty">没有达到条件的结果</div>
      <div v-else>
        <div v-for="(item, index) in resultList" :key="index" class="result-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  expression: { type: String, required: true }
})

const loading = ref(false)
const resultList = ref([])
const dayRule = ref('')
const dayRuleSup = ref('')
const dateArr = ref([])

const calculateNextTimes = () => {
  loading.value = true
  resultList.value = []
  
  try {
    const ruleArr = props.expression.split(' ')
    if (ruleArr.length < 6) {
      resultList.value = ['表达式格式错误']
      loading.value = false
      return
    }
    
    let nums = 0
    const resultArr = []
    const nTime = new Date()
    let nYear = nTime.getFullYear()
    let nMonth = nTime.getMonth() + 1
    let nDay = nTime.getDate()
    let nHour = nTime.getHours()
    let nMin = nTime.getMinutes()
    let nSecond = nTime.getSeconds()
    
    getSecondArr(ruleArr[0])
    getMinArr(ruleArr[1])
    getHourArr(ruleArr[2])
    getDayArr(ruleArr[3])
    getMonthArr(ruleArr[4])
    getWeekArr(ruleArr[5])
    getYearArr(ruleArr[6] || '', nYear)
    
    const sDate = dateArr.value[0]
    const mDate = dateArr.value[1]
    const hDate = dateArr.value[2]
    const DDate = dateArr.value[3]
    const MDate = dateArr.value[4]
    const YDate = dateArr.value[5]
    
    let sIdx = getIndex(sDate, nSecond)
    let mIdx = getIndex(mDate, nMin)
    let hIdx = getIndex(hDate, nHour)
    let DIdx = getIndex(DDate, nDay)
    let MIdx = getIndex(MDate, nMonth)
    let YIdx = getIndex(YDate, nYear)
    
    const resetSecond = () => {
      sIdx = 0
      nSecond = sDate[sIdx]
    }
    const resetMin = () => {
      mIdx = 0
      nMin = mDate[mIdx]
      resetSecond()
    }
    const resetHour = () => {
      hIdx = 0
      nHour = hDate[hIdx]
      resetMin()
    }
    const resetDay = () => {
      DIdx = 0
      nDay = DDate[DIdx]
      resetHour()
    }
    const resetMonth = () => {
      MIdx = 0
      nMonth = MDate[MIdx]
      resetDay()
    }
    
    if (nYear !== YDate[YIdx]) resetMonth()
    if (nMonth !== MDate[MIdx]) resetDay()
    if (nDay !== DDate[DIdx]) resetHour()
    if (nHour !== hDate[hIdx]) resetMin()
    if (nMin !== mDate[mIdx]) resetSecond()
    
    // 简化版循环，只取5个结果
    for (let Yi = YIdx; Yi < YDate.length && nums < 5; Yi++) {
      const YY = YDate[Yi]
      for (let Mi = MIdx; Mi < MDate.length && nums < 5; Mi++) {
        const MM = MDate[Mi] < 10 ? '0' + MDate[Mi] : MDate[Mi]
        for (let Di = DIdx; Di < DDate.length && nums < 5; Di++) {
          let DD = DDate[Di]
          const thisDD = DD < 10 ? '0' + DD : DD
          
          if (!checkDate(`${YY}-${MM}-${thisDD} 00:00:00`)) continue
          
          for (let hi = hIdx; hi < hDate.length && nums < 5; hi++) {
            const hh = hDate[hi] < 10 ? '0' + hDate[hi] : hDate[hi]
            for (let mi = mIdx; mi < mDate.length && nums < 5; mi++) {
              const mm = mDate[mi] < 10 ? '0' + mDate[mi] : mDate[mi]
              for (let si = sIdx; si < sDate.length && nums < 5; si++) {
                const ss = sDate[si] < 10 ? '0' + sDate[si] : sDate[si]
                resultArr.push(`${YY}-${MM}-${thisDD} ${hh}:${mm}:${ss}`)
                nums++
                if (nums >= 5) break
              }
              sIdx = 0
            }
            mIdx = 0
          }
          hIdx = 0
        }
        DIdx = 0
      }
      MIdx = 0
    }
    
    resultList.value = resultArr.length > 0 ? resultArr : ['没有达到条件的结果']
  } catch (err) {
    resultList.value = ['表达式格式错误：' + err.message]
  } finally {
    loading.value = false
  }
}

const getIndex = (arr, value) => {
  if (value <= arr[0] || value > arr[arr.length - 1]) {
    return 0
  }
  for (let i = 0; i < arr.length - 1; i++) {
    if (value > arr[i] && value <= arr[i + 1]) {
      return i + 1
    }
  }
  return 0
}

const getOrderArr = (min, max) => {
  const arr = []
  for (let i = min; i <= max; i++) {
    arr.push(i)
  }
  return arr
}

const getAssignArr = (rule) => {
  return rule.split(',').map(v => Number(v)).sort((a, b) => a - b)
}

const getAverageArr = (rule, limit) => {
  const arr = []
  const agArr = rule.split('/')
  let min = Number(agArr[0])
  const step = Number(agArr[1])
  while (min <= limit) {
    arr.push(min)
    min += step
  }
  return arr
}

const getCycleArr = (rule, limit) => {
  const arr = []
  const cycleArr = rule.split('-')
  let min = Number(cycleArr[0])
  let max = Number(cycleArr[1])
  if (min > max) max += limit
  for (let i = min; i <= max; i++) {
    arr.push(i % limit || limit)
  }
  return arr.sort((a, b) => a - b)
}

const getYearArr = (rule, year) => {
  dateArr.value[5] = getOrderArr(year, year + 100)
  if (rule && rule !== '*') {
    if (rule.indexOf('-') >= 0) {
      dateArr.value[5] = getCycleArr(rule, year + 100)
    } else if (rule.indexOf('/') >= 0) {
      dateArr.value[5] = getAverageArr(rule, year + 100)
    } else {
      dateArr.value[5] = getAssignArr(rule)
    }
  }
}

const getMonthArr = (rule) => {
  dateArr.value[4] = getOrderArr(1, 12)
  if (rule.indexOf('-') >= 0) {
    dateArr.value[4] = getCycleArr(rule, 12)
  } else if (rule.indexOf('/') >= 0) {
    dateArr.value[4] = getAverageArr(rule, 12)
  } else if (rule !== '*') {
    dateArr.value[4] = getAssignArr(rule)
  }
}

const getDayArr = (rule) => {
  dateArr.value[3] = getOrderArr(1, 31)
  dayRule.value = ''
  dayRuleSup.value = ''
  if (rule.indexOf('-') >= 0) {
    dateArr.value[3] = getCycleArr(rule, 31)
  } else if (rule.indexOf('/') >= 0) {
    dateArr.value[3] = getAverageArr(rule, 31)
  } else if (rule !== '*' && rule !== '?') {
    dateArr.value[3] = getAssignArr(rule)
  }
}

const getWeekArr = (rule) => {
  // 简化处理，暂不处理复杂的星期规则
}

const getHourArr = (rule) => {
  dateArr.value[2] = getOrderArr(0, 23)
  if (rule.indexOf('-') >= 0) {
    dateArr.value[2] = getCycleArr(rule, 24)
  } else if (rule.indexOf('/') >= 0) {
    dateArr.value[2] = getAverageArr(rule, 23)
  } else if (rule !== '*') {
    dateArr.value[2] = getAssignArr(rule)
  }
}

const getMinArr = (rule) => {
  dateArr.value[1] = getOrderArr(0, 59)
  if (rule.indexOf('-') >= 0) {
    dateArr.value[1] = getCycleArr(rule, 60)
  } else if (rule.indexOf('/') >= 0) {
    dateArr.value[1] = getAverageArr(rule, 59)
  } else if (rule !== '*') {
    dateArr.value[1] = getAssignArr(rule)
  }
}

const getSecondArr = (rule) => {
  dateArr.value[0] = getOrderArr(0, 59)
  if (rule.indexOf('-') >= 0) {
    dateArr.value[0] = getCycleArr(rule, 60)
  } else if (rule.indexOf('/') >= 0) {
    dateArr.value[0] = getAverageArr(rule, 59)
  } else if (rule !== '*') {
    dateArr.value[0] = getAssignArr(rule)
  }
}

const checkDate = (value) => {
  const time = new Date(value)
  const format = formatDate(time)
  return value === format
}

const formatDate = (date) => {
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  return `${Y}-${M < 10 ? '0' + M : M}-${D < 10 ? '0' + D : D} ${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
}

watch(() => props.expression, () => {
  calculateNextTimes()
}, { immediate: true })
</script>

<style scoped>
.cron-result-wrapper {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: var(--border-radius, 4px);
  position: relative;
}

.result-title {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 10px;
  background: var(--color-bg-container, #fff);
  font-weight: 500;
  color: var(--color-text, #333);
}

.result-list {
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary, #999);
}

.result-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);
  color: var(--color-text, #333);
}

.result-item:last-child {
  border-bottom: none;
}
</style>
