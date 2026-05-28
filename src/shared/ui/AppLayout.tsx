import { Database, KeyRound, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
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
        </nav>
      </aside>
      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  )
}
