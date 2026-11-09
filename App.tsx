import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { PublicOnly, RequireAdmin, RequireAuth } from './components/Guards'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import NouvelleInscription from './pages/NouvelleInscription'
import MesFormations from './pages/MesFormations'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminFormations from './pages/admin/AdminFormations'
import AdminFormationDetail from './pages/admin/AdminFormationDetail'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/connexion" element={<Login />} />
          <Route path="/creer-compte" element={<Register />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/inscription" element={<NouvelleInscription />} />
            <Route path="/mes-formations" element={<MesFormations />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/utilisateurs" element={<AdminUsers />} />
              <Route path="/admin/formations" element={<AdminFormations />} />
              <Route path="/admin/formations/:id" element={<AdminFormationDetail />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/mes-formations" replace />} />
      </Routes>
    </AuthProvider>
  )
}
