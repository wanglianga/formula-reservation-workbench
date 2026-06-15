export interface MatchSku {
  ageMinMonths: number
  ageMaxMonths: number
  brand: string
  stage?: string
  id?: string
}

export interface MatchResult {
  level: 'safe' | 'warning' | 'danger'
  message: string
  matched: boolean
}

export interface StageTransitionInfo {
  isNearTransition: boolean
  currentStage: string
  nextStage: string
  monthsToTransition: number
  message: string
}

const STAGE_BOUNDARIES = [
  { maxMonths: 6, stage: '1段', nextStage: '2段' },
  { maxMonths: 12, stage: '2段', nextStage: '3段' },
  { maxMonths: 36, stage: '3段', nextStage: '4段' },
]

const TRANSITION_WARNING_MONTHS = 1

export function matchStageToBaby(
  babyMonths: number,
  sku: MatchSku,
  allergyNote: string
): MatchResult {
  const allergyBrands = allergyNote
    .split(/[,，、;；\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const hasAllergy = allergyBrands.some(
    (brand) => brand && sku.brand.includes(brand)
  )

  if (hasAllergy) {
    return {
      level: 'danger',
      message: `过敏风险：${sku.brand} 与过敏品牌冲突`,
      matched: false,
    }
  }

  if (babyMonths < sku.ageMinMonths || babyMonths > sku.ageMaxMonths) {
    return {
      level: 'warning',
      message: `月龄不匹配：适用${sku.ageMinMonths}-${sku.ageMaxMonths}月龄，当前${babyMonths}月龄`,
      matched: false,
    }
  }

  return {
    level: 'safe',
    message: '匹配成功',
    matched: true,
  }
}

export function checkStageTransition(babyMonths: number): StageTransitionInfo {
  for (const boundary of STAGE_BOUNDARIES) {
    const monthsToTransition = boundary.maxMonths - babyMonths
    if (monthsToTransition >= 0 && monthsToTransition <= TRANSITION_WARNING_MONTHS) {
      return {
        isNearTransition: true,
        currentStage: boundary.stage,
        nextStage: boundary.nextStage,
        monthsToTransition,
        message: `宝宝即将从${boundary.stage}换至${boundary.nextStage}，距换段仅剩${monthsToTransition}个月`,
      }
    }
  }

  for (const boundary of STAGE_BOUNDARIES) {
    if (babyMonths < boundary.maxMonths) {
      return {
        isNearTransition: false,
        currentStage: boundary.stage,
        nextStage: boundary.nextStage,
        monthsToTransition: boundary.maxMonths - babyMonths,
        message: '',
      }
    }
  }

  return {
    isNearTransition: false,
    currentStage: '4段',
    nextStage: '',
    monthsToTransition: 0,
    message: '',
  }
}

export function getStageForMonths(months: number): string {
  if (months < 6) return '1段'
  if (months < 12) return '2段'
  if (months < 36) return '3段'
  return '4段'
}
