<template>
  <div :style="cssVars">
    <!-- 支付弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :closable="currentStep === 'form'"
      :mask-closable="currentStep === 'form'"
      :keyboard="currentStep === 'form'"
      :footer="null"
      centered
      :width="440"
      class="modern-payment-modal"
      @cancel="handleCancel"
    >
      <!-- 自定义标题栏，更简洁 -->
      <template #title>
        <div class="modal-header">
          <span class="modal-title">{{ currentStep === 'form' ? '收银台' : '扫码支付' }}</span>
        </div>
      </template>

      <div class="payment-container">
        <!-- 第一步：支付表单 -->
        <template v-if="currentStep === 'form'">
          <!-- 金额核心展示区 -->
          <div class="amount-display-area">
            <div class="amount-label">支付金额</div>
            <div class="amount-value">
              <span class="currency">¥</span>
              <span class="number">{{ form.amount || '0.00' }}</span>
            </div>
            <div class="order-info">
              <a-typography-text type="secondary" ellipsis style="max-width: 300px;">
                {{ form.subject || '订单支付' }}
              </a-typography-text>
            </div>
          </div>

          <!-- 表单区域 -->
          <a-form
            ref="formRef"
            :model="form"
            layout="vertical"
            class="modern-form"
            hide-required-mark
          >
            <a-form-item
              label="支付渠道"
              name="channel"
              :rules="[{ required: true, message: '请选择支付渠道' }]"
            >
              <DictSelect
                v-model:value="form.channel"
                :dict-type="DICT_TYPES.PAYMENT_CHANNEL"
                placeholder="请选择支付渠道"
                size="large"
              />
            </a-form-item>

            <!-- 隐藏的表单项，仅用于校验，视觉上已由上方金额区展示 -->
            <a-form-item name="amount" class="hidden-form-item">
              <a-input v-model:value="form.amount" type="hidden" />
            </a-form-item>
            <a-form-item name="subject" class="hidden-form-item">
              <a-input v-model:value="form.subject" type="hidden" />
            </a-form-item>

            <a-form-item style="margin-bottom: 0;">
              <a-button
                type="primary"
                size="large"
                block
                :loading="loading"
                @click="handlePay"
                class="submit-btn"
              >
                <template #icon><PayCircleOutlined /></template>
                立即支付
              </a-button>
            </a-form-item>
          </a-form>
        </template>

        <!-- 第二步：扫码支付 -->
        <template v-if="currentStep === 'qr'">
          <div class="qr-payment-area">
            <!-- 金额提醒 -->
            <div class="qr-amount-tip">
              <span>支付金额：</span>
              <span class="price">¥ {{ form.amount }}</span>
            </div>

            <!-- 二维码卡片 -->
            <div class="qr-code-card">
              <div v-if="payResult?.qrCode" class="qr-code-wrap">
                <a-qrcode :value="payResult.qrCode" :size="200" :bordered="false" />
                <div class="qr-scan-tip">请使用{{ form.channel === 'alipay' ? '支付宝' : '微信' }}扫码支付</div>
              </div>

              <!-- 网页跳转支付 -->
              <div v-if="payResult?.payUrl" class="pay-url-wrap">
                <a-button type="primary" :href="payResult.payUrl" target="_blank" size="large" block>
                  <template #icon><ExportOutlined /></template>
                  跳转支付页面
                </a-button>
                <div class="qr-scan-tip" style="margin-top: 12px;">点击按钮前往支付页面</div>
              </div>
            </div>

            <!-- 轮询状态与倒计时进度条 -->
            <div class="status-area">
              <a-progress 
                :percent="(pollCountdown / (props.pollMaxCount * (props.pollInterval / 1000))) * 100" 
                :show-info="false" 
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
                status="active"
                size="small"
              />
              <div class="status-text-wrap">
                <a-spin v-if="polling" size="small" />
                <span class="poll-text">
                  {{ polling ? `等待支付 (${pollCountdown}s)` : pollStatusText }}
                </span>
              </div>
            </div>

            <!-- 订单号 -->
            <div class="order-no-wrap">
              订单号：{{ payResult?.outTradeNo }}
            </div>

            <!-- 底部操作 -->
            <div class="action-footer">
              <a-popconfirm
                title="确定取消支付？"
                ok-text="确定"
                cancel-text="继续支付"
                placement="top"
                @confirm="handleCancelPay"
              >
                <a-button type="link" danger :loading="cancelLoading">取消订单</a-button>
              </a-popconfirm>
            </div>
          </div>
        </template>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
