<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useAppointmentStore } from '@/stores/appointment'
import { useMemberStore } from '@/stores/member'
import { PackageX, RefreshCw, Clock, Gift, ChevronRight, CheckCircle2, X, AlertCircle } from 'lucide-vue-next'

interface Props {
  skuId: string
  cans: number
  memberId?: string
  memberLevelId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'choose-alternative': [skuId: string]
  'choose-wait': []
}>()

const inventoryStore = useInventoryStore()
const appointmentStore = useAppointmentStore()
const memberStore = useMemberStore()

const stock = computed(() => inventoryStore.getStockBySku(props.skuId))
const isOutOfStock = computed(() => stock.value < props.cans)
const currentSku = computed(() => inventoryStore.skus.find(s => s.id === props.skuId))
const stockOutInfo = computed(() => inventoryStore.getStockOutInfo(props.skuId))
const alternatives = computed(() => inventoryStore.getSameStageAlternatives(props.skuId))

const showAlternativeDialog = ref(false)
const selectedAlternativeSkuId = ref<string>('')
const alternativeChoice = ref<'wait' | 'substitute' | ''>('')

function getGiftImpact(skuId: string): string {
  const memberLevelId = props.memberLevelId
  const originalGifts = appointmentStore.giftsEligible(props.skuId, props.cans, memberLevelId)
  const newGifts = appointmentStore.giftsEligible(skuId, props.cans, memberLevelId)

  const originalCount = originalGifts.reduce((sum, g) => sum + g.count, 0)
  const newCount = newGifts.reduce((sum, g) => sum + g.count, 0)
  const originalNames = originalGifts.map(g => g.name)
  const newNames = newGifts.map(g => g.name)
  const added = newNames.filter(n => !originalNames.includes(n))
  const removed = originalNames.filter(n => !newNames.includes(n))

  if (originalCount === newCount && added.length === 0 && removed.length === 0) {
    return '赠品无影响'
  }

  const parts: string[] = []
  if (newCount > originalCount) parts.push(`赠品增加${newCount - originalCount}件`)
  if (newCount < originalCount) parts.push(`赠品减少${originalCount - newCount}件`)
  if (added.length > 0) parts.push(`新增：${added.join('、')}`)
  if (removed.length > 0) parts.push(`取消：${removed.join('、')}`)

  return parts.join('；')
}

function openAlternativeDialog() {
  showAlternativeDialog.value = true
  selectedAlternativeSkuId.value = ''
  alternativeChoice.value = ''
}

function closeAlternativeDialog() {
  showAlternativeDialog.value = false
}

function confirmChoice() {
  if (alternativeChoice.value === 'substitute' && selectedAlternativeSkuId.value) {
    emit('choose-alternative', selectedAlternativeSkuId.value)
  } else if (alternativeChoice.value === 'wait') {
    emit('choose-wait')
  }
  showAlternativeDialog.value = false
}
</script>

