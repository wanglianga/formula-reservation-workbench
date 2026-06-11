export interface ExpiryResult {
  daysLeft: number
  level: 'green' | 'yellow' | 'red'
  label: string
}

export function checkExpiry(expiryDateStr: string): ExpiryResult {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const expiryDate = new Date(expiryDateStr)
  expiryDate.setHours(0, 0, 0, 0)

  const diffTime = expiryDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let level: 'green' | 'yellow' | 'red'
  let label: string

  if (daysLeft < 0) {
    level = 'red'
    label = `已过期${Math.abs(daysLeft)}天`
  } else if (daysLeft < 30) {
    level = 'red'
    label = `剩余${daysLeft}天`
  } else if (daysLeft < 90) {
    level = 'yellow'
    label = `剩余${daysLeft}天`
  } else {
    level = 'green'
    label = `剩余${daysLeft}天`
  }

  return { daysLeft, level, label }
}