// 保持 JS 逻辑完全不变
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { theme } from 'ant-design-vue'
import { PayCircleOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { Message } from '@/utils'
import DictSelect from '@/components/custom/DictSelect.vue'
import { DICT_TYPES } from '@/constants/dictTypes'
import { createPayment, queryPayment, closePayment } from '@/api/payment'

// CSS 变量
const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-primary': t.colorPrimary,
    '--color-success': t.colorSuccess,
    '--color-error': t.colorError,
    '--color-warning': t.colorWarning,
  }
})

// Props
const props = defineProps({
  // 控制弹窗显示（v-model:visible）
  visible: {
    type: Boolean,
    default: false
  },
  // 默认支付渠道
  defaultChannel: {
    type: [String, Number],
    default: undefined
  },
  // 默认金额
  defaultAmount: {
    type: String,
    default: ''
  },
  // 默认订单标题
  defaultSubject: {
    type: String,
    default: ''
  },
  // 轮询间隔（毫秒）
  pollInterval: {
    type: Number,
    default: 3000
  },
  // 最大轮询次数
  pollMaxCount: {
    type: Number,
    default: 40
  }
})

// Emits
const emit = defineEmits(['update:visible', 'success', 'timeout', 'cancel', 'error', 'close'])

// 弹窗显示状态（内部使用）
const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 当前步骤：form（表单）/ qr（二维码）
const currentStep = ref('form')

// 表单
const formRef = ref(null)
const form = reactive({
  channel: props.defaultChannel,
  amount: props.defaultAmount,
  subject: props.defaultSubject
})

// 监听 visible 变化，打开弹窗时重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 打开弹窗时重置步骤和表单
    currentStep.value = 'form'
    form.channel = props.defaultChannel
    form.amount = props.defaultAmount
    form.subject = props.defaultSubject
    payResult.value = null
    pollStatusText.value = ''
  }
})

const loading = ref(false)
const payResult = ref(null)

// 轮询相关
const polling = ref(false)
const pollStatusText = ref('')
const cancelLoading = ref(false)

let pollTimer = null
let pollCount = 0
const pollCountdown = ref(120)
let countdownTimer = null

const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  polling.value = false
}

const closeModal = () => {
  stopPolling()
  modalVisible.value = false
}

const startPolling = (outTradeNo) => {
  polling.value = true
  pollCount = 0
  pollCountdown.value = props.pollMaxCount * (props.pollInterval / 1000)

  // 倒计时
  countdownTimer = setInterval(() => {
    if (pollCountdown.value > 0) pollCountdown.value--
  }, 1000)

  pollTimer = setInterval(async () => {
    pollCount++
    try {
      const res = await queryPayment({ outTradeNo })
      if (res.code === 200) {
        const status = res.data?.tradeStatus
        if (status === 'TRADE_SUCCESS') {
          stopPolling()
          pollStatusText.value = '支付成功'
          Message.success('支付成功')
          emit('success', { outTradeNo: res.data.outTradeNo, tradeNo: res.data.tradeNo })
          closeModal()
          return
        } else if (status === 'TRADE_CLOSED' || status === 'TRADE_FINISHED') {
          stopPolling()
          pollStatusText.value = getTradeStatusText(status)
          Message.warning(getTradeStatusText(status))
          emit('cancel', { outTradeNo })
          closeModal()
          return
        }
      }
    } catch {
      // 网络异常不中断轮询
    }

    // 超时处理
    if (pollCount >= props.pollMaxCount) {
      stopPolling()
      pollStatusText.value = '支付超时'
      Message.warning('支付超时，订单已关闭')
      try {
        await closePayment({ outTradeNo })
      } catch { /* ignore */ }
      emit('timeout', { outTradeNo })
      closeModal()
    }
  }, props.pollInterval)
}

