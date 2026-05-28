import { Button } from 'antd'
import { BookOpen, Database, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useAuthExpiredRedirect, useLogout } from '../../features/auth/useAuth'

export function AppLayout() {
  useAuthExpiredRedirect()
  const logout = useLogout()

  return (
    <div className="app-shell">
      <aside className="side-nav" aria-label="主导航">
        <div className="brand-block">
          <ShieldCheck aria-hidden="true" />
          <span>Yundoc Admin</span>
        </div>
        <nav>
          <Link to="/business-systems">
            <Database aria-hidden="true" />
            业务系统
          </Link>
          <Link to="/business-systems">
            <KeyRound aria-hidden="true" />
            权限控制
          </Link>
          <Link to="/integration-guide">
            <BookOpen aria-hidden="true" />
            接入指南
          </Link>
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
