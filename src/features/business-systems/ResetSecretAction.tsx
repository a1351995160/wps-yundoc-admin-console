import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface ResetSecretActionProps {
  onConfirm: () => Promise<void>
}

export function ResetSecretAction({ onConfirm }: ResetSecretActionProps) {
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await onConfirm()
      setConfirming(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirming) {
    return (
      <div className="inline-confirm" role="alert">
        <span>旧业务凭证会失效。</span>
        <button className="danger-button" disabled={submitting} aria-label="确认重置" onClick={handleConfirm}>
          {submitting ? '重置中' : '确认重置'}
        </button>
        <button type="button" onClick={() => setConfirming(false)}>
          取消
        </button>
      </div>
    )
  }

  return (
    <button className="danger-button" type="button" aria-label="重置密钥" onClick={() => setConfirming(true)}>
      <RotateCcw size={16} aria-hidden="true" />
      重置密钥
    </button>
  )
}
