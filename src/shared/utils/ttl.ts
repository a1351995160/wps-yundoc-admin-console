export function formatTtl(value?: number | null): string {
  if (!value) {
    return '-'
  }
  if (value % 3600 === 0) {
    return `${value / 3600} 小时`
  }
  if (value % 60 === 0) {
    return `${value / 60} 分钟`
  }
  return `${value} 秒`
}
