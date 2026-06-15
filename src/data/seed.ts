import type {
  MemberLevel,
  Member,
  Baby,
  MilkSku,
  Batch,
  Appointment,
  GiftActivity,
  Redemption,
  StockOut,
} from '@/types'

export const seedMemberLevels: MemberLevel[] = [
  { id: 'ml-1', name: '普通会员', discount: 1, giftBonus: 0 },
  { id: 'ml-2', name: '银卡会员', discount: 0.95, giftBonus: 1 },
  { id: 'ml-3', name: '金卡会员', discount: 0.9, giftBonus: 2 },
  { id: 'ml-4', name: '钻石会员', discount: 0.85, giftBonus: 3 },
]

export const seedMembers: Member[] = [
  { id: 'm-1', name: '张女士', phone: '13800138001', memberLevelId: 'ml-4', joinDate: '2023-01-15' },
  { id: 'm-2', name: '李先生', phone: '13800138002', memberLevelId: 'ml-3', joinDate: '2023-03-20' },
  { id: 'm-3', name: '王女士', phone: '13800138003', memberLevelId: 'ml-2', joinDate: '2023-06-10' },
  { id: 'm-4', name: '赵女士', phone: '13800138004', memberLevelId: 'ml-1', joinDate: '2024-02-28' },
  { id: 'm-5', name: '陈先生', phone: '13800138005', memberLevelId: 'ml-2', joinDate: '2023-11-05' },
]

export const seedBabies: Baby[] = [
  { id: 'b-1', memberId: 'm-1', name: '小宝', gender: '男', birthDate: '2025-12-15', months: 6, allergyNote: '', avatar: '👶' },
  { id: 'b-2', memberId: 'm-1', name: '小贝', gender: '女', birthDate: '2025-10-11', months: 8, allergyNote: '牛奶蛋白过敏-禁用XX品牌', avatar: '👧' },
  { id: 'b-3', memberId: 'm-2', name: '乐乐', gender: '男', birthDate: '2025-03-11', months: 15, allergyNote: '', avatar: '🧒' },
  { id: 'b-4', memberId: 'm-3', name: '糖糖', gender: '女', birthDate: '2024-02-11', months: 28, allergyNote: '乳糖不耐受-建议选择特殊配方', avatar: '👧' },
  { id: 'b-5', memberId: 'm-4', name: '壮壮', gender: '男', birthDate: '2022-12-11', months: 42, allergyNote: '', avatar: '🧒' },
  { id: 'b-6', memberId: 'm-5', name: '萌萌', gender: '女', birthDate: '2026-01-11', months: 5, allergyNote: '', avatar: '👶' },
  { id: 'b-7', memberId: 'm-2', name: '甜甜', gender: '女', birthDate: '2025-06-15', months: 12, allergyNote: '', avatar: '👶' },
]

export const seedSkus: MilkSku[] = [
  { id: 'sku-1', brand: '爱他美', stage: '1段', name: '爱他美卓萃1段', price: 368, ageMinMonths: 0, ageMaxMonths: 6 },
  { id: 'sku-2', brand: '爱他美', stage: '2段', name: '爱他美卓萃2段', price: 338, ageMinMonths: 6, ageMaxMonths: 12 },
  { id: 'sku-3', brand: '爱他美', stage: '3段', name: '爱他美卓萃3段', price: 308, ageMinMonths: 12, ageMaxMonths: 36 },
  { id: 'sku-4', brand: '飞鹤', stage: '1段', name: '飞鹤星飞帆1段', price: 328, ageMinMonths: 0, ageMaxMonths: 6 },
  { id: 'sku-5', brand: '飞鹤', stage: '2段', name: '飞鹤星飞帆2段', price: 298, ageMinMonths: 6, ageMaxMonths: 12 },
  { id: 'sku-6', brand: '飞鹤', stage: '3段', name: '飞鹤星飞帆3段', price: 278, ageMinMonths: 12, ageMaxMonths: 36 },
  { id: 'sku-7', brand: '美素佳儿', stage: '1段', name: '美素佳儿皇家1段', price: 388, ageMinMonths: 0, ageMaxMonths: 6 },
  { id: 'sku-8', brand: '美素佳儿', stage: '2段', name: '美素佳儿皇家2段', price: 358, ageMinMonths: 6, ageMaxMonths: 12 },
  { id: 'sku-9', brand: '美素佳儿', stage: '3段', name: '美素佳儿皇家3段', price: 328, ageMinMonths: 12, ageMaxMonths: 36 },
  { id: 'sku-10', brand: '金领冠', stage: '1段', name: '金领冠珍护1段', price: 318, ageMinMonths: 0, ageMaxMonths: 6 },
  { id: 'sku-11', brand: '金领冠', stage: '2段', name: '金领冠珍护2段', price: 288, ageMinMonths: 6, ageMaxMonths: 12 },
  { id: 'sku-12', brand: '金领冠', stage: '3段', name: '金领冠珍护3段', price: 258, ageMinMonths: 12, ageMaxMonths: 36 },
]

