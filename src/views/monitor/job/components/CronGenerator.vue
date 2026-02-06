<template>
  <div class="cron-generator" :style="cssVars">
    <a-tabs v-model:activeKey="activeTab" type="card">
      <a-tab-pane key="second" tab="秒">
        <CronSecond ref="cronSecond" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="minute" tab="分钟">
        <CronMinute ref="cronMinute" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="hour" tab="小时">
        <CronHour ref="cronHour" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="day" tab="日">
        <CronDay ref="cronDay" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="month" tab="月">
        <CronMonth ref="cronMonth" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="week" tab="周">
        <CronWeek ref="cronWeek" @update="updateCronValue" />
      </a-tab-pane>
      <a-tab-pane key="year" tab="年">
        <CronYear ref="cronYear" @update="updateCronValue" />
      </a-tab-pane>
    </a-tabs>

    <div class="cron-result">
      <div class="result-title">时间表达式</div>
      <a-table :columns="resultColumns" :data-source="resultData" :pagination="false" size="small" bordered>
        <template #bodyCell="{ column, record }">
          <span>{{ record[column.dataIndex] }}</span>
        </template>
      </a-table>
    </div>

    <CronResult :expression="cronExpression" />

    <div class="cron-examples">
      <div class="examples-title">常用表达式示例</div>
      <div class="examples-content">
        <a-space direction="vertical" :size="8" style="width: 100%;">
          <div 
            v-for="example in currentExamples" 
            :key="example.expression"
            class="example-item"
            @click="applyExample(example.expression)"
          >
            <div class="example-expression">
              <a-tag color="blue">{{ example.expression }}</a-tag>
            </div>
            <div class="example-description">{{ example.description }}</div>
          </div>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { theme } from 'ant-design-vue'
import CronSecond from './cron/CronSecond.vue'
import CronMinute from './cron/CronMinute.vue'
import CronHour from './cron/CronHour.vue'
import CronDay from './cron/CronDay.vue'
import CronMonth from './cron/CronMonth.vue'
import CronWeek from './cron/CronWeek.vue'
import CronYear from './cron/CronYear.vue'
import CronResult from './cron/CronResult.vue'

const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-border': t.colorBorder,
    '--color-border-secondary': t.colorBorderSecondary,
    '--color-bg-container': t.colorBgContainer,
    '--border-radius': `${t.borderRadius}px`
  }
})

const props = defineProps({
  value: { type: String, default: '0 0 0 * * ? *' }
})

const emit = defineEmits(['update:value'])

const activeTab = ref('second')

// 常用表达式示例数据
const cronExamples = {
  second: [
    { expression: '0/2 * * * * ?', description: '每2秒执行一次' },
    { expression: '0-5 * * * * ?', description: '每分钟的前5秒，每秒执行一次' },
    { expression: '0,10,20,30,40,50 * * * * ?', description: '每分钟的0、10、20、30、40、50秒执行' },
    { expression: '0/10 * * * * ?', description: '每10秒执行一次' },
    { expression: '5/15 * * * * ?', description: '从第5秒开始，每15秒执行一次' }
  ],
  minute: [
    { expression: '0 0/2 * * * ?', description: '每2分钟执行一次' },
    { expression: '0 0,15,30,45 * * * ?', description: '每小时的0、15、30、45分执行' },
    { expression: '0 0-5 14 * * ?', description: '每天下午2点到2:05期间每分钟执行' },
    { expression: '0 0/5 14 * * ?', description: '每天下午2点到2:55期间每5分钟执行' },
    { expression: '0 0/5 14,18 * * ?', description: '每天下午2点到2:55和下午6点到6:55期间每5分钟执行' }
  ],
  hour: [
    { expression: '0 0 0 * * ?', description: '每天0点执行' },
    { expression: '0 0 10,14,16 * * ?', description: '每天上午10点、下午2点、4点执行' },
    { expression: '0 0/30 9-17 * * ?', description: '朝九晚五工作时间内每半小时执行' },
    { expression: '0 0 12 * * ?', description: '每天中午12点执行' },
    { expression: '0 15 10 * * ?', description: '每天上午10:15执行' }
  ],
  day: [
    { expression: '0 0 2 1 * ?', description: '每月1日凌晨2点执行' },
    { expression: '0 15 10 * * ?', description: '每天上午10:15执行' },
    { expression: '0 15 10 15 * ?', description: '每月15日上午10:15执行' },
    { expression: '0 15 10 L * ?', description: '每月最后一日上午10:15执行' },
    { expression: '0 15 10 ? * 6L', description: '每月最后一个星期五上午10:15执行' },
    { expression: '0 0 2 1/7 * ?', description: '从每月1号开始，每7天凌晨2点执行' }
  ],
  month: [
    { expression: '0 0 0 1 1 ?', description: '每年1月1日0点执行' },
    { expression: '0 15 10 ? * MON-FRI', description: '周一至周五上午10:15执行' },
    { expression: '0 15 10 ? 6L 2002-2006', description: '2002-2006年每个月的最后一个星期五上午10:15执行' },
    { expression: '0 0 12 ? * WED', description: '每个星期三中午12点执行' },
    { expression: '0 10,44 14 ? 3 WED', description: '每年三月的星期三下午2:10和2:44执行' }
  ],
  week: [
    { expression: '0 15 10 ? * MON-FRI', description: '周一至周五上午10:15执行' },
    { expression: '0 0 12 ? * WED', description: '每个星期三中午12点执行' },
    { expression: '0 15 10 ? * 6L', description: '每月最后一个星期五上午10:15执行' },
    { expression: '0 15 10 ? * 6#3', description: '每月第三个星期五上午10:15执行' },
    { expression: '0 0 12 ? * 2', description: '每周一中午12点执行' },
    { expression: '0 15 10 15 * ?', description: '每月15日上午10:15执行' }
  ],
  year: [
    { expression: '0 15 10 * * ? 2005', description: '2005年每天上午10:15执行' },
    { expression: '0 15 10 ? 6L 2002-2006', description: '2002-2006年每个月的最后一个星期五上午10:15执行' },
    { expression: '0 15 10 ? * 6L 2002-2005', description: '2002年至2005年每月最后一个星期五上午10:15执行' },
    { expression: '0 0 0 1 1 ? 2025', description: '2025年1月1日0点执行' },
    { expression: '0 0 0 1 1 ? 2025-2030', description: '2025-2030年每年1月1日0点执行' }
  ]
}

