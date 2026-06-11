import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member, MemberLevel, Baby } from '@/types'
import { seedMembers, seedMemberLevels, seedBabies } from '@/data/seed'

export const useMemberStore = defineStore('member', () => {
  const members = ref<Member[]>([...seedMembers])
  const memberLevels = ref<MemberLevel[]>([...seedMemberLevels])
  const babies = ref<Baby[]>([...seedBabies])
  const selectedMemberId = ref<string | null>(null)
  const selectedBabyId = ref<string | null>(null)

  const selectedMember = computed<Member | null>(() => {
    return members.value.find(m => m.id === selectedMemberId.value) || null
  })

  const selectedBaby = computed<Baby | null>(() => {
    return babies.value.find(b => b.id === selectedBabyId.value) || null
  })

  const babiesOfSelectedMember = computed<Baby[]>(() => {
    if (!selectedMemberId.value) return []
    return babies.value.filter(b => b.memberId === selectedMemberId.value)
  })

  function selectMember(id: string) {
    selectedMemberId.value = id
    const memberBabies = babies.value.filter(b => b.memberId === id)
    selectedBabyId.value = memberBabies.length > 0 ? memberBabies[0].id : null
  }

  function selectBaby(id: string) {
    selectedBabyId.value = id
  }

  function getMemberLevel(levelId: string): MemberLevel | undefined {
    return memberLevels.value.find(ml => ml.id === levelId)
  }

  function getBabiesByMember(memberId: string): Baby[] {
    return babies.value.filter(b => b.memberId === memberId)
  }

  return {
    members,
    memberLevels,
    babies,
    selectedMemberId,
    selectedBabyId,
    selectedMember,
    selectedBaby,
    babiesOfSelectedMember,
    selectMember,
    selectBaby,
    getMemberLevel,
    getBabiesByMember,
  }
})
