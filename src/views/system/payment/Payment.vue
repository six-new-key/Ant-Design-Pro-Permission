<template>
  <div :style="cssVars">
    <a-tabs v-model:activeKey="activeTab">
      <!-- 发起支付 -->
      <a-tab-pane key="pay" tab="发起支付">
        <a-card :bordered="false">
          <a-form
            ref="payFormRef"
            :model="payForm"
            layout="vertical"
            style="max-width: 600px;"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item
                  label="支付渠道"
                  name="channel"
                  :rules="[{ required: true, message: '请选择支付渠道' }]"
                >
                  <DictSelect
                    v-model:value="payForm.channel"
                    :dict-type="DICT_TYPES.PAYMENT_CHANNEL"
                    placeholder="请选择支付渠道"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="订单金额（元）"
                  name="amount"
                  :rules="[
                    { required: true, message: '请输入订单金额' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式，如 9.90' }
                  ]"
                >
                  <a-input
                    v-model:value="payForm.amount"
                    placeholder="如：9.90"
                    prefix="¥"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="订单标题"
                  name="subject"
                  :rules="[{ required: true, message: '请输入订单标题' }]"
                >
                  <a-input v-model:value="payForm.subject" placeholder="请输入订单标题" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="订单描述" name="body">
                  <a-input v-model:value="payForm.body" placeholder="选填" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="门店编号" name="storeId">
                  <a-input v-model:value="payForm.storeId" placeholder="选填，如：NJ_001" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="操作员编号" name="operatorId">
                  <a-input v-model:value="payForm.operatorId" placeholder="选填，如：yx_001" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="终端编号" name="terminalId">
                  <a-input v-model:value="payForm.terminalId" placeholder="选填，如：NJ_T_001" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item>
              <a-button
                type="primary"
                :loading="payLoading"
                @click="handlePay"
                size="large"
                v-permission.disable="'system:payment:pay'"
              >
                <template #icon><PayCircleOutlined /></template>
                发起支付
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 扫码支付弹窗 -->
        <a-modal
          v-model:open="qrModalVisible"
          title="扫码完成支付"
          :closable="false"
          :mask-closable="false"
          :keyboard="false"
          :footer="null"
          centered
          width="360px"
        >
          <div class="qr-modal-body">
            <a-alert
              :message="`订单号：${payResult?.outTradeNo}`"
              type="info"
              show-icon
              style="margin-bottom: 16px;"
            />

            <!-- 二维码 -->
            <div v-if="payResult?.qrCode" class="qr-code-wrap">
              <a-qrcode :value="payResult.qrCode" :size="200" />
            </div>

            <!-- 网页跳转支付 -->
            <div v-if="payResult?.payUrl" class="qr-code-wrap">
              <a-button type="primary" :href="payResult.payUrl" target="_blank" size="large">
                点击跳转支付页面
              </a-button>
            </div>

            <!-- 轮询状态 -->
            <div class="poll-status">
              <a-spin v-if="polling" size="small" />
              <span class="poll-text">
                {{ polling ? `等待支付结果（${pollCountdown}s 后超时）` : pollStatusText }}
              </span>
            </div>

            <a-divider style="margin: 12px 0;" />

            <div style="text-align: center;">
              <a-popconfirm
                title="确定取消支付？取消后订单将被关闭。"
                ok-text="确定取消"
                cancel-text="继续支付"
                ok-type="danger"
                @confirm="handleCancelPay"
              >
                <a-button danger :loading="cancelPayLoading">取消支付</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-modal>
      </a-tab-pane>

      <!-- 订单查询 -->
      <a-tab-pane key="query" tab="订单查询">
        <a-card :bordered="false">
          <a-form layout="inline" style="margin-bottom: 24px;">
            <a-form-item label="商户订单号">
              <a-input
                v-model:value="queryOutTradeNo"
                placeholder="请输入商户订单号"
                style="width: 260px"
                @press-enter="handleQuery"
              />
            </a-form-item>
            <a-form-item label="渠道交易号">
              <a-input
                v-model:value="queryTradeNo"
                placeholder="选填，与商户订单号二选一"
                style="width: 260px"
                @press-enter="handleQuery"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :loading="queryLoading" @click="handleQuery">
                <template #icon><SearchOutlined /></template>
                查询
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="queryResult">
            <a-descriptions bordered :column="1" :labelStyle="{ width: '140px' }">
              <a-descriptions-item label="商户订单号">{{ queryResult.outTradeNo }}</a-descriptions-item>
              <a-descriptions-item label="渠道交易号">{{ queryResult.tradeNo || '-' }}</a-descriptions-item>
              <a-descriptions-item label="交易状态">
                <a-tag :color="getTradeStatusColor(queryResult.tradeStatus)">
                  {{ getTradeStatusText(queryResult.tradeStatus) }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-tab-pane>

      <!-- 退款 -->
      <a-tab-pane key="refund" tab="发起退款">
        <a-card :bordered="false">
          <a-form
            ref="refundFormRef"
            :model="refundForm"
            layout="vertical"
            style="max-width: 600px;"
          >
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item
                  label="商户订单号"
                  name="outTradeNo"
                  :rules="[{ required: true, message: '请输入商户订单号' }]"
                >
                  <a-input v-model:value="refundForm.outTradeNo" placeholder="请输入要退款的商户订单号" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="退款金额（元）"
                  name="refundAmount"
                  :rules="[
                    { required: true, message: '请输入退款金额' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式' }
                  ]"
                >
                  <a-input
                    v-model:value="refundForm.refundAmount"
                    placeholder="如：9.90"
                    prefix="¥"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="退款原因" name="refundReason">
                  <a-input v-model:value="refundForm.refundReason" placeholder="选填" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item>
              <a-button
                type="primary"
                danger
                :loading="refundLoading"
                @click="handleRefund"
                size="large"
                v-permission.disable="'system:payment:refund'"
              >
                <template #icon><RollbackOutlined /></template>
                发起退款
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="refundResult">
            <a-divider>退款结果</a-divider>
            <a-alert message="退款请求已提交" type="success" show-icon />
          </div>

          <a-divider>查询退款状态</a-divider>
          <a-form layout="inline" style="margin-bottom: 16px;">
            <a-form-item label="商户订单号">
              <a-input
                v-model:value="refundQueryForm.outTradeNo"
                placeholder="请输入商户订单号"
                style="width: 200px"
                @press-enter="handleRefundQuery"
              />
            </a-form-item>
            <a-form-item label="退款请求号">
              <a-input
                v-model:value="refundQueryForm.outRequestNo"
                placeholder="请输入退款请求号"
                style="width: 200px"
                @press-enter="handleRefundQuery"
              />
            </a-form-item>
            <a-form-item label="渠道交易号">
              <a-input
                v-model:value="refundQueryForm.tradeNo"
                placeholder="选填"
                style="width: 180px"
                @press-enter="handleRefundQuery"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :loading="refundQueryLoading" @click="handleRefundQuery">
                <template #icon><SearchOutlined /></template>
                查询
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="refundQueryResult">
            <a-descriptions bordered :column="1" :labelStyle="{ width: '140px' }">
              <a-descriptions-item label="商户订单号">{{ refundQueryResult.outTradeNo }}</a-descriptions-item>
              <a-descriptions-item label="退款状态">
                <a-tag :color="refundQueryResult.tradeStatus === 'REFUND_SUCCESS' ? 'success' : 'warning'">
                  {{ refundQueryResult.tradeStatus }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="退款金额" v-if="refundQueryResult.extraData?.refundAmount">
                <span style="color: var(--color-warning); font-weight: 600;">
                  ¥{{ refundQueryResult.extraData.refundAmount }}
                </span>
              </a-descriptions-item>
              <a-descriptions-item label="退款时间" v-if="refundQueryResult.extraData?.gmtRefundPay">
                {{ refundQueryResult.extraData.gmtRefundPay }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-tab-pane>

      <!-- 关闭/撤销 -->
      <a-tab-pane key="close" tab="关闭/撤销">
        <a-card :bordered="false">
          <a-form layout="inline" style="margin-bottom: 24px;">
            <a-form-item label="商户订单号">
              <a-input
                v-model:value="closeOutTradeNo"
                placeholder="请输入商户订单号"
                style="width: 240px"
              />
            </a-form-item>
            <a-form-item label="渠道交易号">
              <a-input
                v-model:value="closeTradeNo"
                placeholder="选填，与商户订单号二选一"
                style="width: 220px"
              />
            </a-form-item>
            <a-form-item label="操作员编号">
              <a-input
                v-model:value="closeOperatorId"
                placeholder="选填（关闭订单时有效）"
                style="width: 200px"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-popconfirm
                  title="确定要关闭此订单吗？仅限未支付订单。"
                  @confirm="handleClose"
                >
                  <a-button :loading="closeLoading" v-permission.disable="'system:payment:close'">
                    <template #icon><StopOutlined /></template>
                    关闭订单
                  </a-button>
                </a-popconfirm>
                <a-popconfirm
                  title="确定要撤销此订单吗？仅支付宝支持，未支付触发关闭，已支付触发退款。"
                  @confirm="handleCancel"
                >
                  <a-button danger :loading="cancelLoading" v-permission.disable="'system:payment:cancel'">
                    <template #icon><CloseCircleOutlined /></template>
                    撤销订单
                  </a-button>
                </a-popconfirm>
              </a-space>
            </a-form-item>
          </a-form>

          <div v-if="closeResult">
            <a-divider>操作结果</a-divider>
            <a-alert message="操作成功" type="success" show-icon />
          </div>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import {
  SearchOutlined,
  PayCircleOutlined,
  RollbackOutlined,
  StopOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import DictSelect from '@/components/custom/DictSelect.vue'
import { DICT_TYPES } from '@/constants/dictTypes'
import {
  createPayment,
  queryPayment,
  queryRefundStatus,
  refundPayment,
  closePayment,
  cancelPayment
} from '@/api/payment'

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
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder,
    '--color-fill': t.colorFillQuaternary,
    '--border-radius': `${t.borderRadius}px`,
  }
})

const activeTab = ref('pay')

// ==================== 发起支付 ====================
const payFormRef = ref(null)
const payForm = reactive({
  channel: undefined,
  amount: '',
  subject: '',
  body: '',
  storeId: '',
  operatorId: '',
  terminalId: ''
})
const payLoading = ref(false)
const payResult = ref(null)

// 扫码弹窗 & 轮询
const qrModalVisible = ref(false)
const polling = ref(false)
const pollStatusText = ref('')
const cancelPayLoading = ref(false)

const POLL_INTERVAL = 3000   // 3秒轮询一次
const POLL_MAX = 40          // 最多40次 = 2分钟
let pollTimer = null
let pollCount = 0
const pollCountdown = ref(120)
let countdownTimer = null

const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  polling.value = false
}

