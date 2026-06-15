<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useAppointmentStore } from '@/stores/appointment'
import { Minus, Plus, AlertCircle, Clock, RefreshCw, CheckCircle2 } from 'lucide-vue-next'

interface Props {
  selectedSkuId: string
  selectedBabyId: string
  selectedMemberId: string
  memberLevelId?: string
  stageTransitionId?: string
  originalSkuId?: string
  stockAlternativeChoice?: 'wait' | 'substitute' | ''
  expectedArrival?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:cans': [value: number]
  'out-of-stock': []
  'appointment-created': []
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

const isOutOfStock = computed(() => stock.value < cans.value && cans.value > 0)

const stockClass = computed(() => {
  if (stock.value === 0) return 'bg-coral-soft text-coral-500'
  if (stock.value < 3) return 'bg-orange-soft text-orange-500'
  return 'bg-mint-soft/70 text-mint-600'
})

const pendingAppointment = computed(() => {
  if (!props.selectedMemberId || !props.selectedSkuId) return null
  return appointmentStore.getPendingAppointment(props.selectedMemberId, props.selectedSkuId)
})

const originalSkuName = computed(() => {
  if (!props.originalSkuId) return ''
  const sku = inventoryStore.skus.find(s => s.id === props.originalSkuId)
  return sku ? `${sku.brand} ${sku.stage}` : ''
})

const isWaitingStock = computed(() => props.stockAlternativeChoice === 'wait')

const canSubmit = computed(() => {
  const baseValid = props.selectedSkuId &&
    props.selectedBabyId &&
    props.selectedMemberId &&
    pickupTime.value &&
    cans.value >= 1 &&
    cans.value <= 20

  if (props.stockAlternativeChoice === 'wait') {
    return baseValid
  }
  if (props.stockAlternativeChoice === 'substitute') {
    return baseValid && stock.value >= cans.value
  }
  return baseValid && stock.value >= cans.value
})

function decreaseCans() {
  if (cans.value > 1) cans.value--
}

function increaseCans() {
  const max = Math.min(20, stock.value > 0 ? stock.value : 20)
  if (cans.value < max) cans.value++
}

function handleSubmit() {
  if (!canSubmit.value) return

  if (!props.stockAlternativeChoice && stock.value < cans.value) {
    emit('out-of-stock')
    return
  }

  const result = appointmentStore.createAppointment({
    memberId: props.selectedMemberId,
    babyId: props.selectedBabyId,
    skuId: props.selectedSkuId,
    cans: cans.value,
    pickupTime: pickupTime.value.replace('T', ' '),
    staffName: '店员小王',
    memberLevelId: props.memberLevelId,
    stageTransitionId: props.stageTransitionId,
    originalSkuId: props.originalSkuId,
    stockAlternativeChoice: props.stockAlternativeChoice || undefined,
    expectedArrival: props.expectedArrival,
  })
  if (result.success) {
    alert('预约创建成功！')
    cans.value = 1
    pickupTime.value = ''
    emit('appointment-created')
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
      <div v-if="originalSkuName" class="mt-1.5 text-xs text-mint-600">
        已替代：{{ originalSkuName }} → 当前商品
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
            :disabled="cans >= 20"
            :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              cans >= 20 ? 'text-brown-300 cursor-not-allowed' : 'text-brown-500 hover:bg-cream-100 cursor-pointer',
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
      v-if="isWaitingStock"
      class="flex items-start gap-2.5 rounded-xl bg-orange-soft/30 border border-orange-soft/60 p-3.5"
    >
      <Clock class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
      <div class="text-sm text-orange-500">
        <div class="font-medium mb-0.5">等待到货模式</div>
        <div class="text-xs opacity-90">
          预约创建后状态为「等待到货」，到货后将优先通知顾客
          <span v-if="props.expectedArrival">，预计{{ props.expectedArrival }}到货</span>
        </div>
      </div>
    </div>

    <div
      v-if="props.stageTransitionId"
      class="flex items-start gap-2.5 rounded-xl bg-mint-soft/30 border border-mint-500/20 p-3.5"
    >
      <CheckCircle2 class="w-5 h-5 text-mint-600 shrink-0 mt-0.5" />
      <div class="text-sm text-mint-600">
        <div class="font-medium mb-0.5">换段确认已记录</div>
        <div class="text-xs opacity-90">
          本次预约关联了换段记录，已记录顾客同意情况与换段原因
        </div>
      </div>
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

    <div
      v-if="isOutOfStock && selectedSku"
      class="flex items-start gap-2.5 rounded-xl bg-coral-soft/30 border border-coral-500/20 p-3.5"
    >
      <RefreshCw class="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
      <div class="text-sm text-coral-500">
        <div class="font-medium mb-0.5">库存不足</div>
        <div class="text-xs opacity-90">当前库存{{ stock }}罐，不足{{ cans }}罐，请查看替代方案</div>
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
      <template v-if="isWaitingStock">提交预约（等待到货）</template>
      <template v-else-if="props.stockAlternativeChoice === 'substitute'">提交预约（已替代）</template>
      <template v-else>提交预约</template>
    </button>
  </div>
</template>