const handlePay = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  payResult.value = null
  try {
    const res = await createPayment({
      channel: form.channel,
      amount: form.amount,
      subject: form.subject
    })
    if (res.code === 200) {
      payResult.value = res.data
      currentStep.value = 'qr'  // 切换到二维码步骤
      pollStatusText.value = ''
      startPolling(res.data.outTradeNo)
    }
  } catch (error) {
    Message.error(error?.message || '发起支付失败')
    emit('error', error)
  } finally {
    loading.value = false
  }
}

const handleCancelPay = async () => {
  cancelLoading.value = true
  stopPolling()
  try {
    await closePayment({ outTradeNo: payResult.value?.outTradeNo })
    Message.info('支付已取消，订单已关闭')
    emit('cancel', { outTradeNo: payResult.value?.outTradeNo })
  } catch {
    Message.warning('取消支付失败，请手动关闭订单')
  } finally {
    cancelLoading.value = false
    closeModal()
  }
}

const handleClose = () => {
  emit('close')
  closeModal()
}

const handleCancel = () => {
  // 用户点击弹窗右上角关闭或按 ESC
  if (currentStep.value === 'form') {
    emit('close')
  }
  // qr 步骤不允许通过点击遮罩关闭
}

onUnmounted(() => { stopPolling() })

// 工具函数
const getTradeStatusText = (status) => {
  const map = {
    WAIT_BUYER_PAY: '等待付款',
    TRADE_SUCCESS: '支付成功',
    TRADE_CLOSED: '已关闭',
    TRADE_FINISHED: '已完成'
  }
  return map[status] || status
}
</script>

<style scoped lang="scss">
// 引入 icon
@import url('https://fonts.googleapis.com/css2?family=DIN+Alternate:wght@700&display=swap');

.modern-payment-modal {
  :deep(.ant-modal-content) {
    border-radius: 12px;
    overflow: hidden;
    padding: 0;
  }
  
  :deep(.ant-modal-header) {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 0;
  }
  
  :deep(.ant-modal-body) {
    padding: 0;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  
  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }
}

.payment-container {
  padding: 24px;
  
  // ===== 第一步：表单样式 =====
  .amount-display-area {
    text-align: center;
    margin-bottom: 32px;
    padding-top: 10px;

    .amount-label {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .amount-value {
      color: var(--color-text);
      line-height: 1;
      margin-bottom: 8px;

      .currency {
        font-size: 24px;
        font-weight: 500;
        vertical-align: text-top; // 对齐符号
        margin-right: 4px;
      }

      .number {
        font-size: 48px;
        font-weight: 700;
        font-family: 'DIN Alternate', 'Roboto', sans-serif; // 数字更现代
      }
    }

    .order-info {
      height: 22px; // 固定高度防止抖动
    }
  }

  .modern-form {
    :deep(.ant-form-item-label > label) {
      font-weight: 500;
      color: var(--color-text);
    }
    
    :deep(.ant-select-selector) {
      border-radius: 8px !important;
      height: 44px;
      display: flex;
      align-items: center;
    }
  }

  .submit-btn {
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    margin-top: 24px;
    box-shadow: 0 4px 12px rgba(var(--color-primary), 0.2); // 按钮阴影
  }

  .hidden-form-item {
    display: none;
  }

  // ===== 第二步：扫码样式 =====
  .qr-payment-area {
    display: flex;
    flex-direction: column;
    align-items: center;

    .qr-amount-tip {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 16px;
      
      .price {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-error); // 强调颜色
      }
    }

    .qr-code-card {
      background: #FAFAFA;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #F0F0F0;
      margin-bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;

      .qr-code-wrap, .pay-url-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .qr-scan-tip {
        margin-top: 12px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }

    .status-area {
      width: 100%;
      margin-bottom: 16px;
      padding: 0 10px;

      .status-text-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;
        
        .poll-text {
          font-size: 13px;
          color: var(--color-text-secondary);
        }
      }
    }

    .order-no-wrap {
      font-size: 12px;
      color: #999;
      margin-bottom: 16px;
      user-select: all; // 允许复制
    }

    .action-footer {
      width: 100%;
      text-align: center;
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;
    }
  }
}
</style>
