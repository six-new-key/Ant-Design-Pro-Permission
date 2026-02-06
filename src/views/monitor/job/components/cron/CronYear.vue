<template>
  <a-form layout="vertical" size="small">
    <a-form-item>
      <a-radio-group v-model:value="radioValue">
        <a-space direction="vertical" :size="16" style="width: 100%;">
          <a-radio :value="1">
            不填，允许的通配符[, - * /]
          </a-radio>

          <a-radio :value="2">
            每年
          </a-radio>

          <a-radio :value="3">
            周期从
            <a-input-number 
              v-model:value="cycle01" 
              :min="fullYear" 
              :max="2098" 
              style="width: 100px; margin: 0 8px;"
              @change="cycleChange"
            />
            到
            <a-input-number 
              v-model:value="cycle02" 
              :min="cycle01 + 1" 
              :max="2099" 
              style="width: 100px; margin: 0 8px;"
              @change="cycleChange"
            />
          </a-radio>

          <a-radio :value="4">
            从
            <a-input-number 
              v-model:value="average01" 
              :min="fullYear" 
              :max="2098" 
              style="width: 100px; margin: 0 8px;"
              @change="averageChange"
            />
            年开始，每
            <a-input-number 
              v-model:value="average02" 
              :min="1" 
              :max="2099 - average01" 
              style="width: 100px; margin: 0 8px;"
              @change="averageChange"
            />
            年执行一次
          </a-radio>

          <div>
            <a-radio :value="5">指定</a-radio>
            <a-select 
              v-model:value="checkboxList" 
              mode="multiple" 
              placeholder="可多选" 
              style="width: 400px; margin-left: 8px;"
              @change="checkboxChange"
              @click="radioValue = 5"
            >
              <a-select-option v-for="item in 9" :key="item - 1 + fullYear" :value="item - 1 + fullYear">
                {{ item - 1 + fullYear }}
              </a-select-option>
            </a-select>
          </div>
        </a-space>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['update'])

const fullYear = ref(0)
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(0)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])

const checkNum = (value, minLimit, maxLimit) => {
  value = Math.floor(value)
  if (value < minLimit) value = minLimit
  else if (value > maxLimit) value = maxLimit
  return value
}

const cycleTotal = computed(() => {
  const c01 = checkNum(cycle01.value, fullYear.value, 2098)
  const c02 = checkNum(cycle02.value, c01 + 1, 2099)
  return `${c01}-${c02}`
})

const averageTotal = computed(() => {
  const a01 = checkNum(average01.value, fullYear.value, 2098)
  const a02 = checkNum(average02.value, 1, 2099 - a01)
  return `${a01}/${a02}`
})

const checkboxString = computed(() => {
  return checkboxList.value.join(',')
})

const radioChange = () => {
  switch (radioValue.value) {
    case 1:
      emit('update', 'year', '', 'year')
      break
    case 2:
      emit('update', 'year', '*', 'year')
      break
    case 3:
      emit('update', 'year', cycleTotal.value, 'year')
      break
    case 4:
      emit('update', 'year', averageTotal.value, 'year')
      break
    case 5:
      emit('update', 'year', checkboxString.value, 'year')
      break
  }
}

const cycleChange = () => {
  if (radioValue.value === 3) {
    emit('update', 'year', cycleTotal.value, 'year')
  }
}

const averageChange = () => {
  if (radioValue.value === 4) {
    emit('update', 'year', averageTotal.value, 'year')
  }
}

const checkboxChange = () => {
  if (radioValue.value === 5) {
    emit('update', 'year', checkboxString.value, 'year')
  }
}

const parseValue = (value) => {
  if (!value || value === '') {
    radioValue.value = 1
  } else if (value === '*') {
    radioValue.value = 2
  } else if (value.indexOf('-') >= 0) {
    radioValue.value = 3
    const arr = value.split('-')
    cycle01.value = parseInt(arr[0])
    cycle02.value = parseInt(arr[1])
  } else if (value.indexOf('/') >= 0) {
    radioValue.value = 4
    const arr = value.split('/')
    average01.value = parseInt(arr[0])
    average02.value = parseInt(arr[1])
  } else {
    radioValue.value = 5
    checkboxList.value = value.split(',').map(v => parseInt(v))
  }
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)

onMounted(() => {
  fullYear.value = new Date().getFullYear()
  cycle01.value = fullYear.value
  cycle02.value = fullYear.value + 1
  average01.value = fullYear.value
})

defineExpose({
  parseValue
})
</script>
