import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Appointment, GiftActivity, Redemption, GiftItem, AppointmentStatus } from '@/types'
import { seedAppointments, seedActivities, seedRedemptions } from '@/data/seed'
import { useInventoryStore } from '@/stores/inventory'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref<Appointment[]>([...seedAppointments])
  const activities = ref<GiftActivity[]>([...seedActivities])
  const redemptions = ref<Redemption[]>([...seedRedemptions])

  function getAppointmentsByMember(memberId: string): Appointment[] {
    return appointments.value.filter(a => a.memberId === memberId)
  }

  function getPendingAppointment(memberId: string, skuId: string): Appointment | null {
    return appointments.value.find(
      a => a.memberId === memberId && a.skuId === skuId && a.status === 'pending'
    ) || null
  }

  function giftsEligible(skuId: string, cans: number, memberLevelId?: string): GiftItem[] {
    const today = new Date().toISOString().slice(0, 10)
    const result: GiftItem[] = []
    const giftMap = new Map<string, GiftItem>()

    for (const act of activities.value) {
      if (act.startDate > today || act.endDate < today) continue
      if (act.minCans > cans) continue
      if (act.memberLevelRequired && (!memberLevelId || (act.memberLevelRequired !== memberLevelId
        && !isHigherLevel(act.memberLevelRequired, memberLevelId)))) continue

      const count = Math.floor(cans / act.minCans)
      if (count <= 0) continue

      if (giftMap.has(act.giftItem)) {
        const existing = giftMap.get(act.giftItem)!
        existing.count += count
        existing.reason += `、${act.name}`
      } else {
        giftMap.set(act.giftItem, {
          name: act.giftItem,
          count,
          reason: act.name,
        })
      }
    }

    return Array.from(giftMap.values())
  }

  function isHigherLevel(requiredId: string, currentId: string | undefined): boolean {
    if (!currentId) return false
    const order: Record<string, number> = {
      'ml-1': 1,
      'ml-2': 2,
      'ml-3': 3,
      'ml-4': 4,
    }
    const required = order[requiredId] || 0
    const current = order[currentId] || 0
    return current >= required
  }

  function createAppointment(data: {
    memberId: string
    babyId: string
    skuId: string
    cans: number
    pickupTime: string
    staffName: string
    memberLevelId?: string
  }): { success: boolean; appointment?: Appointment; message?: string } {
    const inventoryStore = useInventoryStore()
    const stock = inventoryStore.getStockBySku(data.skuId)
    if (stock < data.cans) {
      return { success: false, message: `库存不足，当前库存${stock}罐` }
    }

    const deductResult = inventoryStore.deductStock(data.skuId, data.cans)
    if (!deductResult.success) {
      return { success: false, message: '扣减库存失败' }
    }

    const appointmentId = `a-${Date.now()}`
    const newAppointment: Appointment = {
      id: appointmentId,
      memberId: data.memberId,
      babyId: data.babyId,
      skuId: data.skuId,
      cans: data.cans,
      pickupTime: data.pickupTime,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      staffName: data.staffName,
    }
    appointments.value.push(newAppointment)

    const eligibleGifts = giftsEligible(data.skuId, data.cans, data.memberLevelId)
    for (const gift of eligibleGifts) {
      for (let i = 0; i < gift.count; i++) {
        const activity = activities.value.find(a => a.giftItem === gift.name)
        const redemptionId = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const newRedemption: Redemption = {
          id: redemptionId,
          appointmentId: appointmentId,
          activityId: activity?.id || '',
          giftItem: gift.name,
          status: 'pending',
        }
        redemptions.value.push(newRedemption)
      }
    }

    return { success: true, appointment: newAppointment }
  }

  function cancelAppointment(id: string): { success: boolean; message?: string } {
    const index = appointments.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, message: '预约不存在' }
    }
    const appointment = appointments.value[index]
    if (appointment.status !== 'pending') {
      return { success: false, message: '只能取消待处理状态的预约' }
    }

    const inventoryStore = useInventoryStore()
    inventoryStore.addStockIn({
      skuId: appointment.skuId,
      quantity: appointment.cans,
      supplier: '预约取消退回',
      productionDate: new Date().toISOString().slice(0, 10),
      expiryDate: '2099-12-31',
    })

    appointments.value[index].status = 'cancelled'

    for (const r of redemptions.value) {
      if (r.appointmentId === id && r.status === 'pending') {
        r.status = 'expired'
      }
    }

    return { success: true }
  }

  function completeAppointment(id: string, operatorName?: string): { success: boolean; message?: string } {
    const index = appointments.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, message: '预约不存在' }
    }
    const appointment = appointments.value[index]
    if (appointment.status !== 'pending') {
      return { success: false, message: '只能完成待处理状态的预约' }
    }

    appointments.value[index].status = 'completed' as AppointmentStatus

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    for (const r of redemptions.value) {
      if (r.appointmentId === id && r.status === 'pending') {
        r.status = 'redeemed'
        r.redeemedAt = now
        r.operatorName = operatorName || appointment.staffName
      }
    }

    return { success: true }
  }

  return {
    appointments,
    activities,
    redemptions,
    getAppointmentsByMember,
    getPendingAppointment,
    giftsEligible,
    createAppointment,
    cancelAppointment,
    completeAppointment,
  }
})
