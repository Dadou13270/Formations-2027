import { NavLink } from 'react-router-dom'

export default function AdminNav() {
  return (
    <nav className="subnav">
      <NavLink to="/admin" end>Tableau de bord</NavLink>
      <NavLink to="/admin/formations">Suivi des formations</NavLink>
      <NavLink to="/admin/utilisateurs">Utilisateurs inscrits</NavLink>
    </nav>
  )
}
