<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { checkExpiry } from '@/composables/useExpiryCheck'

const inventoryStore = useInventoryStore()
const selectedSkuId = ref('')

const sortedBatches = computed(() => {
  let list = [...inventoryStore.batches]
  if (selectedSkuId.value) {
    list = list.filter(b => b.skuId === selectedSkuId.value)
  }
  list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
  return list.map(batch => {
    const sku = inventoryStore.skus.find(s => s.id === batch.skuId)
    const expiry = checkExpiry(batch.expiryDate)
    return {
      ...batch,
      skuName: sku ? `${sku.brand} ${sku.stage}` : batch.skuId,
      ...expiry,
    }
  })
})

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
    <div class="flex items-center gap-3">
      <label class="text-sm text-brown-400 whitespace-nowrap">按SKU筛选：</label>
      <select
        v-model="selectedSkuId"
        class="px-3 py-2 rounded-lg border border-cream-200 bg-white text-sm text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition min-w-[200px]"
      >
        <option value="">全部商品</option>
        <option v-for="sku in inventoryStore.skus" :key="sku.id" :value="sku.id">
          {{ sku.brand }} {{ sku.stage }}
        </option>
      </select>
    </div>
    <div class="rounded-xl2 overflow-hidden bg-white shadow-softer">
      <table class="w-full">
        <thead>
          <tr class="bg-cream-50">
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">批次号</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">商品</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">供应商</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">入库日期</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">数量</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">生产/过期</th>
            <th class="text-xs font-medium text-brown-400 py-3 px-4 text-left">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(batch, idx) in sortedBatches"
            :key="batch.id"
            :class="[
              'border-b border-cream-100 hover:bg-cream-50 transition-colors',
              idx % 2 === 1 ? 'bg-cream-50/40' : '',
            ]"
          >
            <td class="py-3 px-4 text-sm text-brown-500 font-mono">{{ batch.batchNo }}</td>
            <td class="py-3 px-4 text-sm text-brown-500">{{ batch.skuName }}</td>
            <td class="py-3 px-4 text-sm text-brown-400">{{ batch.supplier }}</td>
            <td class="py-3 px-4 text-sm text-brown-400">{{ batch.receivedDate }}</td>
            <td class="py-3 px-4 text-sm text-brown-500 font-medium">{{ batch.quantity }}</td>
            <td class="py-3 px-4 text-sm text-brown-400">
              <div>{{ batch.productionDate }}</div>
              <div class="text-xs mt-0.5">{{ batch.expiryDate }}</div>
            </td>
            <td class="py-3 px-4">
              <span
                :class="['px-2 py-1 rounded text-xs font-medium', getStatusBadge(batch.level, batch.daysLeft).class]"
              >
                {{ getStatusBadge(batch.level, batch.daysLeft).text }}
              </span>
            </td>
          </tr>
          <tr v-if="sortedBatches.length === 0">
            <td colspan="7" class="py-12 text-center text-brown-300 text-sm">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
