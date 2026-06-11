<script setup lang="ts">
import { computed } from 'vue'
import { Gift, Package, AlertCircle, CheckCircle, TrendingUp } from 'lucide-vue-next'
import { useAppointmentStore } from '@/stores/appointment'
import { useInventoryStore } from '@/stores/inventory'
import StatCard from '@/components/common/StatCard.vue'
import ActivityStats from '@/components/supervisor/ActivityStats.vue'
import AlertDashboard from '@/components/supervisor/AlertDashboard.vue'
import RedemptionRecords from '@/components/supervisor/RedemptionRecords.vue'
import StockOutList from '@/components/supervisor/StockOutList.vue'

const appointmentStore = useAppointmentStore()
const inventoryStore = useInventoryStore()

const totalAppointments = computed(() => appointmentStore.appointments.length)
const totalRedeemed = computed(() => appointmentStore.redemptions.filter((r) => r.status === 'redeemed').length)
const redemptionRate = computed(() => {
  const total = appointmentStore.redemptions.length
  if (total === 0) return 0
  return Math.round((totalRedeemed.value / total) * 100)
})
const pendingStockOuts = computed(() => inventoryStore.stockOuts.filter((so) => so.status === 'pending').length)
</script>

<template>
  <div class="space-y-6 bg-cream-50 -m-6 p-6 min-h-screen">
    <div>
      <h2 class="text-xl font-semibold text-brown-500">督导工作台</h2>
      <p class="text-sm text-brown-400 mt-1">数据监控与门店管理</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="累计预约"
        :value="totalAppointments"
        :icon="Gift"
        level="green"
        trend="+12%"
      />
      <StatCard
        title="已核销"
        :value="totalRedeemed"
        :icon="CheckCircle"
        level="green"
        trend="+8%"
      />
      <StatCard
        title="核销率"
        :value="`${redemptionRate}%`"
        :icon="TrendingUp"
        level="orange"
      />
      <StatCard
        title="待处理缺货"
        :value="pendingStockOuts"
        :icon="AlertCircle"
        level="red"
      />
    </div>

    <div class="flex flex-col lg:flex-row gap-4">
      <div class="lg:w-[55%] w-full rounded-xl2 shadow-softer p-5 bg-white">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-brown-500 flex items-center gap-2">
            <Gift class="w-5 h-5 text-pink-400" />
            <span>活动核销进度</span>
          </h3>
        </div>
        <ActivityStats />
      </div>
      <div class="lg:w-[45%] w-full rounded-xl2 shadow-softer p-5 bg-white">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-brown-500 flex items-center gap-2">
            <AlertCircle class="w-5 h-5 text-coral-500" />
            <span>异常告警看板</span>
          </h3>
        </div>
        <AlertDashboard />
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4">
      <div class="lg:w-[50%] w-full rounded-xl2 shadow-softer p-5 bg-white">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-brown-500 flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-mint-500" />
            <span>核销记录</span>
          </h3>
        </div>
        <RedemptionRecords />
      </div>
      <div class="lg:w-[50%] w-full rounded-xl2 shadow-softer p-5 bg-white">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-brown-500 flex items-center gap-2">
            <Package class="w-5 h-5 text-orange-500" />
            <span>缺货登记</span>
          </h3>
        </div>
        <StockOutList />
      </div>
    </div>
  </div>
</template>
