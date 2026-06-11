<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useInventoryStore } from '@/stores/inventory'
import { useAppointmentStore } from '@/stores/appointment'
import StatCard from '@/components/common/StatCard.vue'
import BabyProfileCard from '@/components/staff/BabyProfileCard.vue'
import StageMatchPanel from '@/components/staff/StageMatchPanel.vue'
import AppointmentForm from '@/components/staff/AppointmentForm.vue'
import GiftQualification from '@/components/staff/GiftQualification.vue'
import AppointmentHistory from '@/components/staff/AppointmentHistory.vue'
import { CalendarDays, Package, CheckCircle2, AlertTriangle } from 'lucide-vue-next'

const memberStore = useMemberStore()
const inventoryStore = useInventoryStore()
const appointmentStore = useAppointmentStore()

const selectedSkuId = ref('')
const formCans = ref(1)

const todayStr = new Date().toISOString().slice(0, 10)
const currentMonthStr = new Date().toISOString().slice(0, 7)

const todayAppointments = computed(() => {
  return appointmentStore.appointments.filter(a => a.pickupTime.startsWith(todayStr)).length
})

const pendingCount = computed(() => {
  return appointmentStore.appointments.filter(a => a.status === 'pending').length
})

const monthCompleted = computed(() => {
  return appointmentStore.appointments.filter(
    a => a.status === 'completed' && a.createdAt.startsWith(currentMonthStr)
  ).length
})

const lowStockSkuCount = computed(() => {
  return inventoryStore.skus.filter(s => inventoryStore.getStockBySku(s.id) < 5).length
})

function handleSkuSelect(skuId: string) {
  selectedSkuId.value = skuId
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-xl font-semibold text-brown-500">店员工作台</h2>
      <p class="text-sm text-brown-400 mt-1">管理预约订单与会员服务</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
      <div class="space-y-5">
        <BabyProfileCard />
        <GiftQualification
          :sku-id="selectedSkuId"
          :cans="formCans"
          :member-level-id="memberStore.selectedMember?.memberLevelId"
        />
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="今日预约数"
            :value="todayAppointments"
            :icon="CalendarDays"
            level="default"
          />
          <StatCard
            title="待取货数"
            :value="pendingCount"
            :icon="Package"
            level="orange"
          />
          <StatCard
            title="本月完成数"
            :value="monthCompleted"
            :icon="CheckCircle2"
            level="green"
          />
          <StatCard
            title="库存预警SKU数"
            :value="lowStockSkuCount"
            :icon="AlertTriangle"
            level="red"
          />
        </div>

        <StageMatchPanel @select="handleSkuSelect" />

        <AppointmentForm
          :selected-sku-id="selectedSkuId"
          :selected-baby-id="memberStore.selectedBabyId || ''"
          :selected-member-id="memberStore.selectedMemberId || ''"
          @update:cans="v => formCans = v"
        />
      </div>
    </div>

    <AppointmentHistory :member-id="memberStore.selectedMemberId || undefined" />
  </div>
</template>
