<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { checkExpiry } from '@/composables/useExpiryCheck'
import StatCard from '@/components/common/StatCard.vue'
import StockOverview from '@/components/warehouse/StockOverview.vue'
import StockInForm from '@/components/warehouse/StockInForm.vue'
import ExpiryManager from '@/components/warehouse/ExpiryManager.vue'
import BatchList from '@/components/warehouse/BatchList.vue'
import { Package, Boxes, AlertTriangle, AlertCircle } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()

const totalSkus = computed(() => inventoryStore.skus.length)

const totalStock = computed(() => {
  return inventoryStore.skus.reduce((sum, sku) => {
    return sum + inventoryStore.getStockBySku(sku.id)
  }, 0)
})

const warningBatchesCount = computed(() => {
  return inventoryStore.batches.filter(b => {
    const { level, daysLeft } = checkExpiry(b.expiryDate)
    return (level === 'yellow' || level === 'red') && daysLeft >= 0
  }).length
})

const outOfStockSkus = computed(() => {
  return inventoryStore.skus.filter(sku => inventoryStore.getStockBySku(sku.id) === 0).length
})
</script>

<template>
  <div class="bg-cream-50 min-h-screen space-y-6 pb-8">
    <div>
      <h2 class="text-xl font-semibold text-brown-500">仓管工作台</h2>
      <p class="text-sm text-brown-400 mt-1">库存管理与出入库操作</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="总SKU数"
        :value="totalSkus"
        :icon="Package"
        level="default"
      />
      <StatCard
        title="总库存罐数"
        :value="totalStock"
        :icon="Boxes"
        level="green"
      />
      <StatCard
        title="临期批次数"
        :value="warningBatchesCount"
        :icon="AlertTriangle"
        level="orange"
      />
      <StatCard
        title="缺货SKU数"
        :value="outOfStockSkus"
        :icon="AlertCircle"
        level="red"
      />
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <div class="lg:w-[60%]">
        <div class="rounded-xl2 bg-white shadow-softer p-5">
          <h3 class="text-base font-semibold text-brown-500 mb-4">到货入库登记</h3>
          <StockInForm />
        </div>
      </div>
      <div class="lg:w-[40%]">
        <div class="rounded-xl2 bg-white shadow-softer p-5">
          <h3 class="text-base font-semibold text-brown-500 mb-4">效期管理</h3>
          <ExpiryManager />
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="rounded-xl2 bg-white shadow-softer p-5">
        <h3 class="text-base font-semibold text-brown-500 mb-4">库存总览</h3>
        <StockOverview />
      </div>
      <div class="rounded-xl2 bg-white shadow-softer p-5">
        <h3 class="text-base font-semibold text-brown-500 mb-4">批次明细</h3>
        <BatchList />
      </div>
    </div>
  </div>
</template>