export const seedBatches: Batch[] = [
  { id: 'batch-1', skuId: 'sku-1', batchNo: 'B202501001', quantity: 50, productionDate: '2025-01-15', expiryDate: '2027-01-14', receivedDate: '2025-02-01', supplier: '爱他美华东总代' },
  { id: 'batch-2', skuId: 'sku-1', batchNo: 'B202503002', quantity: 30, productionDate: '2025-03-20', expiryDate: '2027-03-19', receivedDate: '2025-04-10', supplier: '爱他美华东总代' },
  { id: 'batch-3', skuId: 'sku-2', batchNo: 'B202502003', quantity: 45, productionDate: '2025-02-10', expiryDate: '2027-02-09', receivedDate: '2025-03-01', supplier: '爱他美华东总代' },
  { id: 'batch-4', skuId: 'sku-2', batchNo: 'B202406004', quantity: 8, productionDate: '2024-06-15', expiryDate: '2026-06-14', receivedDate: '2024-07-20', supplier: '爱他美华东总代' },
  { id: 'batch-5', skuId: 'sku-3', batchNo: 'B202504005', quantity: 60, productionDate: '2025-04-05', expiryDate: '2027-04-04', receivedDate: '2025-05-01', supplier: '爱他美华东总代' },
  { id: 'batch-6', skuId: 'sku-4', batchNo: 'F202501006', quantity: 40, productionDate: '2025-01-25', expiryDate: '2027-01-24', receivedDate: '2025-02-15', supplier: '飞鹤华北经销' },
  { id: 'batch-7', skuId: 'sku-4', batchNo: 'F202505007', quantity: 25, productionDate: '2025-05-10', expiryDate: '2027-05-09', receivedDate: '2025-06-01', supplier: '飞鹤华北经销' },
  { id: 'batch-8', skuId: 'sku-5', batchNo: 'F202502008', quantity: 35, productionDate: '2025-02-28', expiryDate: '2027-02-27', receivedDate: '2025-03-20', supplier: '飞鹤华北经销' },
  { id: 'batch-9', skuId: 'sku-5', batchNo: 'F202408009', quantity: 5, productionDate: '2024-08-12', expiryDate: '2026-08-11', receivedDate: '2024-09-10', supplier: '飞鹤华北经销' },
  { id: 'batch-10', skuId: 'sku-6', batchNo: 'F202503010', quantity: 55, productionDate: '2025-03-18', expiryDate: '2027-03-17', receivedDate: '2025-04-15', supplier: '飞鹤华北经销' },
  { id: 'batch-11', skuId: 'sku-7', batchNo: 'M202502011', quantity: 30, productionDate: '2025-02-08', expiryDate: '2027-02-07', receivedDate: '2025-03-05', supplier: '美素佳儿华南代理' },
  { id: 'batch-12', skuId: 'sku-7', batchNo: 'M202505012', quantity: 20, productionDate: '2025-05-15', expiryDate: '2027-05-14', receivedDate: '2025-06-10', supplier: '美素佳儿华南代理' },
  { id: 'batch-13', skuId: 'sku-8', batchNo: 'M202501013', quantity: 42, productionDate: '2025-01-20', expiryDate: '2027-01-19', receivedDate: '2025-02-25', supplier: '美素佳儿华南代理' },
  { id: 'batch-14', skuId: 'sku-8', batchNo: 'M202409014', quantity: 6, productionDate: '2024-09-25', expiryDate: '2026-09-24', receivedDate: '2024-10-20', supplier: '美素佳儿华南代理' },
  { id: 'batch-15', skuId: 'sku-9', batchNo: 'M202504015', quantity: 48, productionDate: '2025-04-12', expiryDate: '2027-04-11', receivedDate: '2025-05-15', supplier: '美素佳儿华南代理' },
  { id: 'batch-16', skuId: 'sku-10', batchNo: 'J202503016', quantity: 38, productionDate: '2025-03-05', expiryDate: '2027-03-04', receivedDate: '2025-04-01', supplier: '金领冠华中总代' },
  { id: 'batch-17', skuId: 'sku-10', batchNo: 'J202506017', quantity: 28, productionDate: '2025-06-01', expiryDate: '2027-05-31', receivedDate: '2025-06-20', supplier: '金领冠华中总代' },
  { id: 'batch-18', skuId: 'sku-11', batchNo: 'J202502018', quantity: 33, productionDate: '2025-02-14', expiryDate: '2027-02-13', receivedDate: '2025-03-10', supplier: '金领冠华中总代' },
  { id: 'batch-19', skuId: 'sku-11', batchNo: 'J202407019', quantity: 4, productionDate: '2024-07-20', expiryDate: '2026-07-19', receivedDate: '2024-08-25', supplier: '金领冠华中总代' },
  { id: 'batch-20', skuId: 'sku-12', batchNo: 'J202505020', quantity: 52, productionDate: '2025-05-08', expiryDate: '2027-05-07', receivedDate: '2025-06-05', supplier: '金领冠华中总代' },
]

