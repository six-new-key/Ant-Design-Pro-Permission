<template>
  <div class="member-package-preview">
    <!-- 背景效果 -->
    <div class="particles-bg" ref="particlesBg"></div>
    <div class="grid-bg"></div>
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>
    <div class="glow-orb glow-orb-3"></div>

    <div class="container">
      <!-- 头部区域 -->
      <header>
        <h1>解锁无限可能</h1>
        <p class="subtitle">
          尊享会员专属权益，开启极致体验之旅。选择适合您的计划，享受前所未有的优质服务。
        </p>
      </header>

      <!-- 套餐卡片网格 -->
      <div class="pricing-grid" v-if="enabledPackages.length > 0">
        <div
          v-for="(pkg, index) in enabledPackages"
          :key="pkg.id"
          class="card fade-in"
          :class="[getCardClass(pkg), { visible: isVisible }]"
          :style="{ 'transition-delay': `${index * 0.1}s` }"
          @mousemove="handleCardHover($event, index)"
          @mouseleave="handleCardLeave($event, pkg)"
        >
          <!-- 扫描光效 -->
          <div class="card-scan"></div>

          <!-- 角落装饰 -->
          <div
            class="corner-decoration top-left"
            :style="getCornerStyle(pkg)"
          ></div>
          <div
            class="corner-decoration bottom-right"
            :style="getCornerStyle(pkg)"
          ></div>

          <!-- 卡片头部 -->
          <div class="card-header">
            <h3 class="plan-name" :style="getNameStyle(pkg)">{{ pkg.name }}</h3>
            <div style="text-align: center">
              <span class="save-tag" :style="getSaveTagStyle(pkg)">
                {{ pkg.dailyFee || "-" }}
              </span>
            </div>
          </div>

          <!-- 价格区域 -->
          <div class="price-container" :style="getPriceStyle(pkg)">
            <span class="old-price">原价 ¥{{ pkg.oldPrice || "-" }}</span>
            <span class="new-price">
              <span class="currency">¥</span>{{ pkg.price
              }}<span class="period">
                <span style="margin-right: 4px">/</span>
                {{ pkg.durationDays }} 天</span
              >
            </span>
          </div>

          <!-- 购买按钮 -->
          <button
            class="btn"
            :class="isPremium(pkg) ? 'btn-premium' : 'btn-default'"
            @click="handlePurchase(pkg)"
          >
            {{ isHighPrice(pkg) ? "尊享升级" : "立即开通" }}
          </button>

          <!-- 功能列表 -->
          <ul class="features">
            <li v-for="(feature, i) in getFeatures(pkg)" :key="i">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 空状态 -->
      <a-empty v-else description="暂无可用套餐" class="empty-state" />
    </div>

    <!-- 支付弹窗 -->
    <PaymentInfo
      v-model:visible="paymentVisible"
      :defaultAmount="paymentAmount"
      :defaultSubject="paymentSubject"
      @success="onPaySuccess"
      @timeout="onPayTimeout"
      @cancel="onPayCancel"
      @error="onPayError"
      @close="onPayClose"
    />
  </div>
</template>

<script setup>
import { StarFilled, CrownFilled, GiftFilled } from "@ant-design/icons-vue";
import { useMemberPackagePreview } from "./composables/useMemberPackagePreview";
import PaymentInfo from "@/components/custom/PaymentInfo.vue";

const {
  particlesBg,
  isVisible,
  floatingElements,
  enabledPackages,
  paymentVisible,
  currentPackage,
  paymentAmount,
  paymentSubject,
  isPremium,
  isHighPrice,
  getCardClass,
  getOldPrice,
  getSaveTag,
  getCornerStyle,
  getIconStyle,
  getNameStyle,
  getPriceStyle,
  getSaveTagStyle,
  getFeatures,
  handleCardHover,
  handleCardLeave,
  handlePurchase,
  closeModal,
  handleModalClick,
  // 支付事件处理
  onPaySuccess,
  onPayTimeout,
  onPayCancel,
  onPayError,
  onPayClose,
} = useMemberPackagePreview();
</script>

<style lang="scss" scoped>
@import "./styles/memberPackagePreview.scss";
</style>
