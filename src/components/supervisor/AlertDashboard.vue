<script setup lang="ts">
import { computed } from 'vue'
import { Package, AlertCircle, Clock, AlertTriangle } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'

const inventoryStore = useInventoryStore()

const lowStockSkus = computed(() => {
  return inventoryStore.skus
    .map((sku) => ({
      sku,
      stock: inventoryStore.getStockBySku(sku.id),
    }))
    .filter((item) => item.stock < 3 && item.stock > 0)
})

const today = new Date()
const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

const nearExpiryBatches = computed(() => {
  return inventoryStore.batches.filter((b) => {
    if (b.quantity <= 0) return false
    const expiry = new Date(b.expiryDate)
    return expiry >= today && expiry <= ninetyDaysLater
  })
})

const expiredBatches = computed(() => {
  return inventoryStore.batches.filter((b) => {
    if (b.quantity <= 0) return false
    return new Date(b.expiryDate) < today
  })
})

const pendingStockOuts = computed(() => {
  return inventoryStore.stockOuts.filter((so) => so.status === 'pending')
})

interface AlertItem {
  icon: typeof Package
  title: string
  count: number
  linkText: string
  bgClass: string
  accentClass: string
  iconClass: string
  badgeClass: string
  detailList: string[]
}

const alertItems = computed<AlertItem[]>(() => [
  {
    icon: Package,
    title: '库存预警',
    count: lowStockSkus.value.length,
    linkText: '立即补货',
    bgClass: 'bg-gradient-to-br from-orange-50 to-orange-soft/30',
    accentClass: 'border-l-4 border-orange-400',
    iconClass: 'text-orange-500',
    badgeClass: 'bg-orange-400 text-white',
    detailList: lowStockSkus.value.slice(0, 3).map((item) => `${item.sku.name}（剩${item.stock}罐）`),
  },
  {
    icon: Clock,
    title: '临期预警',
    count: nearExpiryBatches.value.length,
    linkText: '查看批次',
    bgClass: 'bg-gradient-to-br from-yellow-50 to-yellow-100/60',
    accentClass: 'border-l-4 border-yellow-400',
    iconClass: 'text-yellow-500',
    badgeClass: 'bg-yellow-400 text-white',
    detailList: nearExpiryBatches.value.slice(0, 3).map((b) => {
      const sku = inventoryStore.skus.find((s) => s.id === b.skuId)
      return `${sku?.name || b.skuId}（${b.expiryDate}到期）`
    }),
  },
  {
    icon: AlertTriangle,
    title: '过期批次告警',
    count: expiredBatches.value.length,
    linkText: '立即处理',
    bgClass: 'bg-gradient-to-br from-red-50 to-coral-soft/30',
    accentClass: 'border-l-4 border-coral-500',
    iconClass: 'text-coral-500',
    badgeClass: 'bg-coral-500 text-white',
    detailList: expiredBatches.value.slice(0, 3).map((b) => {
      const sku = inventoryStore.skus.find((s) => s.id === b.skuId)
      return `${sku?.name || b.skuId}（批次${b.batchNo}）`
    }),
  },
  {
    icon: AlertCircle,
    title: '未处理缺货登记',
    count: pendingStockOuts.value.length,
    linkText: '去处理',
    bgClass: 'bg-gradient-to-br from-pink-50 to-pink-soft/50',
    accentClass: 'border-l-4 border-pink-400',
    iconClass: 'text-pink-400',
    badgeClass: 'bg-pink-400 text-white',
    detailList: pendingStockOuts.value.slice(0, 3).map((so) => {
      const sku = inventoryStore.skus.find((s) => s.id === so.skuId)
      return `${sku?.name || so.skuId}（缺${so.quantity}罐）`
    }),
  },
])

const handleLinkClick = (title: string) => {
  console.log('跳转到', title)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="item in alertItems"
      :key="item.title"
      :class="[
        'relative rounded-xl2 shadow-softer overflow-hidden transition-all hover:shadow-soft hover:-translate-y-0.5',
        item.bgClass,
        item.accentClass,
      ]"
    >
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              <component :is="item.icon" :class="['w-5 h-5', item.iconClass]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold text-brown-500">{{ item.title }}</h4>
                <span
                  :class="[
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
                    item.badgeClass,
                  ]"
                >
                  {{ item.count }}
                </span>
              </div>
              <div class="mt-2 space-y-1" v-if="item.detailList.length > 0">
                <p
                  v-for="(detail, idx) in item.detailList"
                  :key="idx"
                  class="text-xs text-brown-400 truncate"
                >
                  · {{ detail }}
                </p>
                <p v-if="item.count > 3" class="text-xs text-brown-300">
                  等共 {{ item.count }} 项...
                </p>
              </div>
              <p v-else class="mt-2 text-xs text-brown-300">暂无异常项</p>
            </div>
          </div>
          <button
            @click="handleLinkClick(item.title)"
            class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 text-brown-500 hover:bg-white hover:shadow-sm transition-all"
          >
            {{ item.linkText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
