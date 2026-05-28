interface PermissionChangeSummaryProps {
  originalPermissions: string[]
  selectedPermissions: string[]
}

export function PermissionChangeSummary({
  originalPermissions,
  selectedPermissions
}: PermissionChangeSummaryProps) {
  const originalSet = new Set(originalPermissions)
  const selectedSet = new Set(selectedPermissions)
  const additions = selectedPermissions.filter((apiCode) => !originalSet.has(apiCode))
  const removals = originalPermissions.filter((apiCode) => !selectedSet.has(apiCode))

  return (
    <section className="change-summary" aria-label="权限变更摘要">
      <h2>变更摘要</h2>
      <p>
        新增 {additions.length} 项，移除 {removals.length} 项
      </p>
      <div className="summary-columns">
        <div>
          <strong>新增</strong>
          <ul>
            {additions.length > 0 ? additions.map((apiCode) => <li key={apiCode}>{apiCode}</li>) : <li>-</li>}
          </ul>
        </div>
        <div>
          <strong>移除</strong>
          <ul>
            {removals.length > 0 ? removals.map((apiCode) => <li key={apiCode}>{apiCode}</li>) : <li>-</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}
