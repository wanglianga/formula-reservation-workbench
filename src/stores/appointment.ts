import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Appointment, GiftActivity, Redemption, GiftItem, AppointmentStatus, StageTransitionRecord } from '@/types'
import { seedAppointments, seedActivities, seedRedemptions } from '@/data/seed'
import { useInventoryStore } from '@/stores/inventory'
import { useMemberStore } from '@/stores/member'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref<Appointment[]>([...seedAppointments])
  const activities = ref<GiftActivity[]>([...seedActivities])
  const redemptions = ref<Redemption[]>([...seedRedemptions])
  const stageTransitionRecords = ref<StageTransitionRecord[]>([])

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
    stageTransitionId?: string
    originalSkuId?: string
    stockAlternativeChoice?: 'wait' | 'substitute'
    expectedArrival?: string
  }): { success: boolean; appointment?: Appointment; message?: string } {
    const inventoryStore = useInventoryStore()
    const stock = inventoryStore.getStockBySku(data.skuId)

    if (data.stockAlternativeChoice !== 'wait' && stock < data.cans) {
      return { success: false, message: `库存不足，当前库存${stock}罐` }
    }

    if (data.stockAlternativeChoice !== 'wait') {
      const deductResult = inventoryStore.deductStock(data.skuId, data.cans)
      if (!deductResult.success) {
        return { success: false, message: '扣减库存失败' }
      }
    }

    const appointmentId = `a-${Date.now()}`
    const initialStatus: AppointmentStatus = data.stockAlternativeChoice === 'wait' ? 'waiting_stock' : 'pending'
    const newAppointment: Appointment = {
      id: appointmentId,
      memberId: data.memberId,
      babyId: data.babyId,
      skuId: data.skuId,
      cans: data.cans,
      pickupTime: data.pickupTime,
      status: initialStatus,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      staffName: data.staffName,
      stageTransitionId: data.stageTransitionId,
      originalSkuId: data.originalSkuId,
      stockAlternativeChoice: data.stockAlternativeChoice,
      expectedArrival: data.expectedArrival,
    }
    appointments.value.push(newAppointment)

    if (initialStatus === 'pending') {
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
    }

    return { success: true, appointment: newAppointment }
  }

  function cancelAppointment(id: string): { success: boolean; message?: string } {
    const index = appointments.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, message: '预约不存在' }
    }
    const appointment = appointments.value[index]
    if (appointment.status !== 'pending' && appointment.status !== 'waiting_stock' && appointment.status !== 'substituted') {
      return { success: false, message: '只能取消待处理/等待到货/已替代状态的预约' }
    }

    const inventoryStore = useInventoryStore()
    if (appointment.status === 'pending' || appointment.status === 'substituted') {
      inventoryStore.addStockIn({
        skuId: appointment.skuId,
        quantity: appointment.cans,
        supplier: '预约取消退回',
        productionDate: new Date().toISOString().slice(0, 10),
        expiryDate: '2099-12-31',
      })
    }

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
    if (appointment.status !== 'pending' && appointment.status !== 'substituted' && appointment.status !== 'waiting_stock') {
      return { success: false, message: '只能完成待处理/已替代/等待到货状态的预约' }
    }

    if (appointment.status === 'waiting_stock') {
      const inventoryStore = useInventoryStore()
      const stock = inventoryStore.getStockBySku(appointment.skuId)
      if (stock < appointment.cans) {
        return { success: false, message: `库存不足，当前库存${stock}罐，等待到货后再完成取货` }
      }
      const deductResult = inventoryStore.deductStock(appointment.skuId, appointment.cans)
      if (!deductResult.success) {
        return { success: false, message: '扣减库存失败' }
      }
      const memberStore = useMemberStore()
      const member = memberStore.members.find(m => m.id === appointment.memberId)
      const eligibleGifts = giftsEligible(appointment.skuId, appointment.cans, member?.memberLevelId)
      for (const gift of eligibleGifts) {
        for (let i = 0; i < gift.count; i++) {
          const activity = activities.value.find(a => a.giftItem === gift.name)
          const redemptionId = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          redemptions.value.push({
            id: redemptionId,
            appointmentId: appointment.id,
            activityId: activity?.id || '',
            giftItem: gift.name,
            status: 'pending',
          })
        }
      }
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

  function confirmStageTransition(data: {
    babyId: string
    fromStage: string
    toStage: string
    fromSkuId: string
    toSkuId: string
    reason: string
    customerConsent: boolean
    operatorName: string
  }): StageTransitionRecord {
    const record: StageTransitionRecord = {
      id: `st-${Date.now()}`,
      babyId: data.babyId,
      fromStage: data.fromStage,
      toStage: data.toStage,
      fromSkuId: data.fromSkuId,
      toSkuId: data.toSkuId,
      reason: data.reason,
      customerConsent: data.customerConsent,
      operatorName: data.operatorName,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }
    stageTransitionRecords.value.push(record)
    return record
  }

  function handleStockAlternative(appointmentId: string, choice: 'wait' | 'substitute', substituteSkuId?: string): { success: boolean; message?: string } {
    const index = appointments.value.findIndex(a => a.id === appointmentId)
    if (index === -1) {
      return { success: false, message: '预约不存在' }
    }
    const appointment = appointments.value[index]
    if (appointment.status !== 'waiting_stock' && appointment.status !== 'pending') {
      return { success: false, message: '当前状态无法进行替代操作' }
    }

    if (choice === 'substitute' && substituteSkuId) {
      const inventoryStore = useInventoryStore()
      const stock = inventoryStore.getStockBySku(substituteSkuId)
      if (stock < appointment.cans) {
        return { success: false, message: `替代商品库存不足，当前库存${stock}罐` }
      }
      const deductResult = inventoryStore.deductStock(substituteSkuId, appointment.cans)
      if (!deductResult.success) {
        return { success: false, message: '扣减替代商品库存失败' }
      }

      if (appointment.status === 'pending') {
        inventoryStore.addStockIn({
          skuId: appointment.skuId,
          quantity: appointment.cans,
          supplier: '替代换回',
          productionDate: new Date().toISOString().slice(0, 10),
          expiryDate: '2099-12-31',
        })
      }

      appointments.value[index].originalSkuId = appointment.skuId
      appointments.value[index].skuId = substituteSkuId
      appointments.value[index].stockAlternativeChoice = 'substitute'
      appointments.value[index].status = 'substituted'

      const memberStore = useMemberStore()
      const member = memberStore.members.find(m => m.id === appointment.memberId)
      const eligibleGifts = giftsEligible(substituteSkuId, appointment.cans, member?.memberLevelId)
      for (const gift of eligibleGifts) {
        for (let i = 0; i < gift.count; i++) {
          const activity = activities.value.find(a => a.giftItem === gift.name)
          const redemptionId = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          redemptions.value.push({
            id: redemptionId,
            appointmentId,
            activityId: activity?.id || '',
            giftItem: gift.name,
            status: 'pending',
          })
        }
      }
    } else if (choice === 'wait') {
      appointments.value[index].stockAlternativeChoice = 'wait'
      appointments.value[index].status = 'waiting_stock'
      const inventoryStore = useInventoryStore()
      const stockOutInfo = inventoryStore.getStockOutInfo(appointment.skuId)
      if (stockOutInfo?.expectedArrival) {
        appointments.value[index].expectedArrival = stockOutInfo.expectedArrival
      }
    }

    return { success: true }
  }

  return {
    appointments,
    activities,
    redemptions,
    stageTransitionRecords,
    getAppointmentsByMember,
    getPendingAppointment,
    giftsEligible,
    createAppointment,
    cancelAppointment,
    completeAppointment,
    confirmStageTransition,
    handleStockAlternative,
  }
})