const closeQrModal = () => {
  stopPolling()
  qrModalVisible.value = false
}

const startPolling = (outTradeNo) => {
  polling.value = true
  pollCount = 0
  pollCountdown.value = POLL_MAX * (POLL_INTERVAL / 1000)

  // 倒计时
  countdownTimer = setInterval(() => {
    if (pollCountdown.value > 0) pollCountdown.value--
  }, 1000)

  pollTimer = setInterval(async () => {
    pollCount++
    try {
      const res = await queryPayment({ outTradeNo })
      if (res.code !== 200) {
        // 超时判断放在最后统一处理
      } else {
        const status = res.data?.tradeStatus
        if (status === 'TRADE_SUCCESS') {
          stopPolling()
          pollStatusText.value = '支付成功'
          Message.success('支付成功')
          closeQrModal()
          return
        } else if (status === 'TRADE_CLOSED' || status === 'TRADE_FINISHED') {
          stopPolling()
          pollStatusText.value = getTradeStatusText(status)
          Message.warning(getTradeStatusText(status))
          closeQrModal()
          return
        }
      }
      // WAIT_BUYER_PAY 继续轮询
    } catch {
      // 网络异常不中断轮询
    }

    // 超时处理：先关闭订单，再关弹窗
    if (pollCount >= POLL_MAX) {
      stopPolling()
      pollStatusText.value = '支付超时'
      Message.warning('支付超时，订单已关闭')
      try {
        await closePayment({ outTradeNo })
      } catch { /* ignore */ }
      closeQrModal()
    }
  }, POLL_INTERVAL)
}

