import { ref, computed, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { getMemberPackageList } from '@/api/member-package'

export function useMemberPackagePreview() {
  // 套餐数据
  const packages = ref([])
  const isVisible = ref(false)
  const particlesBg = ref(null)

  // 弹窗状态
  const paymentVisible = ref(false)

  // 当前选中的套餐
  const currentPackage = ref(null)

  // 支付金额和标题（根据当前套餐动态计算）
  const paymentAmount = computed(() => {
    return currentPackage.value ? String(currentPackage.value.price) : ''
  })

  const paymentSubject = computed(() => {
    return currentPackage.value ? currentPackage.value.name : ''
  })

  // 浮动装饰元素
  const floatingElements = ref([])

  // 只显示启用的套餐，并按价格从低到高排序
  const enabledPackages = computed(() => {
    return packages.value
      .sort((a, b) => a.price - b.price)
  })

  // 判断套餐类型
  const isPremium = (pkg) => {
    return pkg.recommend === 1
  }

  //判断是否是价格最高
  const isHighPrice = (pkg) => {
    return enabledPackages.value[enabledPackages.value.length - 1].id === pkg.id
  }

  // 获取卡片样式类
  const getCardClass = (pkg) => {
    const classes = []
    if (isPremium(pkg)) {
      classes.push('yearly')
    }
    return classes
  }

  // 获取角落装饰样式
  const getCornerStyle = (pkg) => {
    if (isPremium(pkg)) {
      return { borderColor: 'rgba(251, 191, 36, 0.3)' }
    }
    return {}
  }

  // 获取图标样式
  const getIconStyle = (pkg) => {
    if (isPremium(pkg)) {
      return {
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
        borderColor: 'rgba(251, 191, 36, 0.4)'
      }
    }
    return {}
  }

  // 获取名称样式
  const getNameStyle = (pkg) => {
    if (isPremium(pkg)) {
      return {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }
    }
    return {}
  }

  // 获取价格容器样式
  const getPriceStyle = (pkg) => {
    if (isPremium(pkg)) {
      return {
        background: 'rgba(251, 191, 36, 0.05)',
        borderColor: 'rgba(251, 191, 36, 0.15)'
      }
    }
    return {}
  }

  // 获取优惠标签样式
  const getSaveTagStyle = (pkg) => {
    if (isPremium(pkg)) {
      return {
        background: 'rgba(251, 191, 36, 0.15)',
        color: '#fbbf24',
        borderColor: 'rgba(251, 191, 36, 0.3)'
      }
    }
    return {}
  }

  // 获取功能列表
  const getFeatures = (pkg) => {
    return pkg.functionList
      ? pkg.functionList.split('；').filter(Boolean)
      : []
  }

  // 卡片3D悬浮效果
  const handleCardHover = (e, index) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    const pkg = enabledPackages.value[index]
    if (isPremium(pkg)) {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`
    } else {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`
    }
  }

  const handleCardLeave = (e, pkg) => {
    const card = e.currentTarget
    card.style.transform = 'translateY(0) scale(1)'
  }

  // 购买处理
  const handlePurchase = (pkg) => {
    console.log(`用户选择了：${pkg.name}`)
    currentPackage.value = pkg
    paymentVisible.value = true
  }

  // 支付成功
  const onPaySuccess = ({ outTradeNo, tradeNo }) => {
    message.success(`支付成功！订单号：${outTradeNo}`)
    // 可以在这里刷新用户会员状态或跳转订单页面
    // loadPackages() // 刷新套餐列表
  }

  // 支付超时
  const onPayTimeout = ({ outTradeNo }) => {
    message.warning(`支付超时，订单 ${outTradeNo} 已关闭`)
  }

  // 用户取消支付
  const onPayCancel = ({ outTradeNo }) => {
    message.info(`支付已取消，订单 ${outTradeNo} 已关闭`)
  }

  // 支付错误
  const onPayError = (error) => {
    message.error(error?.message || '支付失败，请重试')
  }

  // 关闭支付弹窗
  const onPayClose = () => {
    console.log('支付弹窗关闭')
  }

  // 关闭弹窗
  const closeModal = () => {
    paymentVisible.value = false
  }

  // 点击遮罩层关闭弹窗
  const handleModalClick = () => {
    if (!modalLoading.value) {
      closeModal()
    }
  }

  // 创建粒子背景
  const createParticles = () => {
    if (!particlesBg.value) return

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.classList.add('particle')
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 20 + 's'
      particle.style.animationDuration = (15 + Math.random() * 10) + 's'
      particle.style.opacity = Math.random() * 0.5 + 0.1
      particlesBg.value.appendChild(particle)
    }
  }

  // 创建浮动装饰元素
  const createFloatingElements = () => {
    floatingElements.value = []
    for (let i = 0; i < 5; i++) {
      floatingElements.value.push({
        width: (20 + Math.random() * 30) + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        delay: Math.random() * 6 + 's'
      })
    }
  }

  // 加载套餐数据
  const loadPackages = async () => {
    try {
      const res = await getMemberPackageList()
      if (res.code === 200) {
        packages.value = res.data || []
      }
    } catch (error) {
      console.error('加载套餐失败:', error)
      message.error('加载套餐失败')
    }
  }

  onMounted(async () => {
    createFloatingElements()
    await loadPackages()
    await nextTick()
    createParticles()

    // 触发动画
    setTimeout(() => {
      isVisible.value = true
    }, 100)
  })

  return {
    // refs
    packages,
    isVisible,
    particlesBg,
    paymentVisible,
    currentPackage,

    // computed
    enabledPackages,
    paymentAmount,
    paymentSubject,

    // methods
    isPremium,
    isHighPrice,
    getCardClass,
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
    loadPackages,
    // 支付事件处理
    onPaySuccess,
    onPayTimeout,
    onPayCancel,
    onPayError,
    onPayClose
  }
}
