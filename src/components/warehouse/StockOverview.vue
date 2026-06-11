<script setup lang="ts">
import { useInventoryStore } from '@/stores/inventory'
import { checkExpiry } from '@/composables/useExpiryCheck'
import type { MilkSku } from '@/types'

const inventoryStore = useInventoryStore()

const getStockInfo = (sku: MilkSku) => {
  const stock = inventoryStore.getStockBySku(sku.id)
  const nearest = inventoryStore.getNearestExpiry(sku.id)
  const expiryInfo = nearest ? checkExpiry(nearest.expiryDate) : null

  let stockColor = ''
  let stockLabel = ''
  let stockLabelClass = ''

  if (stock === 0) {
    stockColor = 'text-coral-500'
    stockLabel = '缺货'
    stockLabelClass = 'bg-coral-soft text-coral-500'
  } else if (stock < 3) {
    stockColor = 'text-orange-500'
    stockLabel = '紧张'
    stockLabelClass = 'bg-orange-soft text-orange-500'
  } else {
    stockColor = 'text-mint-600'
    stockLabel = '充足'
    stockLabelClass = 'bg-mint-soft text-mint-600'
  }

  let progressColor = ''
  if (expiryInfo) {
    if (expiryInfo.level === 'green') {
      progressColor = 'bg-mint-500'
    } else if (expiryInfo.level === 'yellow') {
      progressColor = 'bg-orange-400'
    } else {
      progressColor = 'bg-coral-500'
    }
  } else {
    progressColor = 'bg-cream-200'
  }

  const progressPercent = expiryInfo
    ? Math.max(0, Math.min(100, (expiryInfo.daysLeft / 730) * 100))
    : 0

  return {
    stock,
    stockColor,
    stockLabel,
    stockLabelClass,
    expiryInfo,
    progressColor,
    progressPercent,
  }
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="sku in inventoryStore.skus"
      :key="sku.id"
      class="rounded-xl2 bg-white p-4 shadow-softer hover:shadow-soft transition"
    >
      <div class="flex justify-between items-start mb-3">
        <span class="font-medium text-brown-500 text-sm">{{ sku.brand }}</span>
        <span class="stage bg-pink-soft text-pink-500 px-2 py-0.5 rounded text-xs">
          {{ sku.stage }}
        </span>
      </div>
      <div class="mb-3">
        <div class="flex items-baseline gap-2">
          <span
            :class="['text-3xl font-bold', getStockInfo(sku).stockColor]"
          >
            {{ getStockInfo(sku).stock }}
          </span>
          <span
            :class="['px-2 py-0.5 rounded text-xs font-medium', getStockInfo(sku).stockLabelClass]"
          >
            {{ getStockInfo(sku).stockLabel }}
          </span>
        </div>
        <div v-if="getStockInfo(sku).expiryInfo" class="text-xs text-brown-300 mt-1">
          最近过期：{{ getStockInfo(sku).expiryInfo?.label }}
        </div>
        <div v-else class="text-xs text-brown-300 mt-1">
          最近过期：无
        </div>
      </div>
      <div class="h-1.5 rounded-full bg-cream-100 overflow-hidden">
        <div
          :class="['h-full rounded-full transition-all', getStockInfo(sku).progressColor]"
          :style="{ width: `${getStockInfo(sku).progressPercent}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
