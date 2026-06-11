<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useInventoryStore } from '@/stores/inventory'
import { matchStageToBaby } from '@/composables/useStageMatch'
import { Check, AlertTriangle, XCircle } from 'lucide-vue-next'
import type { MilkSku } from '@/types'

const memberStore = useMemberStore()
const inventoryStore = useInventoryStore()

const emit = defineEmits<{
  select: [skuId: string]
}>()

const selectedSkuId = ref<string>('')

const skuMatchResults = computed(() => {
  const baby = memberStore.selectedBaby
  return inventoryStore.skus.map(sku => {
    const match = baby
      ? matchStageToBaby(baby.months, sku, baby.allergyNote || '')
      : { level: 'safe' as const, message: '请先选择宝宝', matched: false }
    return { sku, match }
  })
})

const matchBadgeConfig = {
  safe: {
    bg: 'bg-mint-soft',
    text: 'text-mint-600',
    icon: Check,
    label: '适配',
  },
  warning: {
    bg: 'bg-orange-soft',
    text: 'text-orange-500',
    icon: AlertTriangle,
    label: '月龄不匹配',
  },
  danger: {
    bg: 'bg-coral-soft',
    text: 'text-coral-500',
    icon: XCircle,
    label: '过敏风险',
  },
}

function handleSelect(sku: MilkSku) {
  selectedSkuId.value = sku.id
  emit('select', sku.id)
}
</script>

<template>
  <div class="card-base">
    <h3 class="text-base font-semibold text-brown-500 mb-4">段位匹配推荐</h3>

    <div v-if="!memberStore.selectedBaby" class="text-center py-12 text-brown-300 text-sm rounded-xl bg-cream-50/50">
      请先在左侧选择宝宝后查看匹配推荐
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="{ sku, match } in skuMatchResults"
        :key="sku.id"
        @click="handleSelect(sku)"
        :class="[
          'relative rounded-xl p-3.5 cursor-pointer transition-all duration-200 border',
          selectedSkuId === sku.id
            ? 'ring-2 ring-pink-300 bg-pink-soft/20 border-pink-200'
            : 'bg-cream-50/50 border-cream-100 hover:bg-cream-50 hover:border-pink-200/50',
        ]"
      >
        <div class="space-y-1.5">
          <div class="text-sm font-medium text-brown-500">{{ sku.brand }}</div>
          <div class="inline-block rounded-md bg-pink-soft/70 text-pink-500 px-2 py-0.5 text-xs font-medium">
            {{ sku.stage }}
          </div>
          <div class="text-xs text-brown-400 truncate">{{ sku.name }}</div>
          <div class="text-base font-semibold text-pink-500">¥{{ sku.price }}</div>
        </div>

        <div
          :class="[
            'absolute bottom-3 right-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
            matchBadgeConfig[match.level].bg,
            matchBadgeConfig[match.level].text,
          ]"
        >
          <component :is="matchBadgeConfig[match.level].icon" class="w-3.5 h-3.5" />
          <span>{{ matchBadgeConfig[match.level].label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
