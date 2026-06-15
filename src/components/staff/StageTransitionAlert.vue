<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useInventoryStore } from '@/stores/inventory'
import { useAppointmentStore } from '@/stores/appointment'
import { checkStageTransition } from '@/composables/useStageMatch'
import { AlertTriangle, Stethoscope, CheckCircle2, X, ChevronRight } from 'lucide-vue-next'
import type { StageTransitionRecord } from '@/types'

const memberStore = useMemberStore()
const inventoryStore = useInventoryStore()
const appointmentStore = useAppointmentStore()

const showConfirmDialog = ref(false)
const transitionReason = ref('')
const customerConsent = ref(false)
const confirmedTransition = ref<StageTransitionRecord | null>(null)

const transitionInfo = computed(() => {
  const baby = memberStore.selectedBaby
  if (!baby) return null
  return checkStageTransition(baby.months)
})

const isNearTransition = computed(() => {
  return transitionInfo.value?.isNearTransition && !confirmedTransition.value
})

const nextStageSkus = computed(() => {
  if (!transitionInfo.value) return []
  const nextStage = transitionInfo.value.nextStage
  if (!nextStage) return []
  return inventoryStore.skus.filter(s => s.stage === nextStage)
})

const baby = computed(() => memberStore.selectedBaby)

function openConfirmDialog() {
  showConfirmDialog.value = true
  transitionReason.value = ''
  customerConsent.value = false
}

function closeConfirmDialog() {
  showConfirmDialog.value = false
}

function confirmTransition() {
  if (!baby.value || !transitionInfo.value) return
  if (!transitionReason.value.trim()) {
    alert('请填写换段原因')
    return
  }
  if (!customerConsent.value) {
    alert('请确认顾客已同意换段')
    return
  }

  const fromSkuId = inventoryStore.skus.find(
    s => s.stage === transitionInfo.value!.currentStage
  )?.id || ''

  const toSkuId = inventoryStore.skus.find(
    s => s.stage === transitionInfo.value!.nextStage
  )?.id || ''

  const record = appointmentStore.confirmStageTransition({
    babyId: baby.value.id,
    fromStage: transitionInfo.value.currentStage,
    toStage: transitionInfo.value.nextStage,
    fromSkuId,
    toSkuId,
    reason: transitionReason.value.trim(),
    customerConsent: customerConsent.value,
    operatorName: '店员小王',
  })

  confirmedTransition.value = record
  showConfirmDialog.value = false
  emit('transition-confirmed', record.id)
}

const emit = defineEmits<{
  'select-next-stage': [skuId: string]
  'transition-confirmed': [transitionId: string]
}>()

function selectNextStageSku(skuId: string) {
  emit('select-next-stage', skuId)
}
</script>

<template>
  <div v-if="transitionInfo && isNearTransition" class="card-base">
    <div class="rounded-xl bg-gradient-to-r from-orange-soft/40 to-pink-soft/40 border border-orange-400/30 p-4 space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-soft/80 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5 text-orange-500" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-brown-500 text-sm">换段提醒</div>
          <p class="text-xs text-orange-500 mt-1">{{ transitionInfo.message }}</p>
        </div>
      </div>

      <div class="rounded-xl bg-white/70 p-3.5 space-y-2">
        <div class="flex items-center gap-2">
          <Stethoscope class="w-4 h-4 text-pink-400" />
          <span class="text-sm font-medium text-brown-500">可咨询营养顾问</span>
        </div>
        <p class="text-xs text-brown-400 leading-relaxed">
          系统检测到宝宝接近换段月龄，建议咨询门店营养顾问确认是否需要更换段位。系统不会自动替换顾客预约商品。
        </p>
      </div>

      <button
        @click="openConfirmDialog"
        class="w-full flex items-center justify-center gap-2 bg-orange-soft/60 hover:bg-orange-soft text-orange-500 px-4 py-2.5 rounded-xl transition font-medium text-sm cursor-pointer"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>确认换段</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <div v-if="confirmedTransition" class="mt-3 rounded-xl bg-mint-soft/30 border border-mint-500/20 p-3.5">
      <div class="flex items-center gap-2 mb-2">
        <CheckCircle2 class="w-4 h-4 text-mint-600" />
        <span class="text-sm font-medium text-mint-600">已确认换段</span>
      </div>
      <div class="text-xs text-brown-400 space-y-1">
        <div>{{ confirmedTransition.fromStage }} → {{ confirmedTransition.toStage }}</div>
        <div>原因：{{ confirmedTransition.reason }}</div>
        <div>顾客同意：{{ confirmedTransition.customerConsent ? '是' : '否' }}</div>
        <div>操作人：{{ confirmedTransition.operatorName }}</div>
      </div>
    </div>

    <div v-if="nextStageSkus.length > 0 && confirmedTransition" class="mt-3">
      <div class="text-xs text-brown-400 mb-2">推荐{{ transitionInfo.nextStage }}商品</div>
      <div class="grid grid-cols-1 gap-2">
        <div
          v-for="sku in nextStageSkus"
          :key="sku.id"
          @click="selectNextStageSku(sku.id)"
          class="flex items-center justify-between rounded-xl bg-cream-50/70 border border-cream-100 p-3 cursor-pointer hover:bg-cream-50 hover:border-pink-200/50 transition-all"
        >
          <div>
            <span class="text-sm font-medium text-brown-500">{{ sku.brand }}</span>
            <span class="mx-1.5 text-brown-300">·</span>
            <span class="text-pink-500 text-xs font-medium">{{ sku.stage }}</span>
          </div>
          <span class="text-sm text-pink-500 font-semibold">¥{{ sku.price }}</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showConfirmDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        @click.self="closeConfirmDialog"
      >
        <div class="bg-white rounded-xl3 shadow-card w-[420px] max-w-[90vw] p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-brown-500">确认换段</h3>
            <button @click="closeConfirmDialog" class="text-brown-300 hover:text-brown-500 transition cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="rounded-xl bg-orange-soft/30 p-3.5 text-sm text-orange-500">
            {{ transitionInfo?.message }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-brown-400 mb-1.5 block">换段原因 <span class="text-coral-500">*</span></label>
              <textarea
                v-model="transitionReason"
                rows="3"
                placeholder="请填写换段原因，如：宝宝月龄已接近2段适用范围，营养顾问建议更换..."
                class="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
              />
            </div>

            <div
              @click="customerConsent = !customerConsent"
              class="flex items-start gap-3 rounded-xl border border-cream-200 bg-cream-50/50 p-3.5 cursor-pointer hover:bg-cream-50 transition"
            >
              <div
                :class="[
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
                  customerConsent ? 'bg-pink-400 border-pink-400' : 'border-cream-200 bg-white',
                ]"
              >
                <CheckCircle2 v-if="customerConsent" class="w-3.5 h-3.5 text-white" />
              </div>
              <div class="text-sm text-brown-500">
                顾客已确认同意换段 <span class="text-coral-500">*</span>
                <p class="text-xs text-brown-400 mt-1">请确认已与顾客沟通并取得同意后勾选</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeConfirmDialog"
              class="flex-1 btn-ghost"
            >
              取消
            </button>
            <button
              @click="confirmTransition"
              :disabled="!transitionReason.trim() || !customerConsent"
              :class="[
                'flex-1 btn-primary',
                (!transitionReason.trim() || !customerConsent) && 'opacity-50 cursor-not-allowed hover:bg-pink-400 hover:scale-100',
              ]"
            >
              确认换段
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
