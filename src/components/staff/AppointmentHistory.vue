<script setup lang="ts">
import { computed } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { useMemberStore } from '@/stores/member'
import { useInventoryStore } from '@/stores/inventory'
import DataTable from '@/components/common/DataTable.vue'
import type { Appointment } from '@/types'

interface Props {
  memberId?: string
}

const props = withDefaults(defineProps<Props>(), {
  memberId: '',
})

const appointmentStore = useAppointmentStore()
const memberStore = useMemberStore()
const inventoryStore = useInventoryStore()

const appointments = computed<Appointment[]>(() => {
  if (props.memberId) {
    return appointmentStore.getAppointmentsByMember(props.memberId)
  }
  return [...appointmentStore.appointments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const columns = [
  { key: 'id', label: '预约号', width: '140px' },
  { key: 'babyName', label: '宝宝' },
  { key: 'skuName', label: '商品' },
  { key: 'cans', label: '罐数', width: '80px' },
  { key: 'pickupTime', label: '到店时间', width: '160px' },
  { key: 'status', label: '状态', width: '100px' },
  { key: 'actions', label: '操作', width: '180px' },
]

const rows = computed(() => {
  return appointments.value.map(a => {
    const baby = memberStore.babies.find(b => b.id === a.babyId)
    const sku = inventoryStore.skus.find(s => s.id === a.skuId)
    return {
      id: a.id,
      babyName: baby?.name || '-',
      skuName: sku ? `${sku.brand} ${sku.stage}` : '-',
      cans: a.cans + '罐',
      pickupTime: a.pickupTime,
      status: a.status,
      _appointment: a,
    }
  })
})

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-orange-soft', text: 'text-orange-500', label: '待取货' },
  completed: { bg: 'bg-mint-soft', text: 'text-mint-600', label: '已完成' },
  cancelled: { bg: 'bg-brown-300/40', text: 'text-brown-400', label: '已取消' },
}

function handleComplete(id: string) {
  const result = appointmentStore.completeAppointment(id)
  if (!result.success) alert(result.message)
}

function handleCancel(id: string) {
  if (!confirm('确定取消该预约吗？库存将退回。')) return
  const result = appointmentStore.cancelAppointment(id)
  if (!result.success) alert(result.message)
}
</script>

<template>
  <div class="card-base space-y-4">
    <h3 class="text-base font-semibold text-brown-500">
      {{ memberId ? '会员预约记录' : '预约历史' }}
    </h3>

    <DataTable :columns="columns" :rows="rows as any">
      <template #cell="{ row, key }">
        <template v-if="key === 'status'">
          <span
            :class="[
              'rounded-lg px-2.5 py-1 text-xs font-medium',
              statusConfig[row.status as string]?.bg,
              statusConfig[row.status as string]?.text,
            ]"
          >
            {{ statusConfig[row.status as string]?.label }}
          </span>
        </template>
        <template v-else-if="key === 'actions'">
          <div v-if="row.status === 'pending'" class="flex items-center gap-2">
            <button
              @click="handleComplete(row.id as string)"
              class="btn-outline !px-3 !py-1.5 !text-xs"
            >
              完成取货
            </button>
            <button
              @click="handleCancel(row.id as string)"
              class="btn-ghost !px-3 !py-1.5 !text-xs"
            >
              取消预约
            </button>
          </div>
        </template>
        <template v-else>{{ row[key as string] }}</template>
      </template>
    </DataTable>
  </div>
</template>
