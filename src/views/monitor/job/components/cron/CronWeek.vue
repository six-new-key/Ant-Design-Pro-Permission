<template>
  <a-form layout="vertical" size="small">
    <a-form-item>
      <a-radio-group v-model:value="radioValue">
        <a-space direction="vertical" :size="16" style="width: 100%;">
          <a-radio :value="1">
            周，允许的通配符[, - * ? / L #]
          </a-radio>

          <a-radio :value="2">
            不指定
          </a-radio>

          <div>
            <a-radio :value="3">周期从星期</a-radio>
            <a-select 
              v-model:value="cycle01" 
              style="width: 120px; margin: 0 8px;"
              @change="cycleChange"
              @click="radioValue = 3"
            >
              <a-select-option v-for="item in weekList" :key="item.key" :value="item.key" :disabled="item.key === 1">
                {{ item.value }}
              </a-select-option>
            </a-select>
            到
            <a-select 
              v-model:value="cycle02" 
              style="width: 120px; margin: 0 8px;"
              @change="cycleChange"
              @click="radioValue = 3"
            >
              <a-select-option v-for="item in weekList" :key="item.key" :value="item.key" :disabled="item.key < cycle01 && item.key !== 1">
                {{ item.value }}
              </a-select-option>
            </a-select>
          </div>

          <div>
            <a-radio :value="4">第</a-radio>
            <a-input-number 
              v-model:value="average01" 
              :min="1" 
              :max="4" 
              style="width: 80px; margin: 0 8px;"
              @change="averageChange"
            />
            周的星期
            <a-select 
              v-model:value="average02" 
              style="width: 120px; margin: 0 8px;"
              @change="averageChange"
              @click="radioValue = 4"
            >
              <a-select-option v-for="item in weekList" :key="item.key" :value="item.key">
                {{ item.value }}
              </a-select-option>
            </a-select>
          </div>

          <div>
            <a-radio :value="5">本月最后一个星期</a-radio>
            <a-select 
              v-model:value="weekday" 
              style="width: 120px; margin: 0 8px;"
              @change="weekdayChange"
              @click="radioValue = 5"
            >
              <a-select-option v-for="item in weekList" :key="item.key" :value="item.key">
                {{ item.value }}
              </a-select-option>
            </a-select>
          </div>

          <div>
            <a-radio :value="6">指定</a-radio>
            <a-select 
              v-model:value="checkboxList" 
              mode="multiple" 
              placeholder="可多选" 
              style="width: 400px; margin-left: 8px;"
              @change="checkboxChange"
              @click="radioValue = 6"
            >
              <a-select-option v-for="item in weekList" :key="item.key" :value="String(item.key)">
                {{ item.value }}
              </a-select-option>
            </a-select>
          </div>
        </a-space>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update'])

const radioValue = ref(2)
const weekday = ref(2)
const cycle01 = ref(2)
const cycle02 = ref(3)
const average01 = ref(1)
const average02 = ref(2)
const checkboxList = ref([])

const weekList = [
  { key: 2, value: '星期一' },
  { key: 3, value: '星期二' },
  { key: 4, value: '星期三' },
  { key: 5, value: '星期四' },
  { key: 6, value: '星期五' },
  { key: 7, value: '星期六' },
  { key: 1, value: '星期日' }
]

const checkNum = (value, minLimit, maxLimit) => {
  value = Math.floor(value)
  if (value < minLimit) value = minLimit
  else if (value > maxLimit) value = maxLimit
  return value
}

const cycleTotal = computed(() => {
  return `${cycle01.value}-${cycle02.value}`
})

const averageTotal = computed(() => {
  return `${average02.value}#${average01.value}`
})

const weekdayCheck = computed(() => {
  return checkNum(weekday.value, 1, 7)
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join(',')
  return str === '' ? '*' : str
})

const radioChange = () => {
  switch (radioValue.value) {
    case 1:
      emit('update', 'week', '*', 'week')
      break
    case 2:
      emit('update', 'week', '?', 'week')
      break
    case 3:
      emit('update', 'week', cycleTotal.value, 'week')
      break
    case 4:
      emit('update', 'week', averageTotal.value, 'week')
      break
    case 5:
      emit('update', 'week', weekdayCheck.value + 'L', 'week')
      break
    case 6:
      emit('update', 'week', checkboxString.value, 'week')
      break
  }
}

const cycleChange = () => {
  if (radioValue.value === 3) {
    emit('update', 'week', cycleTotal.value, 'week')
  }
}

const averageChange = () => {
  if (radioValue.value === 4) {
    emit('update', 'week', averageTotal.value, 'week')
  }
}

const weekdayChange = () => {
  if (radioValue.value === 5) {
    emit('update', 'week', weekdayCheck.value + 'L', 'week')
  }
}

const checkboxChange = () => {
  if (radioValue.value === 6) {
    emit('update', 'week', checkboxString.value, 'week')
  }
}

const setRadioValue = (value) => {
  radioValue.value = value
}

const parseValue = (value) => {
  if (value === '*') {
    radioValue.value = 1
  } else if (value === '?') {
    radioValue.value = 2
  } else if (value.indexOf('-') >= 0) {
    radioValue.value = 3
    const arr = value.split('-')
    cycle01.value = parseInt(arr[0])
    cycle02.value = parseInt(arr[1])
  } else if (value.indexOf('#') >= 0) {
    radioValue.value = 4
    const arr = value.split('#')
    average02.value = parseInt(arr[0])
    average01.value = parseInt(arr[1])
  } else if (value.indexOf('L') >= 0) {
    radioValue.value = 5
    weekday.value = parseInt(value.replace('L', ''))
  } else {
    radioValue.value = 6
    checkboxList.value = value.split(',')
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(weekdayCheck, weekdayChange)
watch(checkboxString, checkboxChange)

defineExpose({
  parseValue,
  setRadioValue
})
</script>
