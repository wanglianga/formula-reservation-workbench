<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import DataTable from '@/components/common/DataTable.vue'
import type { StockOutStatus } from '@/types'

const inventoryStore = useInventoryStore()

const pendingCount = computed(() => inventoryStore.stockOuts.filter((so) => so.status === 'pending').length)
const resolvedCount = computed(() => inventoryStore.stockOuts.filter((so) => so.status === 'resolved').length)

const columns = [
  { key: 'skuName', label: '缺货商品', width: '140px' },
  { key: 'quantity', label: '缺数量', width: '80px' },
  { key: 'reportDate', label: '登记时间', width: '110px' },
  { key: 'expectedArrival', label: '预计到货', width: '110px' },
  { key: 'status', label: '状态', width: '90px' },
  { key: 'note', label: '备注', width: '140px' },
  { key: 'action', label: '操作', width: '110px' },
]

const rows = computed(() => {
  return inventoryStore.stockOuts.map((so) => {
    const sku = inventoryStore.skus.find((s) => s.id === so.skuId)
    return {
      id: so.id,
      skuName: sku?.name || so.skuId,
      quantity: so.quantity,
      reportDate: so.reportDate,
      expectedArrival: so.expectedArrival || '-',
      status: so.status,
      note: so.note || '-',
      action: so.status,
    }
  })
})

const statusConfig = {
  pending: { text: '待处理', class: 'bg-orange-soft text-orange-500' },
  resolved: { text: '已解决', class: 'bg-mint-soft text-mint-600' },
  cancelled: { text: '已取消', class: 'bg-brown-300/40 text-brown-400' },
}

const handleResolve = (id: string) => {
  console.log('标记已解决', id)
  inventoryStore.resolveStockOut(id)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-soft/50">
        <span class="text-xs text-orange-500">待处理</span>
        <span class="text-sm font-semibold text-orange-500">{{ pendingCount }}</span>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mint-soft/50">
        <span class="text-xs text-mint-600">已解决</span>
        <span class="text-sm font-semibold text-mint-600">{{ resolvedCount }}</span>
      </div>
    </div>

    <DataTable :columns="columns" :rows="rows">
      <template #cell="{ row, key }">
        <template v-if="key === 'status'">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              statusConfig[row.status as StockOutStatus].class,
            ]"
          >
            {{ statusConfig[row.status as StockOutStatus].text }}
          </span>
        </template>
        <template v-else-if="key === 'action'">
          <button
            v-if="row.status === 'pending'"
            @click="handleResolve(row.id as string)"
            class="btn-outline px-3 py-1.5 rounded-lg text-xs text-brown-500 border border-cream-200 hover:bg-cream-50 transition-colors"
          >
            标记已解决
          </button>
        </template>
        <template v-else>
          {{ row[key] }}
        </template>
      </template>
    </DataTable>
  </div>
</template>