export const seedAppointments: Appointment[] = [
  { id: 'a-1', memberId: 'm-1', babyId: 'b-1', skuId: 'sku-1', cans: 3, pickupTime: '2026-06-12 10:00', status: 'pending', createdAt: '2026-06-10 14:30', staffName: '店员小王' },
  { id: 'a-2', memberId: 'm-2', babyId: 'b-3', skuId: 'sku-5', cans: 6, pickupTime: '2026-06-11 15:30', status: 'pending', createdAt: '2026-06-09 09:15', staffName: '店员小李' },
  { id: 'a-3', memberId: 'm-3', babyId: 'b-4', skuId: 'sku-8', cans: 2, pickupTime: '2026-06-10 11:00', status: 'completed', createdAt: '2026-06-08 16:00', staffName: '店员小王' },
  { id: 'a-4', memberId: 'm-4', babyId: 'b-5', skuId: 'sku-6', cans: 4, pickupTime: '2026-06-09 14:00', status: 'completed', createdAt: '2026-06-07 10:20', staffName: '店员小张' },
  { id: 'a-5', memberId: 'm-5', babyId: 'b-6', skuId: 'sku-10', cans: 1, pickupTime: '2026-06-08 09:30', status: 'completed', createdAt: '2026-06-06 15:45', staffName: '店员小李' },
  { id: 'a-6', memberId: 'm-1', babyId: 'b-2', skuId: 'sku-2', cans: 5, pickupTime: '2026-06-07 10:30', status: 'completed', createdAt: '2026-06-05 11:00', staffName: '店员小王' },
  { id: 'a-7', memberId: 'm-2', babyId: 'b-3', skuId: 'sku-3', cans: 12, pickupTime: '2026-06-05 16:00', status: 'completed', createdAt: '2026-06-03 14:15', staffName: '店员小张' },
  { id: 'a-8', memberId: 'm-3', babyId: 'b-4', skuId: 'sku-9', cans: 3, pickupTime: '2026-06-04 11:30', status: 'cancelled', createdAt: '2026-06-02 09:30', staffName: '店员小李' },
  { id: 'a-9', memberId: 'm-4', babyId: 'b-5', skuId: 'sku-12', cans: 6, pickupTime: '2026-06-03 15:00', status: 'cancelled', createdAt: '2026-06-01 13:20', staffName: '店员小王' },
  { id: 'a-10', memberId: 'm-1', babyId: 'b-1', skuId: 'sku-7', cans: 2, pickupTime: '2026-06-13 14:00', status: 'pending', createdAt: '2026-06-10 16:50', staffName: '店员小张' },
]

export const seedActivities: GiftActivity[] = [
  { id: 'act-1', name: '新客专属礼', giftItem: '宝宝湿巾1包', minCans: 1, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'act-2', name: '满3罐赠好礼', giftItem: '宝宝洗衣液1瓶', minCans: 3, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'act-3', name: '满6罐超值赠', giftItem: '儿童滑板车1辆', minCans: 6, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'act-4', name: '满12罐豪华赠', giftItem: '儿童安全座椅1台', minCans: 12, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'act-5', name: '金卡专享礼', giftItem: '品牌保温杯1个', minCans: 2, startDate: '2026-01-01', endDate: '2026-12-31', memberLevelRequired: 'ml-3' },
]

