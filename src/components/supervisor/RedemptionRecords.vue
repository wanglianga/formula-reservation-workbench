<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileDown, Filter, CheckCircle, X } from 'lucide-vue-next'
import { useAppointmentStore } from '@/stores/appointment'
import DataTable from '@/components/common/DataTable.vue'
import type { RedemptionStatus } from '@/types'

const appointmentStore = useAppointmentStore()

const fromDate = ref('')
const toDate = ref('')
const statusFilter = ref<'all' | RedemptionStatus>('all')

const columns = [
  { key: 'id', label: '核销ID', width: '120px' },
  { key: 'giftItem', label: '赠品名称', width: '140px' },
  { key: 'appointmentId', label: '关联预约号', width: '110px' },
  { key: 'activityName', label: '活动来源', width: '130px' },
  { key: 'status', label: '状态', width: '110px' },
  { key: 'redeemedAt', label: '核销时间', width: '150px' },
  { key: 'operatorName', label: '操作人', width: '100px' },
]

const rows = computed(() => {
  return appointmentStore.redemptions
    .filter((r) => {
      if (statusFilter.value !== 'all' && r.status !== statusFilter.value) return false
      if (fromDate.value && r.redeemedAt && r.redeemedAt.slice(0, 10) < fromDate.value) return false
      if (toDate.value && r.redeemedAt && r.redeemedAt.slice(0, 10) > toDate.value) return false
      return true
    })
    .map((r) => {
      const activity = appointmentStore.activities.find((a) => a.id === r.activityId)
      return {
        id: r.id,
        giftItem: r.giftItem,
        appointmentId: r.appointmentId,
        activityName: activity?.name || '-',
        status: r.status,
        redeemedAt: r.redeemedAt || '-',
        operatorName: r.operatorName || '-',
      }
    })
})

const statusConfig = {
  pending: { text: '待核销', class: 'bg-orange-soft text-orange-500', icon: null },
  redeemed: { text: '已核销', class: 'bg-mint-soft text-mint-600', icon: CheckCircle },
  expired: { text: '已过期', class: 'bg-brown-300/40 text-brown-400', icon: X },
}

const handleExport = () => {
  console.log('导出CSV', { fromDate: fromDate.value, toDate: toDate.value, status: statusFilter.value })
}

const handleFilter = () => {
  console.log('应用筛选', { fromDate: fromDate.value, toDate: toDate.value, status: statusFilter.value })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <input
          v-model="fromDate"
          type="date"
          class="px-3 py-2 rounded-lg border border-cream-200 text-sm text-brown-500 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <span class="text-brown-300">至</span>
        <input
          v-model="toDate"
          type="date"
          class="px-3 py-2 rounded-lg border border-cream-200 text-sm text-brown-500 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>
      <select
        v-model="statusFilter"
        class="px-3 py-2 rounded-lg border border-cream-200 text-sm text-brown-500 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
      >
        <option value="all">全部</option>
        <option value="pending">待核销</option>
        <option value="redeemed">已核销</option>
        <option value="expired">已过期</option>
      </select>
      <button
        @click="handleFilter"
        class="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-brown-500 hover:bg-cream-100 transition-colors"
      >
        <Filter class="w-4 h-4" />
        <span>筛选</span>
      </button>
      <button
        @click="handleExport"
        class="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-brown-500 hover:bg-cream-100 transition-colors ml-auto"
      >
        <FileDown class="w-4 h-4" />
        <span>导出CSV</span>
      </button>
    </div>

    <DataTable :columns="columns" :rows="rows">
      <template #cell="{ row, key }">
        <template v-if="key === 'status'">
          <span
            :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              statusConfig[row.status as RedemptionStatus].class,
            ]"
          >
            <component
              v-if="statusConfig[row.status as RedemptionStatus].icon"
              :is="statusConfig[row.status as RedemptionStatus].icon"
              class="w-3.5 h-3.5"
            />
            {{ statusConfig[row.status as RedemptionStatus].text }}
          </span>
        </template>
        <template v-else>
          {{ row[key] }}
        </template>
      </template>
    </DataTable>
  </div>
</template>
