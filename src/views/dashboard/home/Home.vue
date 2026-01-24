<template>
  <div class="dashboard">
    <a-card title="仪表盘">
      <p>欢迎来到仪表盘页面</p>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-statistic title="用户数" :value="1128" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="订单数" :value="93" suffix="/ 100" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="活跃用户" :value="93" suffix="%" />
        </a-col>
      </a-row>

      <div>
        <span>图标测试</span>
        <div>
          <a-space>
            <IconFont 
              type="icon-space_demo_dashboard-fill_down"
              :script-url="iconScriptUrl"
            />
            <IconFont 
              type="icon-shequ" 
              size="20px" 
              rotate="60"
              :script-url="iconScriptUrl"
            />
            <IconFont 
              type="icon-shouye" 
              size="30px" 
              spin
              :script-url="iconScriptUrl"
            />
            <SvgIcon 
              name="github" 
              width="30px"
              height="30px"
            />
          </a-space>
        </div>
        <a-pagination :total="50" show-size-changer />
         <a-transfer :data-source="[]" show-search :target-keys="[]" :render="item => item.title" />
      </div>

      <div>
        <a-button type="primary" @click="handleTestClick1">
          测试按钮
        </a-button>
        <a-button style="margin-left: 1.25rem;" type="primary" @click="handleTestClick2">
          测试按钮2
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { message ,notification} from '@/utils'

// 测试按钮点击事件
const handleTestClick1 = () => {
  message.success('测试按钮1点击了')
}

// 测试按钮2点击事件
const handleTestClick2 = () => {
  notification.success('测试按钮2点击了')
}

// 定义图标脚本地址
const iconScriptUrl = '//at.alicdn.com/t/c/font_4736930_l6olb1tzza.js';
</script>

<style scoped lang="scss">
.dashboard {

  :where(.ant-card){
    margin-bottom: 20px;
  }
}
</style>