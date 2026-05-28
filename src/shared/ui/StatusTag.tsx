import { Tag } from 'antd'

interface StatusTagProps {
  status?: string | null
}

export function StatusTag({ status }: StatusTagProps) {
  if (status === 'ENABLED') {
    return <Tag color="green">启用</Tag>
  }
  if (status === 'DISABLED') {
    return <Tag color="red">停用</Tag>
  }
  return <Tag>未知</Tag>
}
