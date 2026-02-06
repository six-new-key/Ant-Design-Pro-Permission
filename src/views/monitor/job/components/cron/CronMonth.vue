<template>
  <a-form layout="vertical" size="small">
    <a-form-item>
      <a-radio-group v-model:value="radioValue">
        <a-space direction="vertical" :size="16" style="width: 100%;">
          <a-radio :value="1">
            月，允许的通配符[, - * /]
          </a-radio>

          <a-radio :value="2">
            周期从
            <a-input-number 
              v-model:value="cycle01" 
              :min="1" 
              :max="11" 
              style="width: 80px; margin: 0 8px;"
              @change="cycleChange"
            />
            到
            <a-input-number 
              v-model:value="cycle02" 
              :min="cycle01 + 1" 
              :max="12" 
              style="width: 80px; margin: 0 8px;"
              @change="cycleChange"
            />
            月
          </a-radio>

          <a-radio :value="3">
            从
            <a-input-number 
              v-model:value="average01" 
              :min="1" 
              :max="11" 
              style="width: 80px; margin: 0 8px;"
              @change="averageChange"
            />
            月开始，每
            <a-input-number 
              v-model:value="average02" 
              :min="1" 
              :max="12 - average01" 
              style="width: 80px; margin: 0 8px;"
              @change="averageChange"
            />
            月执行一次
          </a-radio>

          <div>
            <a-radio :value="4">指定</a-radio>
            <a-select 
              v-model:value="checkboxList" 
              mode="multiple" 
              placeholder="可多选" 
              style="width: 400px; margin-left: 8px;"
              @change="checkboxChange"
              @click="radioValue = 4"
            >
              <a-select-option v-for="item in 12" :key="item" :value="item">
                {{ item }}
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

const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref([])

const checkNum = (value, minLimit, maxLimit) => {
  value = Math.floor(value)
  if (value < minLimit) value = minLimit
  else if (value > maxLimit) value = maxLimit
  return value
}

const cycleTotal = computed(() => {
  const c01 = checkNum(cycle01.value, 1, 11)
  const c02 = checkNum(cycle02.value, c01 + 1, 12)
  return `${c01}-${c02}`
})

const averageTotal = computed(() => {
  const a01 = checkNum(average01.value, 1, 11)
  const a02 = checkNum(average02.value, 1, 12 - a01)
  return `${a01}/${a02}`
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join(',')
  return str === '' ? '*' : str
})

const radioChange = () => {
  switch (radioValue.value) {
    case 1:
      emit('update', 'month', '*', 'month')
      break
    case 2:
      emit('update', 'month', cycleTotal.value, 'month')
      break
    case 3:
      emit('update', 'month', averageTotal.value, 'month')
      break
    case 4:
      emit('update', 'month', checkboxString.value, 'month')
      break
  }
}

const cycleChange = () => {
  if (radioValue.value === 2) {
    emit('update', 'month', cycleTotal.value, 'month')
  }
}

const averageChange = () => {
  if (radioValue.value === 3) {
    emit('update', 'month', averageTotal.value, 'month')
  }
}

const checkboxChange = () => {
  if (radioValue.value === 4) {
    emit('update', 'month', checkboxString.value, 'month')
  }
}

const parseValue = (value) => {
  if (value === '*') {
    radioValue.value = 1
  } else if (value.indexOf('-') >= 0) {
    radioValue.value = 2
    const arr = value.split('-')
    cycle01.value = parseInt(arr[0])
    cycle02.value = parseInt(arr[1])
  } else if (value.indexOf('/') >= 0) {
    radioValue.value = 3
    const arr = value.split('/')
    average01.value = parseInt(arr[0])
    average02.value = parseInt(arr[1])
  } else {
    radioValue.value = 4
    checkboxList.value = value.split(',').map(v => parseInt(v))
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)

defineExpose({
  parseValue
})
</script>