export const seedRedemptions: Redemption[] = [
  { id: 'r-1', appointmentId: 'a-3', activityId: 'act-1', giftItem: '宝宝湿巾1包', status: 'redeemed', redeemedAt: '2026-06-10 11:15', operatorName: '店员小王' },
  { id: 'r-2', appointmentId: 'a-4', activityId: 'act-2', giftItem: '宝宝洗衣液1瓶', status: 'redeemed', redeemedAt: '2026-06-09 14:20', operatorName: '店员小张' },
  { id: 'r-3', appointmentId: 'a-5', activityId: 'act-1', giftItem: '宝宝湿巾1包', status: 'redeemed', redeemedAt: '2026-06-08 09:45', operatorName: '店员小李' },
  { id: 'r-4', appointmentId: 'a-6', activityId: 'act-2', giftItem: '宝宝洗衣液1瓶', status: 'redeemed', redeemedAt: '2026-06-07 10:45', operatorName: '店员小王' },
  { id: 'r-5', appointmentId: 'a-6', activityId: 'act-5', giftItem: '品牌保温杯1个', status: 'redeemed', redeemedAt: '2026-06-07 10:45', operatorName: '店员小王' },
  { id: 'r-6', appointmentId: 'a-7', activityId: 'act-3', giftItem: '儿童滑板车1辆', status: 'redeemed', redeemedAt: '2026-06-05 16:15', operatorName: '店员小张' },
  { id: 'r-7', appointmentId: 'a-7', activityId: 'act-4', giftItem: '儿童安全座椅1台', status: 'redeemed', redeemedAt: '2026-06-05 16:15', operatorName: '店员小张' },
  { id: 'r-8', appointmentId: 'a-7', activityId: 'act-5', giftItem: '品牌保温杯1个', status: 'redeemed', redeemedAt: '2026-06-05 16:15', operatorName: '店员小张' },
  { id: 'r-9', appointmentId: 'a-8', activityId: 'act-2', giftItem: '宝宝洗衣液1瓶', status: 'expired' },
  { id: 'r-10', appointmentId: 'a-9', activityId: 'act-3', giftItem: '儿童滑板车1辆', status: 'expired' },
  { id: 'r-11', appointmentId: 'a-1', activityId: 'act-2', giftItem: '宝宝洗衣液1瓶', status: 'pending' },
  { id: 'r-12', appointmentId: 'a-1', activityId: 'act-5', giftItem: '品牌保温杯1个', status: 'pending' },
  { id: 'r-13', appointmentId: 'a-2', activityId: 'act-3', giftItem: '儿童滑板车1辆', status: 'pending' },
  { id: 'r-14', appointmentId: 'a-2', activityId: 'act-5', giftItem: '品牌保温杯1个', status: 'pending' },
  { id: 'r-15', appointmentId: 'a-10', activityId: 'act-1', giftItem: '宝宝湿巾1包', status: 'pending' },
]

export const seedStockOuts: StockOut[] = [
  { id: 'so-1', skuId: 'sku-4', quantity: 20, reportDate: '2026-06-01', expectedArrival: '2026-06-15', status: 'pending', note: '经销商备货中' },
  { id: 'so-2', skuId: 'sku-7', quantity: 15, reportDate: '2026-06-02', expectedArrival: '2026-06-18', status: 'pending', note: '物流运输中' },
  { id: 'so-3', skuId: 'sku-11', quantity: 10, reportDate: '2026-05-25', expectedArrival: '2026-06-10', status: 'resolved', note: '已到货入库' },
  { id: 'so-4', skuId: 'sku-2', quantity: 25, reportDate: '2026-06-05', status: 'pending', note: '已联系供应商补货' },
  { id: 'so-5', skuId: 'sku-8', quantity: 18, reportDate: '2026-06-03', expectedArrival: '2026-06-20', status: 'pending', note: '预计下周到达' },
  { id: 'so-6', skuId: 'sku-5', quantity: 30, reportDate: '2026-05-20', expectedArrival: '2026-06-05', status: 'resolved', note: '已完成补货' },
  { id: 'so-7', skuId: 'sku-10', quantity: 12, reportDate: '2026-06-08', status: 'cancelled', note: '客户取消预约，无需补货' },
  { id: 'so-8', skuId: 'sku-3', quantity: 22, reportDate: '2026-06-09', expectedArrival: '2026-06-25', status: 'pending', note: '紧急补货申请已提交' },
]
