<script setup lang="ts">
import { computed } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { useMemberStore } from '@/stores/member'
import { Gift, Package } from 'lucide-vue-next'

interface Props {
  skuId: string
  cans: number
  memberLevelId?: string
}

const props = defineProps<Props>()

const appointmentStore = useAppointmentStore()
const memberStore = useMemberStore()

const gifts = computed(() => {
  if (!props.skuId || !props.cans) return []
  return appointmentStore.giftsEligible(props.skuId, props.cans, props.memberLevelId)
})

const levelBonusGift = computed(() => {
  if (!props.memberLevelId) return null
  const level = memberStore.getMemberLevel(props.memberLevelId)
  if (!level || !level.giftBonus || level.giftBonus <= 0) return null
  return {
    name: level.name + '专属礼包',
    count: level.giftBonus,
    reason: level.name,
  }
})

const hasAnyGift = computed(() => {
  return gifts.value.length > 0 || levelBonusGift.value
})
</script>

<template>
  <div class="card-base space-y-4">
    <div class="flex items-center gap-2">
      <Gift class="w-4.5 h-4.5 text-pink-400" />
      <h3 class="text-base font-semibold text-brown-500">赠品资格</h3>
    </div>

    <div v-if="!hasAnyGift" class="rounded-xl bg-cream-50/50 border border-dashed border-cream-200 p-5 text-center">
      <Package class="w-8 h-8 mx-auto text-brown-300 mb-2" />
      <p class="text-sm text-brown-300">暂未达到赠品门槛</p>
      <p class="text-xs text-brown-300/80 mt-1">满1罐起赠，多买多赠</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-if="levelBonusGift"
        class="rounded-xl bg-gradient-to-br from-pink-soft/50 to-orange-soft/40 border border-pink-200/60 p-3.5"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-pink-soft flex items-center justify-center shrink-0">
            <Gift class="w-5 h-5 text-pink-500" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-brown-500 text-sm">{{ levelBonusGift.name }}</span>
              <span class="rounded-md bg-pink-500/10 text-pink-500 px-2 py-0.5 text-xs font-medium">
                x{{ levelBonusGift.count }}
              </span>
            </div>
            <p class="text-xs text-brown-400 mt-1">{{ levelBonusGift.reason }}固定赠品</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2.5">
        <div
          v-for="(gift, idx) in gifts"
          :key="idx"
          class="rounded-xl bg-cream-50/70 border border-cream-100 p-3.5"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-mint-soft/70 flex items-center justify-center shrink-0">
              <Gift class="w-5 h-5 text-mint-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-brown-500 text-sm">{{ gift.name }}</span>
                <span class="rounded-md bg-mint-500/10 text-mint-600 px-2 py-0.5 text-xs font-medium">
                  x{{ gift.count }}
                </span>
              </div>
              <p class="text-xs text-brown-400 mt-1">{{ gift.reason }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
