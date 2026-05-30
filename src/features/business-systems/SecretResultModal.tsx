import { CopyButton } from '../../shared/ui/CopyButton'

type SecretResultModalProps = Readonly<{
  title: string
  clientId: string
  clientSecret: string
  versionText?: string
  onClose: () => void
}>

export function SecretResultModal({
  title,
  clientId,
  clientSecret,
  versionText,
  onClose
}: SecretResultModalProps) {
  return (
    <dialog className="modal-backdrop" open aria-label={title}>
      <section className="secret-modal">
        <h2>{title}</h2>
        <p className="secret-warning">请立即保存客户端密钥。关闭后系统不再展示明文，只能重新生成。</p>
        <dl className="secret-fields">
          <dt>接入标识</dt>
          <dd>{clientId}</dd>
          <dt>客户端密钥</dt>
          <dd>
            <code>{clientSecret}</code>
            <CopyButton value={clientSecret} />
          </dd>
          {versionText ? (
            <>
              <dt>版本</dt>
              <dd>{versionText}</dd>
            </>
          ) : null}
        </dl>
        <button className="primary-button" type="button" aria-label="我已保存" onClick={onClose}>
          我已保存
        </button>
      </section>
    </dialog>
  )
}