// 当前Tab对应的示例
const currentExamples = computed(() => {
  return cronExamples[activeTab.value] || []
})

// 应用示例表达式
const applyExample = (expression) => {
  parseCronExpression(expression)
}

const cronValue = reactive({
  second: '*',
  minute: '*',
  hour: '*',
  day: '*',
  month: '*',
  week: '?',
  year: ''
})

const cronSecond = ref(null)
const cronMinute = ref(null)
const cronHour = ref(null)
const cronDay = ref(null)
const cronMonth = ref(null)
const cronWeek = ref(null)
const cronYear = ref(null)

const cronExpression = computed(() => {
  const parts = [
    cronValue.second,
    cronValue.minute,
    cronValue.hour,
    cronValue.day,
    cronValue.month,
    cronValue.week
  ]
  
  // 如果年份有值，添加年份
  if (cronValue.year) {
    parts.push(cronValue.year)
  }
  
  return parts.join(' ')
})

const resultColumns = [
  { title: '秒', dataIndex: 'second', width: 80 },
  { title: '分钟', dataIndex: 'minute', width: 80 },
  { title: '小时', dataIndex: 'hour', width: 80 },
  { title: '日', dataIndex: 'day', width: 80 },
  { title: '月', dataIndex: 'month', width: 80 },
  { title: '周', dataIndex: 'week', width: 80 },
  { title: '年', dataIndex: 'year', width: 80 },
  { title: 'Cron 表达式', dataIndex: 'expression', width: 200 }
]

const resultData = computed(() => [{
  second: cronValue.second,
  minute: cronValue.minute,
  hour: cronValue.hour,
  day: cronValue.day,
  month: cronValue.month,
  week: cronValue.week,
  year: cronValue.year || '-',
  expression: cronExpression.value
}])

const updateCronValue = (name, value, from) => {
  cronValue[name] = value
  
  // 日期和星期互斥
  if (from && from !== name) {
    if (name === 'day' && value !== '?' && cronValue.week !== '?') {
      cronValue.week = '?'
      if (cronWeek.value) {
        cronWeek.value.setRadioValue(2)
      }
    } else if (name === 'week' && value !== '?' && cronValue.day !== '?') {
      cronValue.day = '?'
      if (cronDay.value) {
        cronDay.value.setRadioValue(2)
      }
    }
  }
}

const parseCronExpression = (expression) => {
  if (!expression) return
  
  const parts = expression.split(' ')
  if (parts.length >= 6) {
    cronValue.second = parts[0] || '*'
    cronValue.minute = parts[1] || '*'
    cronValue.hour = parts[2] || '*'
    cronValue.day = parts[3] || '*'
    cronValue.month = parts[4] || '*'
    cronValue.week = parts[5] || '?'
    cronValue.year = parts[6] || ''
    
    // 通知各个子组件更新
    setTimeout(() => {
      if (cronSecond.value) cronSecond.value.parseValue(cronValue.second)
      if (cronMinute.value) cronMinute.value.parseValue(cronValue.minute)
      if (cronHour.value) cronHour.value.parseValue(cronValue.hour)
      if (cronDay.value) cronDay.value.parseValue(cronValue.day)
      if (cronMonth.value) cronMonth.value.parseValue(cronValue.month)
      if (cronWeek.value) cronWeek.value.parseValue(cronValue.week)
      if (cronYear.value) cronYear.value.parseValue(cronValue.year)
    }, 100)
  }
}

watch(cronExpression, (newVal) => {
  emit('update:value', newVal)
})

watch(() => props.value, (newVal) => {
  if (newVal && newVal !== cronExpression.value) {
    parseCronExpression(newVal)
  }
}, { immediate: true })
</script>

<style scoped>
.cron-generator {
  padding: 16px;
}

.cron-result {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  position: relative;
}

.result-title {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 10px;
  background: var(--color-bg-container);
  font-weight: 500;
  color: var(--color-text);
}

.cron-examples {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  position: relative;
}

.examples-title {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 10px;
  background: var(--color-bg-container);
  font-weight: 500;
  color: var(--color-text);
}

.examples-content {
  max-height: 300px;
  overflow-y: auto;
}

.example-item {
  padding: 12px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s;
}

.example-item:hover {
  border-color: var(--color-border);
  background-color: rgba(24, 144, 255, 0.05);
  transform: translateX(4px);
}

.example-expression {
  margin-bottom: 4px;
}

.example-description {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