const handlePay = async () => {
  try {
    await payFormRef.value.validate()
  } catch {
    return
  }

  Modal.confirm({
    title: '确认发起支付',
    content: `确定要发起支付吗？金额：¥${payForm.amount}，标题：${payForm.subject}`,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      payLoading.value = true
      payResult.value = null
      try {
        const res = await createPayment({
          channel: payForm.channel,
          amount: payForm.amount,
          subject: payForm.subject,
          body: payForm.body || undefined,
          storeId: payForm.storeId || undefined,
          operatorId: payForm.operatorId || undefined,
          terminalId: payForm.terminalId || undefined
        })
        if (res.code === 200) {
          payResult.value = res.data
          qrModalVisible.value = true
          pollStatusText.value = ''
          startPolling(res.data.outTradeNo)
        }
      } finally {
        payLoading.value = false
      }
    }
  })
}

const handleCancelPay = async () => {
  cancelPayLoading.value = true
  stopPolling()
  try {
    await closePayment({ outTradeNo: payResult.value?.outTradeNo })
    Message.info('支付已取消，订单已关闭')
  } catch {
    Message.warning('取消支付失败，请手动关闭订单')
  } finally {
    cancelPayLoading.value = false
    closeQrModal()
  }
}

onUnmounted(() => { stopPolling() })

// ==================== 订单查询 ====================
const queryOutTradeNo = ref('')
const queryTradeNo = ref('')
const queryLoading = ref(false)
const queryResult = ref(null)

