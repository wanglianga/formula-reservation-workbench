export interface MemberLevel {
  id: string
  name: string
  discount: number
  giftBonus: number
}

export interface Member {
  id: string
  name: string
  phone: string
  memberLevelId: string
  joinDate: string
}

export interface Baby {
  id: string
  memberId: string
  name: string
  gender: '男' | '女'
  birthDate: string
  months: number
  allergyNote: string | ''
  avatar: string | ''
}

export interface MilkSku {
  id: string
  brand: string
  stage: '1段' | '2段' | '3段' | '4段'
  name: string
  price: number
  ageMinMonths: number
  ageMaxMonths: number
}

export interface Batch {
  id: string
  skuId: string
  batchNo: string
  quantity: number
  productionDate: string
  expiryDate: string
  receivedDate: string
  supplier: string
}

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'waiting_stock' | 'substituted'

export interface StageTransitionRecord {
  id: string
  babyId: string
  fromStage: string
  toStage: string
  fromSkuId: string
  toSkuId: string
  reason: string
  customerConsent: boolean
  operatorName: string
  createdAt: string
  appointmentId?: string
}

export interface StockAlternative {
  skuId: string
  reason: 'same_stage_substitute' | 'wait_restock'
  expectedArrival?: string
  giftImpact: string
  customerChoice?: 'wait' | 'substitute' | 'none'
}

export interface Appointment {
  id: string
  memberId: string
  babyId: string
  skuId: string
  cans: number
  pickupTime: string
  status: AppointmentStatus
  createdAt: string
  staffName: string
  stageTransitionId?: string
  originalSkuId?: string
  stockAlternativeChoice?: 'wait' | 'substitute'
  expectedArrival?: string
}

export interface GiftActivity {
  id: string
  name: string
  giftItem: string
  minCans: number
  startDate: string
  endDate: string
  memberLevelRequired?: string
}

export type RedemptionStatus = 'pending' | 'redeemed' | 'expired'

export interface Redemption {
  id: string
  appointmentId: string
  activityId: string
  giftItem: string
  status: RedemptionStatus
  redeemedAt?: string
  operatorName?: string
}

export type StockOutStatus = 'pending' | 'resolved' | 'cancelled'

export interface StockOut {
  id: string
  skuId: string
  quantity: number
  reportDate: string
  expectedArrival?: string
  status: StockOutStatus
  note?: string
}

export interface GiftItem {
  name: string
  count: number
  reason: string
}
