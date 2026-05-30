import type { ReactNode } from 'react'

type SummaryItemProps = Readonly<{
  icon: ReactNode
  label: string
  value: string
}>

export function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="summary-item">
      <span className="summary-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
