<script setup lang="ts">
import { computed } from 'vue'
import { Gift } from 'lucide-vue-next'
import { useAppointmentStore } from '@/stores/appointment'
import ProgressRing from '@/components/common/ProgressRing.vue'

const appointmentStore = useAppointmentStore()

interface ActivityStat {
  id: string
  name: string
  giftItem: string
  startDate: string
  endDate: string
  total: number
  redeemed: number
  rate: number
}

const activityStats = computed<ActivityStat[]>(() => {
  return appointmentStore.activities.map((act) => {
    const related = appointmentStore.redemptions.filter((r) => r.activityId === act.id)
    const total = related.length
    const redeemed = related.filter((r) => r.status === 'redeemed').length
    const rate = total > 0 ? Math.round((redeemed / total) * 100) : 0
    return {
      id: act.id,
      name: act.name,
      giftItem: act.giftItem,
      startDate: act.startDate,
      endDate: act.endDate,
      total,
      redeemed,
      rate,
    }
  })
})

const getStatusBadge = (rate: number) => {
  if (rate >= 80) return { text: '完成良好', class: 'bg-mint-soft text-mint-600' }
  if (rate >= 50) return { text: '进行中', class: 'bg-orange-soft text-orange-500' }
  return { text: '需关注', class: 'bg-coral-soft text-coral-500' }
}

const getRingColor = (rate: number) => {
  if (rate >= 80) return '#4CAF6B'
  if (rate >= 50) return '#FFAA5C'
  return '#E86060'
}

const giftRanking = computed(() => {
  const giftCountMap = new Map<string, number>()
  for (const r of appointmentStore.redemptions) {
    if (r.status === 'redeemed') {
      giftCountMap.set(r.giftItem, (giftCountMap.get(r.giftItem) || 0) + 1)
    }
  }
  const arr = Array.from(giftCountMap.entries()).map(([name, count]) => ({ name, count }))
  arr.sort((a, b) => b.count - a.count)
  const top5 = arr.slice(0, 5)
  const maxCount = top5.length > 0 ? top5[0].count : 1
  return top5.map((item, idx) => ({
    ...item,
    width: `${Math.round((item.count / maxCount) * 100)}%`,
    color: `linear-gradient(90deg, hsl(${340 - idx * 30}, 80%, 75%) 0%, hsl(${140 - idx * 20}, 55%, 60%) 100%)`,
  }))
})

const handleViewDetail = (id: string) => {
  console.log('查看活动详情', id)
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="stat in activityStats"
        :key="stat.id"
        class="relative rounded-xl2 shadow-softer p-4 bg-white hover:shadow-soft transition-all cursor-pointer"
        @click="handleViewDetail(stat.id)"
      >
        <span
          :class="[
            'absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium',
            getStatusBadge(stat.rate).class,
          ]"
        >
          {{ getStatusBadge(stat.rate).text }}
        </span>

        <div class="flex items-start gap-4">
          <ProgressRing
            :percent="stat.rate"
            :size="72"
            :stroke-width="7"
            :color="getRingColor(stat.rate)"
            bg-color="#FDEFD8"
          />
          <div class="flex-1 min-w-0 pt-1">
            <h4 class="text-sm font-semibold text-brown-500 truncate">{{ stat.name }}</h4>
            <div class="flex items-center gap-1 mt-1.5">
              <Gift class="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span class="text-xs text-brown-400 truncate">{{ stat.giftItem }}</span>
            </div>
            <div class="mt-2 text-xs text-brown-400">
              完成进度
              <span class="font-semibold text-brown-500 ml-1">{{ stat.redeemed }}</span>
              <span class="text-brown-300 mx-0.5">/</span>
              <span>{{ stat.total }}</span>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-cream-100 text-xs text-brown-300">
          活动日期：{{ stat.startDate }} ~ {{ stat.endDate }}
        </div>
      </div>
    </div>

    <div class="rounded-xl2 shadow-softer p-4 bg-white">
      <h4 class="text-sm font-semibold text-brown-500 mb-4 flex items-center gap-2">
        <Gift class="w-4 h-4 text-pink-400" />
        <span>赠品发放排行 TOP5</span>
      </h4>
      <div class="space-y-3" v-if="giftRanking.length > 0">
        <div v-for="(item, idx) in giftRanking" :key="item.name" class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-brown-500 font-medium">
              <span class="inline-block w-5 h-5 rounded-full bg-cream-100 text-center leading-5 mr-2 text-brown-400">
                {{ idx + 1 }}
              </span>
              {{ item.name }}
            </span>
            <span class="text-brown-400">{{ item.count }}件</span>
          </div>
          <div class="h-2 rounded-full bg-cream-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: item.width, background: item.color }"
            ></div>
          </div>
        </div>
      </div>
      <div v-else class="py-6 text-center text-sm text-brown-300">
        暂无赠品发放数据
      </div>
    </div>
  </div>
</template>
