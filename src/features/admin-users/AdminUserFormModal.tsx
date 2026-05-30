import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getRoleLabel, getStatusLabel, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../auth/permissions'
import type {
  AdminUser,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  ManagedAdminRole
} from './types'

const MANAGED_ROLES: ManagedAdminRole[] = ['SYSTEM_ADMIN', 'AUDITOR', 'SUPPORT']

type AdminUserFormModalCommonProps = Readonly<{
  submitting: boolean
  errorMessage?: string
  onClose: () => void
}>

type AdminUserFormModalProps =
  | (AdminUserFormModalCommonProps & {
      mode: 'create'
      onSubmit: (request: AdminUserCreateRequest) => Promise<void>
    })
  | (AdminUserFormModalCommonProps & {
      mode: 'edit'
      user: AdminUser
      onSubmit: (request: AdminUserUpdateRequest) => Promise<void>
    })

export function AdminUserFormModal(props: AdminUserFormModalProps) {
  const { mode, submitting, errorMessage, onClose } = props
  const user = mode === 'edit' ? props.user : undefined
  const [username, setUsername] = useState(user?.username ?? '')
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [role, setRole] = useState<ManagedAdminRole>(user?.role ?? 'SYSTEM_ADMIN')
  const [status, setStatus] = useState(user?.status ?? 'ENABLED')
  const [initialPassword, setInitialPassword] = useState('')
  const [waitingConfirm, setWaitingConfirm] = useState(false)

  useEffect(() => {
    setUsername(user?.username ?? '')
    setDisplayName(user?.displayName ?? '')
    setRole(user?.role ?? 'SYSTEM_ADMIN')
    setStatus(user?.status ?? 'ENABLED')
    setInitialPassword('')
    setWaitingConfirm(false)
  }, [user])

  const isEditing = mode === 'edit'
  const changesRole = isEditing && role !== user?.role
  const disablesUser = isEditing && status === 'DISABLED' && status !== user?.status
  const needsConfirmation = changesRole || disablesUser
  const submitLabel = getSubmitLabel(submitting, waitingConfirm, isEditing)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (needsConfirmation && !waitingConfirm) {
      setWaitingConfirm(true)
      return
    }

    if (props.mode === 'edit') {
      await props.onSubmit({ displayName, role, status })
      return
    }

    await props.onSubmit({ username, displayName, role, initialPassword })
  }

  return (
    <dialog className="modal-backdrop" open aria-label={isEditing ? '编辑后台用户' : '新增后台用户'}>
      <section className="form-modal">
        <div className="modal-heading">
          <div>
            <h2>{isEditing ? '编辑后台用户' : '新增后台用户'}</h2>
            <p>
              {isEditing
                ? '修改用户姓名、角色或状态。角色和停用操作会影响后台访问。'
                : '创建可登录管理台的后台用户。初始密码只会提交给后端，不会在列表中展示。'}
            </p>
          </div>
          <button className="modal-close-button" type="button" aria-label="关闭弹窗" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="edit-grid" onSubmit={handleSubmit}>
          <label>
            <span>登录账号</span>
            <input
              aria-label="登录账号"
              value={username}
              disabled={isEditing}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label>
            <span>用户姓名</span>
            <input
              aria-label="用户姓名"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
          </label>
          <label>
            <span>角色</span>
            <select
              aria-label="角色"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as ManagedAdminRole)
                setWaitingConfirm(false)
              }}
            >
              {MANAGED_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {ROLE_LABELS[roleOption]}
                </option>
              ))}
            </select>
            <small>{ROLE_DESCRIPTIONS[role]}</small>
          </label>

          {isEditing ? (
            <label>
              <span>状态</span>
              <select
                aria-label="状态"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as AdminUser['status'])
                  setWaitingConfirm(false)
                }}
              >
                <option value="ENABLED">启用</option>
                <option value="DISABLED">停用</option>
              </select>
            </label>
          ) : (
            <label>
              <span>初始密码</span>
              <input
                aria-label="初始密码"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={initialPassword}
                onChange={(event) => setInitialPassword(event.target.value)}
                required
              />
            </label>
          )}

          {waitingConfirm ? (
            <div className="risk-confirm" role="alert">
              <strong>请确认本次变更</strong>
              {changesRole ? (
                <span>
                  角色将从 {getRoleLabel(user?.role)} 调整为 {getRoleLabel(role)}，用户可执行的后台操作会变化。
                </span>
              ) : null}
              {disablesUser ? (
                <span>
                  状态将调整为 {getStatusLabel(status)}，该用户将无法登录，已登录会话会在下次后端校验时失效。
                </span>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              取消
            </button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitLabel}
            </button>
          </div>
        </form>
      </section>
    </dialog>
  )
}

function getSubmitLabel(submitting: boolean, waitingConfirm: boolean, isEditing: boolean): string {
  if (submitting) {
    return '保存中'
  }
  if (waitingConfirm) {
    return '确认保存'
  }
  if (isEditing) {
    return '保存用户'
  }
  return '创建用户'
}
