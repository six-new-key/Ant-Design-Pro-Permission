<template>
  <div class="home-container">
    <!-- 数据统计卡片区域 -->
    <div class="stats-grid">
      <t-card class="stat-card" v-for="stat in statsData" :key="stat.key" :bordered="false" hover-shadow>
        <div class="stat-content">
          <div class="stat-icon">
            <t-icon :name="stat.icon" :style="{ color: stat.color, fontSize: '24px' }" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
            <div class="stat-total">总{{ stat.label }} {{ stat.total.toLocaleString() }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 面积图表区域 -->
    <div class="chart-section">
      <t-card :bordered="false" hover-shadow>
        <div class="chart-header">
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot" style="background-color: var(--td-brand-color);"></span>
              流量趋势
            </span>
            <span class="legend-item">
              <span class="legend-dot" style="background-color: var(--td-success-color);"></span>
              月访问量
            </span>
          </div>
        </div>
        <div ref="areaChartRef" class="chart-container"></div>
      </t-card>
    </div>

    <!-- 多图表分析区域 -->
    <div class="analysis-grid">
      <t-card class="analysis-card" :bordered="false" hover-shadow>
        <template #header>
          <span class="card-title">访问数量</span>
        </template>
        <div ref="radarChartRef" class="chart-container-small"></div>
      </t-card>

      <t-card class="analysis-card" :bordered="false" hover-shadow>
        <template #header>
          <span class="card-title">访问来源</span>
        </template>
        <div ref="doughnutChartRef" class="chart-container-small"></div>
      </t-card>

      <t-card class="analysis-card" :bordered="false" hover-shadow>
        <template #header>
          <span class="card-title">访问来源</span>
        </template>
        <div ref="pieChartRef" class="chart-container-small"></div>
      </t-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { echarts } from '@/echarts'
import { useAppStore } from '@/store/modules/app'

// 获取store实例
const appStore = useAppStore()

// 数据统计
const statsData = ref([
  {
    key: 'users',
    label: '用户量',
    value: 2000,
    total: 120000,
    icon: 'user',
    color: '#409eff'
  },
  {
    key: 'visits',
    label: '访问量',
    value: 20000,
    total: 500000,
    icon: 'browse',
    color: '#f56c6c'
  },
  {
    key: 'downloads',
    label: '下载量',
    value: 8000,
    total: 120000,
    icon: 'download',
    color: '#e6a23c'
  },
  {
    key: 'usage',
    label: '使用量',
    value: 5000,
    total: 50000,
    icon: 'chart',
    color: '#67c23a'
  }
])

// 图表引用
const areaChartRef = ref(null)
const radarChartRef = ref(null)
const doughnutChartRef = ref(null)
const pieChartRef = ref(null)

// 图表实例
let areaChart = null
let radarChart = null
let doughnutChart = null
let pieChart = null

// 面积图配置
const getAreaChartOption = () => {
  const hours = []
  for (let i = 6; i <= 23; i++) {
    hours.push(`${i}:00`)
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['流量趋势', '月访问量'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours
    },
    yAxis: {
      type: 'value',
      max: 80000
    },
    series: [
      {
        name: '流量趋势',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.8)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        },
        data: [0, 15000, 25000, 35000, 45000, 55000, 65000, 70000, 60000, 50000, 65000, 75000, 70000, 60000, 50000, 45000, 35000, 25000]
      },
      {
        name: '月访问量',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.8)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        },
        data: [0, 8000, 12000, 18000, 22000, 28000, 32000, 35000, 30000, 25000, 32000, 38000, 35000, 30000, 25000, 22000, 18000, 12000]
      }
    ]
  }
}

// 雷达图配置
const getRadarChartOption = () => {
  return {
    tooltip: {},
    radar: {
      indicator: [
        { name: '移动端', max: 100 },
        { name: 'PC端', max: 100 },
        { name: '平板', max: 100 },
        { name: '其他', max: 100 }
      ],
      radius: '60%'
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [80, 60, 40, 30],
            name: '访问设备',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409eff'
            },
            itemStyle: {
              color: '#409eff'
            }
          }
        ]
      }
    ]
  }
}

// 环形图配置
const getDoughnutChartOption = () => {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '搜索引擎', itemStyle: { color: '#409eff' } },
         { value: 25, name: '直接访问', itemStyle: { color: '#67c23a' } },
         { value: 20, name: '邮件营销', itemStyle: { color: '#e6a23c' } },
         { value: 20, name: '联盟广告', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
}

// 饼图配置
const getPieChartOption = () => {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['40%', '50%'],
        data: [
          { value: 45, name: '搜索引擎', itemStyle: { color: '#67c23a' } },
         { value: 30, name: '外站', itemStyle: { color: '#409eff' } },
         { value: 25, name: '其他', itemStyle: { color: '#e6a23c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// 初始化图表
const initCharts = () => {
  console.log('开始初始化图表', { echarts, areaChartRef: areaChartRef.value })
  
  if (areaChartRef.value) {
    areaChart = echarts.init(areaChartRef.value)
    areaChart.setOption(getAreaChartOption())
    console.log('面积图初始化完成')
  }
  
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value)
    radarChart.setOption(getRadarChartOption())
    console.log('雷达图初始化完成')
  }
  
  if (doughnutChartRef.value) {
    doughnutChart = echarts.init(doughnutChartRef.value)
    doughnutChart.setOption(getDoughnutChartOption())
    console.log('环形图初始化完成')
  }
  
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption(getPieChartOption())
    console.log('饼图初始化完成')
  }
}

// 响应式处理
const handleResize = () => {
  areaChart?.resize()
  radarChart?.resize()
  doughnutChart?.resize()
  pieChart?.resize()
}

// 监听侧边栏折叠状态变化
watch(
  () => appStore.isSidebarCollapsed,
  () => {
    // 延迟执行resize，等待CSS动画完成
    setTimeout(() => {
      handleResize()
    }, 300)
  }
)

onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  areaChart?.dispose()
  radarChart?.dispose()
  doughnutChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 数据统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  min-height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
}

.stat-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: rgba(64, 158, 255, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--td-text-color-primary);
  line-height: 1.2;
}

.stat-total {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin: 4px 0;
}

.stat-label {
  font-size: 14px;
  color: var(--td-text-color-placeholder);
}

/* 图表区域样式 */
.chart-section {
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

/* 分析图表网格 */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.analysis-card {
  min-height: 350px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.chart-container-small {
  width: 100%;
  height: 280px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .chart-container-small {
    height: 250px;
  }
}
</style>