<template>
  <div v-if="isOutOfStock && currentSku" class="card-base">
    <div class="rounded-xl bg-gradient-to-r from-coral-soft/30 to-orange-soft/30 border border-coral-500/20 p-4 space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-coral-soft/70 flex items-center justify-center shrink-0">
          <PackageX class="w-5 h-5 text-coral-500" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-brown-500 text-sm">缺货提醒</div>
          <p class="text-xs text-coral-500 mt-1">
            {{ currentSku.brand }} {{ currentSku.stage }} 库存不足（当前{{ stock }}罐，需要{{ cans }}罐）
          </p>
        </div>
      </div>

      <div v-if="stockOutInfo?.expectedArrival" class="rounded-xl bg-white/70 p-3 flex items-center gap-2.5">
        <Clock class="w-4 h-4 text-orange-500 shrink-0" />
        <div class="text-xs text-brown-400">
          预计到货日：<span class="text-orange-500 font-medium">{{ stockOutInfo.expectedArrival }}</span>
        </div>
      </div>

      <button
        @click="openAlternativeDialog"
        class="w-full flex items-center justify-center gap-2 bg-coral-soft/50 hover:bg-coral-soft/80 text-coral-500 px-4 py-2.5 rounded-xl transition font-medium text-sm cursor-pointer"
      >
        <RefreshCw class="w-4 h-4" />
        <span>查看替代方案</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="showAlternativeDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        @click.self="closeAlternativeDialog"
      >
        <div class="bg-white rounded-xl3 shadow-card w-[520px] max-w-[90vw] max-h-[80vh] overflow-y-auto p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-brown-500">缺货替代方案</h3>
            <button @click="closeAlternativeDialog" class="text-brown-300 hover:text-brown-500 transition cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="rounded-xl bg-coral-soft/20 border border-coral-500/15 p-3.5">
            <div class="flex items-center gap-2 mb-1">
              <PackageX class="w-4 h-4 text-coral-500" />
              <span class="text-sm font-medium text-coral-500">缺货商品</span>
            </div>
            <div class="text-sm text-brown-500">
              {{ currentSku?.brand }} {{ currentSku?.stage }}
            </div>
            <div v-if="stockOutInfo?.expectedArrival" class="text-xs text-orange-500 mt-1">
              预计到货：{{ stockOutInfo.expectedArrival }}
            </div>
          </div>

          <div class="space-y-3">
            <div
              @click="alternativeChoice = 'wait'"
              :class="[
                'rounded-xl border-2 p-4 cursor-pointer transition-all',
                alternativeChoice === 'wait'
                  ? 'border-orange-400 bg-orange-soft/20'
                  : 'border-cream-100 bg-cream-50/50 hover:border-orange-200',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
                    alternativeChoice === 'wait' ? 'border-orange-400 bg-orange-400' : 'border-cream-200',
                  ]"
                >
                  <div v-if="alternativeChoice === 'wait'" class="w-2 h-2 rounded-full bg-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-orange-500" />
                    <span class="font-medium text-brown-500 text-sm">等待补货</span>
                  </div>
                  <p class="text-xs text-brown-400 mt-1.5">
                    保持原品牌预约，等待到货后优先通知
                    <span v-if="stockOutInfo?.expectedArrival" class="text-orange-500">
                      （预计{{ stockOutInfo.expectedArrival }}到货）
                    </span>
                  </p>
                  <div class="mt-2 flex items-center gap-1.5">
                    <Gift class="w-3.5 h-3.5 text-pink-400" />
                    <span class="text-xs text-brown-400">赠品无影响</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-for="alt in alternatives"
              :key="alt.id"
              @click="alternativeChoice = 'substitute'; selectedAlternativeSkuId = alt.id"
              :class="[
                'rounded-xl border-2 p-4 cursor-pointer transition-all',
                alternativeChoice === 'substitute' && selectedAlternativeSkuId === alt.id
                  ? 'border-mint-500 bg-mint-soft/20'
                  : 'border-cream-100 bg-cream-50/50 hover:border-mint-300',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
                    alternativeChoice === 'substitute' && selectedAlternativeSkuId === alt.id
                      ? 'border-mint-500 bg-mint-500'
                      : 'border-cream-200',
                  ]"
                >
                  <div v-if="alternativeChoice === 'substitute' && selectedAlternativeSkuId === alt.id" class="w-2 h-2 rounded-full bg-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <RefreshCw class="w-4 h-4 text-mint-600" />
                      <span class="font-medium text-brown-500 text-sm">{{ alt.brand }}</span>
                      <span class="text-pink-500 text-xs font-medium">{{ alt.stage }}</span>
                    </div>
                    <span class="text-sm text-pink-500 font-semibold">¥{{ alt.price }}</span>
                  </div>
                  <p class="text-xs text-brown-400 mt-1">{{ alt.name }}</p>
                  <div class="mt-2 flex items-center gap-3">
                    <div class="flex items-center gap-1.5">
                      <PackageX class="w-3.5 h-3.5 text-mint-600" />
                      <span class="text-xs text-brown-400">库存{{ inventoryStore.getStockBySku(alt.id) }}罐</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <Gift class="w-3.5 h-3.5 text-pink-400" />
                      <span class="text-xs text-brown-400">{{ getGiftImpact(alt.id) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="alternatives.length === 0" class="rounded-xl bg-cream-50/50 border border-dashed border-cream-200 p-5 text-center">
              <AlertCircle class="w-6 h-6 mx-auto text-brown-300 mb-2" />
              <p class="text-sm text-brown-300">暂无同段位可替代商品</p>
              <p class="text-xs text-brown-300/80 mt-1">建议选择等待补货</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeAlternativeDialog"
              class="flex-1 btn-ghost"
            >
              取消
            </button>
            <button
              @click="confirmChoice"
              :disabled="!alternativeChoice || (alternativeChoice === 'substitute' && !selectedAlternativeSkuId)"
              :class="[
                'flex-1 btn-primary',
                (!alternativeChoice || (alternativeChoice === 'substitute' && !selectedAlternativeSkuId)) && 'opacity-50 cursor-not-allowed hover:bg-pink-400 hover:scale-100',
              ]"
            >
              {{ alternativeChoice === 'wait' ? '确认等待' : alternativeChoice === 'substitute' ? '确认替代' : '请选择方案' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
