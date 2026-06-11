<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useAppointmentStore } from '@/stores/appointment'
import { Minus, Plus, AlertCircle } from 'lucide-vue-next'

interface Props {
  selectedSkuId: string
  selectedBabyId: string
  selectedMemberId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:cans': [value: number]
}>()

const inventoryStore = useInventoryStore()
const appointmentStore = useAppointmentStore()

const cans = ref(1)
const pickupTime = ref('')

watch(() => props.selectedSkuId, () => {
  cans.value = 1
})

watch(cans, (val) => {
  emit('update:cans', val)
}, { immediate: true })

const selectedSku = computed(() => {
  return props.selectedSkuId
    ? inventoryStore.skus.find(s => s.id === props.selectedSkuId) || null
    : null
})

const stock = computed(() => {
  return props.selectedSkuId ? inventoryStore.getStockBySku(props.selectedSkuId) : 0
})

const stockClass = computed(() => {
  if (stock.value === 0) return 'bg-coral-soft text-coral-500'
  if (stock.value < 3) return 'bg-orange-soft text-orange-500'
  return 'bg-mint-soft/70 text-mint-600'
})

const pendingAppointment = computed(() => {
  if (!props.selectedMemberId || !props.selectedSkuId) return null
  return appointmentStore.getPendingAppointment(props.selectedMemberId, props.selectedSkuId)
})

const canSubmit = computed(() => {
  return (
    props.selectedSkuId &&
    props.selectedBabyId &&
    props.selectedMemberId &&
    pickupTime.value &&
    stock.value >= cans.value &&
    cans.value >= 1 &&
    cans.value <= 20
  )
})

function decreaseCans() {
  if (cans.value > 1) cans.value--
}

function increaseCans() {
  const max = Math.min(20, stock.value)
  if (cans.value < max) cans.value++
}

function handleSubmit() {
  if (!canSubmit.value) return
  const result = appointmentStore.createAppointment({
    memberId: props.selectedMemberId,
    babyId: props.selectedBabyId,
    skuId: props.selectedSkuId,
    cans: cans.value,
    pickupTime: pickupTime.value.replace('T', ' '),
    staffName: '店员小王',
  })
  if (result.success) {
    alert('预约创建成功！')
    cans.value = 1
    pickupTime.value = ''
  } else {
    alert(result.message || '创建失败')
  }
}
</script>

<template>
  <div class="card-base space-y-4">
    <h3 class="text-base font-semibold text-brown-500">创建预约</h3>

    <div>
      <label class="text-xs text-brown-400 mb-1.5 block">品牌段位</label>
      <div
        :class="[
          'w-full rounded-xl border px-4 py-2.5 text-sm',
          selectedSku ? 'bg-cream-50 border-cream-200 text-brown-500' : 'bg-cream-50/50 border-cream-100 text-brown-300',
        ]"
      >
        <template v-if="selectedSku">
          <span class="font-medium">{{ selectedSku.brand }}</span>
          <span class="mx-2 text-brown-300">·</span>
          <span class="text-pink-500 font-medium">{{ selectedSku.stage }}</span>
          <span class="mx-2 text-brown-300">·</span>
          <span>¥{{ selectedSku.price }}/罐</span>
        </template>
        <template v-else>请在上方选择商品</template>
      </div>
    </div>

    <div>
      <label class="text-xs text-brown-400 mb-1.5 block">罐数</label>
      <div class="flex items-center gap-4">
        <div class="flex items-center rounded-xl border border-cream-200 bg-cream-50 overflow-hidden">
          <button
            @click="decreaseCans"
            :disabled="cans <= 1"
            :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              cans <= 1 ? 'text-brown-300 cursor-not-allowed' : 'text-brown-500 hover:bg-cream-100 cursor-pointer',
            ]"
          >
            <Minus class="w-4 h-4" />
          </button>
          <div class="w-14 text-center font-medium text-brown-500">{{ cans }}</div>
          <button
            @click="increaseCans"
            :disabled="cans >= 20 || cans >= stock"
            :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              (cans >= 20 || cans >= stock) ? 'text-brown-300 cursor-not-allowed' : 'text-brown-500 hover:bg-cream-100 cursor-pointer',
            ]"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
        <span :class="['rounded-lg px-3 py-1.5 text-xs font-medium', stockClass]">
          库存：{{ stock }}罐
        </span>
      </div>
    </div>

    <div>
      <label class="text-xs text-brown-400 mb-1.5 block">到店时间</label>
      <input
        v-model="pickupTime"
        type="datetime-local"
        class="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
      />
    </div>

    <div
      v-if="pendingAppointment"
      class="flex items-start gap-2.5 rounded-xl bg-orange-soft/30 border border-orange-soft/60 p-3.5"
    >
      <AlertCircle class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
      <div class="text-sm text-orange-500">
        <div class="font-medium mb-0.5">已有待取货预约</div>
        <div class="text-xs opacity-90">
          预约号：{{ pendingAppointment.id }} · {{ pendingAppointment.cans }}罐 · {{ pendingAppointment.pickupTime }}
        </div>
      </div>
    </div>

    <button
      @click="handleSubmit"
      :disabled="!canSubmit"
      :class="[
        'w-full btn-primary',
        !canSubmit && 'opacity-50 cursor-not-allowed hover:bg-pink-400 hover:scale-100',
      ]"
    >
      提交预约
    </button>
  </div>
</template>
