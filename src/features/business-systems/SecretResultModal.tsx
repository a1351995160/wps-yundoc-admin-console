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
        <dl className="secret-fields">
          <dt>clientId</dt>
          <dd>{clientId}</dd>
          <dt>clientSecret</dt>
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
