import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Layout() {
  const { profile, isAdmin, logout } = useAuth()
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">🚒 Formations 2027</div>
        <nav className="tabs" aria-label="Navigation principale">
          <NavLink to="/inscription"><span className="ico">＋</span><span>S'inscrire</span></NavLink>
          <NavLink to="/mes-formations"><span className="ico">☰</span><span>Mes formations</span></NavLink>
          {isAdmin && <NavLink to="/admin"><span className="ico">⚙</span><span>Admin</span></NavLink>}
        </nav>
        <div className="user">
          <span className="user-name">{profile?.displayName}</span>
          <button className="btn small ghost" onClick={logout}>Déconnexion</button>
        </div>
      </header>
      <main className="container"><Outlet /></main>
    </div>
  )
}
