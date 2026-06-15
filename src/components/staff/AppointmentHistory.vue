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
  { key: 'actions', label: '操作', width: '200px' },
]

const rows = computed(() => {
  return appointments.value.map(a => {
    const baby = memberStore.babies.find(b => b.id === a.babyId)
    const sku = inventoryStore.skus.find(s => s.id === a.skuId)
    const originalSku = a.originalSkuId ? inventoryStore.skus.find(s => s.id === a.originalSkuId) : null
    const transitionRecord = a.stageTransitionId
      ? appointmentStore.stageTransitionRecords.find(r => r.id === a.stageTransitionId)
      : null
    return {
      id: a.id,
      babyName: baby?.name || '-',
      skuName: sku ? `${sku.brand} ${sku.stage}` : '-',
      originalSkuName: originalSku ? `${originalSku.brand} ${originalSku.stage}` : '',
      cans: a.cans + '罐',
      pickupTime: a.pickupTime,
      status: a.status,
      stockAlternativeChoice: a.stockAlternativeChoice,
      expectedArrival: a.expectedArrival,
      hasStageTransition: !!a.stageTransitionId,
      transitionInfo: transitionRecord
        ? `${transitionRecord.fromStage}→${transitionRecord.toStage}`
        : '',
      _appointment: a,
    }
  })
})

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-orange-soft', text: 'text-orange-500', label: '待取货' },
  completed: { bg: 'bg-mint-soft', text: 'text-mint-600', label: '已完成' },
  cancelled: { bg: 'bg-brown-300/40', text: 'text-brown-400', label: '已取消' },
  waiting_stock: { bg: 'bg-orange-soft', text: 'text-orange-500', label: '等待到货' },
  substituted: { bg: 'bg-mint-soft', text: 'text-mint-600', label: '已替代' },
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

function handleSubstitute(appointmentId: string, substituteSkuId: string) {
  const result = appointmentStore.handleStockAlternative(appointmentId, 'substitute', substituteSkuId)
  if (result.success) {
    alert('替代成功！')
  } else {
    alert(result.message || '替代失败')
  }
}
</script>

<template>
  <div class="card-base space-y-4">
    <h3 class="text-base font-semibold text-brown-500">
      {{ memberId ? '会员预约记录' : '预约历史' }}
    </h3>

    <DataTable :columns="columns" :rows="rows as any">
      <template #cell="{ row, key }">
        <template v-if="key === 'skuName'">
          <div>
            <span>{{ row.skuName }}</span>
            <div v-if="row.originalSkuName && row.status === 'substituted'" class="text-xs text-brown-400 mt-0.5">
              原预约：{{ row.originalSkuName }}
            </div>
            <div v-if="row.hasStageTransition" class="text-xs text-mint-600 mt-0.5">
              换段：{{ row.transitionInfo }}
            </div>
          </div>
        </template>
        <template v-else-if="key === 'status'">
          <div>
            <span
              :class="[
                'rounded-lg px-2.5 py-1 text-xs font-medium',
                statusConfig[row.status as string]?.bg,
                statusConfig[row.status as string]?.text,
              ]"
            >
              {{ statusConfig[row.status as string]?.label }}
            </span>
            <div v-if="row.expectedArrival && row.status === 'waiting_stock'" class="text-xs text-orange-500 mt-1">
              预计到货：{{ row.expectedArrival }}
            </div>
          </div>
        </template>
        <template v-else-if="key === 'actions'">
          <div class="flex items-center gap-2 flex-wrap">
            <template v-if="row.status === 'pending'">
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
            </template>
            <template v-else-if="row.status === 'waiting_stock'">
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
            </template>
            <template v-else-if="row.status === 'substituted'">
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
            </template>
          </div>
        </template>
        <template v-else>{{ row[key as string] }}</template>
      </template>
    </DataTable>
  </div>
</template>
