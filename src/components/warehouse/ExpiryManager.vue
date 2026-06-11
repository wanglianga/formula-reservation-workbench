<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { checkExpiry } from '@/composables/useExpiryCheck'

type TabKey = 'all' | 'warning' | 'expired'

const inventoryStore = useInventoryStore()
const activeTab = ref<TabKey>('warning')

const tabs = [
  { key: 'all' as TabKey, label: '全部' },
  { key: 'warning' as TabKey, label: '临期预警' },
  { key: 'expired' as TabKey, label: '已过期' },
]

const batchesWithExpiry = computed(() => {
  return inventoryStore.batches.map(batch => {
    const sku = inventoryStore.skus.find(s => s.id === batch.skuId)
    const expiry = checkExpiry(batch.expiryDate)
    return {
      ...batch,
      skuName: sku ? `${sku.brand} ${sku.stage}` : batch.skuId,
      ...expiry,
    }
  })
})

const filteredBatches = computed(() => {
  switch (activeTab.value) {
    case 'warning':
      return batchesWithExpiry.value.filter(
        b => (b.level === 'yellow' || b.level === 'red') && b.daysLeft >= 0
      )
    case 'expired':
      return batchesWithExpiry.value.filter(b => b.daysLeft < 0)
    case 'all':
    default:
      return batchesWithExpiry.value
  }
})

const getDaysLeftColor = (level: string, daysLeft: number) => {
  if (daysLeft < 0) return 'text-coral-500 font-bold'
  if (level === 'green') return 'text-mint-600'
  if (level === 'yellow') return 'text-orange-500'
  return 'text-coral-500'
}

const getStatusBadge = (level: string, daysLeft: number) => {
  if (daysLeft < 0) {
    return { class: 'bg-coral-500 text-white font-bold', text: '已过期' }
  }
  if (level === 'green') {
    return { class: 'bg-mint-soft text-mint-600', text: '正常' }
  }
  if (level === 'yellow') {
    return { class: 'bg-orange-soft text-orange-500', text: '临期' }
  }
  return { class: 'bg-coral-soft text-coral-500', text: '即将过期' }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
          activeTab === tab.key
            ? 'bg-pink-400 text-white'
            : 'bg-cream-100 text-brown-400 hover:bg-cream-200',
        ]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="rounded-xl2 overflow-hidden bg-white shadow-softer border border-cream-100">
      <table class="w-full">
        <thead>
          <tr class="bg-cream-50">
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">批次号</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">商品</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">数量</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">生产</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">过期</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">剩余</th>
            <th class="text-xs font-medium text-brown-400 py-2.5 px-3 text-left">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(batch, idx) in filteredBatches"
            :key="batch.id"
            :class="[
              'border-b border-cream-100 hover:bg-cream-50 transition-colors',
              idx % 2 === 1 ? 'bg-cream-50/40' : '',
            ]"
          >
            <td class="py-2.5 px-3 text-xs text-brown-500 font-mono">{{ batch.batchNo }}</td>
            <td class="py-2.5 px-3 text-xs text-brown-500">{{ batch.skuName }}</td>
            <td class="py-2.5 px-3 text-xs text-brown-500">{{ batch.quantity }}</td>
            <td class="py-2.5 px-3 text-xs text-brown-400">{{ batch.productionDate }}</td>
            <td class="py-2.5 px-3 text-xs text-brown-400">{{ batch.expiryDate }}</td>
            <td :class="['py-2.5 px-3 text-xs', getDaysLeftColor(batch.level, batch.daysLeft)]">
              {{ batch.daysLeft < 0 ? `过期${Math.abs(batch.daysLeft)}天` : `${batch.daysLeft}天` }}
            </td>
            <td class="py-2.5 px-3">
              <span
                :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusBadge(batch.level, batch.daysLeft).class]"
              >
                {{ getStatusBadge(batch.level, batch.daysLeft).text }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredBatches.length === 0">
            <td colspan="7" class="py-8 text-center text-brown-300 text-xs">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