const handleQuery = async () => {
  if (!queryOutTradeNo.value.trim()) {
    Message.warning('请输入商户订单号')
    return
  }
  queryLoading.value = true
  queryResult.value = null
  try {
    const res = await queryPayment({
      outTradeNo: queryOutTradeNo.value.trim(),
      tradeNo: queryTradeNo.value.trim() || undefined
    })
    if (res.code === 200) {
      queryResult.value = res.data
    }
  } catch (error) {
    Message.error(error?.message || '查询订单失败')
  } finally {
    queryLoading.value = false
  }
}

// ==================== 发起退款 ====================
const refundFormRef = ref(null)
const refundForm = reactive({
  outTradeNo: '',
  refundAmount: '',
  refundReason: ''
})
const refundLoading = ref(false)
const refundResult = ref(null)

// ==================== 查询退款状态 ====================
const refundQueryForm = reactive({ outTradeNo: '', outRequestNo: '', tradeNo: '' })
const refundQueryLoading = ref(false)
const refundQueryResult = ref(null)

const handleRefundQuery = async () => {
  if (!refundQueryForm.outTradeNo.trim()) {
    Message.warning('请输入商户订单号')
    return
  }
  if (!refundQueryForm.outRequestNo.trim()) {
    Message.warning('请输入退款请求号')
    return
  }
  refundQueryLoading.value = true
  refundQueryResult.value = null
  try {
    const res = await queryRefundStatus({
      outTradeNo: refundQueryForm.outTradeNo.trim(),
      outRequestNo: refundQueryForm.outRequestNo.trim(),
      tradeNo: refundQueryForm.tradeNo.trim() || undefined
    })
    if (res.code === 200) {
      refundQueryResult.value = res.data
    }
  } finally {
    refundQueryLoading.value = false
  }
}

const handleRefund = async () => {
  try {
    await refundFormRef.value.validate()
  } catch {
    return
  }

  Modal.confirm({
    title: '确认发起退款',
    content: `确定要对订单 ${refundForm.outTradeNo} 发起 ¥${refundForm.refundAmount} 的退款吗？`,
    okText: '确定退款',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      refundLoading.value = true
      refundResult.value = null
      try {
        const res = await refundPayment({
          outTradeNo: refundForm.outTradeNo,
          refundAmount: refundForm.refundAmount,
          refundReason: refundForm.refundReason || undefined
        })
        if (res.code === 200) {
          refundResult.value = res.data
          Message.success('退款请求已提交')
        }
      } catch (error) {
        Message.error(error?.message || '发起退款失败')
      } finally {
        refundLoading.value = false
      }
    }
  })
}

// ==================== 关闭/撤销 ====================
const closeOutTradeNo = ref('')
const closeTradeNo = ref('')
const closeOperatorId = ref('')
const closeLoading = ref(false)
const cancelLoading = ref(false)
const closeResult = ref(null)

const handleClose = async () => {
  if (!closeOutTradeNo.value.trim()) {
    Message.warning('请输入商户订单号')
    return
  }
  closeLoading.value = true
  closeResult.value = null
  try {
    const res = await closePayment({
      outTradeNo: closeOutTradeNo.value.trim() || undefined,
      tradeNo: closeTradeNo.value.trim() || undefined,
      operatorId: closeOperatorId.value.trim() || undefined
    })
    if (res.code === 200) {
      closeResult.value = res.data
      Message.success('订单关闭成功')
    }
  } catch (error) {
    Message.error(error?.message || '关闭订单失败')
  } finally {
    closeLoading.value = false
  }
}

const handleCancel = async () => {
  if (!closeOutTradeNo.value.trim()) {
    Message.warning('请输入商户订单号')
    return
  }
  cancelLoading.value = true
  closeResult.value = null
  try {
    const res = await cancelPayment({
      outTradeNo: closeOutTradeNo.value.trim() || undefined,
      tradeNo: closeTradeNo.value.trim() || undefined
    })
    if (res.code === 200) {
      closeResult.value = res.data
      Message.success('订单撤销成功')
    }
  } catch (error) {
    Message.error(error?.message || '撤销订单失败')
  } finally {
    cancelLoading.value = false
  }
}

// 工具函数
const getTradeStatusColor = (status) => {
  const map = {
    WAIT_BUYER_PAY: 'warning',
    TRADE_SUCCESS: 'success',
    TRADE_CLOSED: 'default',
    TRADE_FINISHED: 'purple'
  }
  return map[status] || 'default'
}

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
.qr-modal-body {
  padding: 8px 0;
}

.qr-code-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.poll-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  min-height: 24px;
}

.poll-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
