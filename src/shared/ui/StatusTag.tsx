type StatusTagProps = Readonly<{
  status?: string | null
}>

export function StatusTag({ status }: StatusTagProps) {
  if (status === 'ENABLED') {
    return <span className="status-pill status-pill--enabled">启用</span>
  }
  if (status === 'DISABLED') {
    return <span className="status-pill status-pill--disabled">停用</span>
  }
  return <span className="status-pill">未知</span>
}
