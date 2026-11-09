import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export function Loader() {
  return <div className="center-screen">Chargement…</div>
}

export function RequireAuth() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/connexion" replace />
  if (!profile) return <Loader />
  return <Outlet />
}

export function RequireAdmin() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/mes-formations" replace />
  return <Outlet />
}

export function PublicOnly() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (user && profile) return <Navigate to={profile.role === 'admin' ? '/admin' : '/mes-formations'} replace />
  return <Outlet />
}
