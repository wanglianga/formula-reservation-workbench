<script setup lang="ts">
import { useMemberStore } from '@/stores/member'

const memberStore = useMemberStore()

const memberLevelColors: Record<string, { bg: string; text: string }> = {
  'ml-1': { bg: 'bg-brown-300/30', text: 'text-brown-400' },
  'ml-2': { bg: 'bg-cream-200', text: 'text-brown-500' },
  'ml-3': { bg: 'bg-orange-soft/60', text: 'text-orange-500' },
  'ml-4': { bg: 'bg-pink-soft', text: 'text-pink-500' },
}
</script>

<template>
  <div class="card-base space-y-4">
    <h3 class="text-base font-semibold text-brown-500">会员与宝宝档案</h3>

    <div>
      <label class="text-xs text-brown-400 mb-1.5 block">选择会员</label>
      <select
        :value="memberStore.selectedMemberId || ''"
        @change="e => memberStore.selectMember((e.target as HTMLSelectElement).value)"
        class="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer"
      >
        <option value="" disabled>请选择会员</option>
        <option v-for="m in memberStore.members" :key="m.id" :value="m.id">
          {{ m.name }} - {{ m.phone }}
        </option>
      </select>
    </div>

    <div v-if="memberStore.selectedMember" class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-brown-500">{{ memberStore.selectedMember.name }}</span>
          <span
            :class="[
              'rounded-lg px-2.5 py-0.5 text-xs font-medium',
              memberLevelColors[memberStore.selectedMember.memberLevelId]?.bg || 'bg-cream-200',
              memberLevelColors[memberStore.selectedMember.memberLevelId]?.text || 'text-brown-500',
            ]"
          >
            {{ memberStore.getMemberLevel(memberStore.selectedMember.memberLevelId)?.name }}
          </span>
        </div>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="baby in memberStore.babiesOfSelectedMember"
          :key="baby.id"
          @click="memberStore.selectBaby(baby.id)"
          :class="[
            'rounded-xl p-3.5 cursor-pointer transition-all duration-200 border',
            memberStore.selectedBabyId === baby.id
              ? 'ring-2 ring-pink-300 bg-pink-soft/30 border-pink-200'
              : 'bg-cream-50/50 border-cream-100 hover:bg-cream-50 hover:border-pink-200/50',
          ]"
        >
          <div class="flex gap-3">
            <div class="w-12 h-12 rounded-full bg-pink-soft flex items-center justify-center text-2xl shrink-0">
              {{ baby.avatar || '👶' }}
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-brown-500 text-sm">{{ baby.name }}</span>
                <span class="rounded-md bg-mint-soft/70 text-mint-600 px-2 py-0.5 text-xs font-medium">
                  {{ baby.months }}月龄
                </span>
                <span class="text-xs text-brown-400">{{ baby.gender }}</span>
              </div>
              <div class="text-xs text-brown-400">生日：{{ baby.birthDate }}</div>
              <div v-if="baby.allergyNote" class="flex flex-wrap gap-1.5">
                <span
                  v-for="(tag, idx) in baby.allergyNote.split(/[、,，;；]+/).filter(Boolean)"
                  :key="idx"
                  class="bg-coral-soft text-coral-500 rounded-lg px-2 py-0.5 text-xs font-medium"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="memberStore.babiesOfSelectedMember.length === 0" class="text-center py-8 text-brown-300 text-sm rounded-xl bg-cream-50/50">
          该会员暂无宝宝档案
        </div>
      </div>
    </div>

    <div v-else class="text-center py-10 text-brown-300 text-sm rounded-xl bg-cream-50/50">
      请先选择会员查看宝宝信息
    </div>
  </div>
</template>
