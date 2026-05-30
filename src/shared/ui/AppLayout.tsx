import { Alert, Button, Spin } from 'antd'
import { BookOpen, Database, KeyRound, LogOut, ShieldCheck, UsersRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { canManageAdminUsers, canViewPermissions, getRoleLabel } from '../../features/auth/permissions'
import { useAuthExpiredRedirect, useCurrentAdmin, useLogout } from '../../features/auth/useAuth'

export function AppLayout() {
  useAuthExpiredRedirect()
  const logout = useLogout()
  const currentAdminQuery = useCurrentAdmin()
  const location = useLocation()

  if (currentAdminQuery.isLoading) {
    return (
      <div className="app-loading">
        <Spin />
        <span>正在读取当前管理员身份</span>
      </div>
    )
  }

  if (currentAdminQuery.isError || !currentAdminQuery.data) {
    return (
      <div className="app-loading">
        <Alert type="error" showIcon message="无法读取当前管理员身份，请重新登录。" />
        <Button onClick={logout}>返回登录页</Button>
      </div>
    )
  }

  const currentAdmin = currentAdminQuery.data
  const routeState = location.state as { returnTo?: string } | null
  const permissionEditorFromPermissions =
    location.pathname.includes('/permissions') && routeState?.returnTo === '/permissions'

  return (
    <div className="app-shell">
      <aside className="side-nav" aria-label="主导航">
        <div className="brand-block">
          <ShieldCheck aria-hidden="true" />
          <span>WPS 云文档管理台</span>
        </div>
        <div className="admin-profile" aria-label="当前管理员">
          <strong>{currentAdmin.displayName || currentAdmin.username}</strong>
          <span>{getRoleLabel(currentAdmin.role)}</span>
        </div>
        <nav>
          <NavLink
            to="/business-systems"
            title="业务系统"
            className={({ isActive }) => (isActive && !permissionEditorFromPermissions ? 'active' : '')}
          >
            <Database aria-hidden="true" />
            <span>业务系统</span>
          </NavLink>
          {canViewPermissions(currentAdmin) ? (
            <NavLink
              to="/permissions"
              title="权限管理"
              className={({ isActive }) => (isActive || permissionEditorFromPermissions ? 'active' : '')}
            >
              <KeyRound aria-hidden="true" />
              <span>权限管理</span>
            </NavLink>
          ) : null}
          {canManageAdminUsers(currentAdmin) ? (
            <NavLink to="/admin-users" title="用户管理">
              <UsersRound aria-hidden="true" />
              <span>用户管理</span>
            </NavLink>
          ) : null}
          <NavLink to="/integration-guide" title="接入指南">
            <BookOpen aria-hidden="true" />
            <span>接入指南</span>
          </NavLink>
        </nav>
        <Button className="logout-button" icon={<LogOut size={16} />} onClick={logout}>
          退出
        </Button>
      </aside>
      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  )
}
