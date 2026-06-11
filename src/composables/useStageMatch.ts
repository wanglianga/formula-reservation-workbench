export interface MatchSku {
  ageMinMonths: number
  ageMaxMonths: number
  brand: string
}

export interface MatchResult {
  level: 'safe' | 'warning' | 'danger'
  message: string
  matched: boolean
}

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
