import { Button } from 'antd'
import { Copy } from 'lucide-react'
import { useState } from 'react'

interface CopyButtonProps {
  value: string
}

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
  }

  return (
    <Button icon={<Copy size={16} />} onClick={handleCopy}>
      {copied ? '已复制' : '复制'}
    </Button>
  )
}
