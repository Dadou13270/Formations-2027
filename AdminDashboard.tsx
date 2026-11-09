import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useInscriptions } from '../../lib/useInscriptions'
import AdminNav from '../../components/AdminNav'

export default function AdminDashboard() {
  const { items, loading } = useInscriptions()
  const [nbUsers, setNbUsers] = useState(0)

  useEffect(() => onSnapshot(collection(db, 'users'), (s) => setNbUsers(s.size)), [])

  const stats = useMemo(() => {
    const byFormation = new Map<string, number>()
    items.forEach((i) => byFormation.set(i.formationCode, (byFormation.get(i.formationCode) || 0) + 1))
    return {
      total: items.length,
      attente: items.filter((i) => i.statut === 'en_attente').length,
      retenu: items.filter((i) => i.statut === 'retenu').length,
      nonRetenu: items.filter((i) => i.statut === 'non_retenu').length,
      annulee: items.filter((i) => i.annulee).length,
      o2: items.filter((i) => i.inscriptionO2).length,
      convoc: items.filter((i) => i.convocationEnvoyee).length,
      byFormation: [...byFormation.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [items])

  return (
    <>
      <h1>Administration</h1>
      <AdminNav />
      {loading ? <p className="muted">Chargement…</p> : (
        <>
          <div className="stats">
            <Stat label="Formations demandées" value={stats.total} accent />
            <Stat label="Utilisateurs inscrits" value={nbUsers} />
            <Stat label="En attente" value={stats.attente} />
            <Stat label="Retenus" value={stats.retenu} />
            <Stat label="Non retenus" value={stats.nonRetenu} />
            <Stat label="Annulées (agent)" value={stats.annulee} />
            <Stat label="Inscrits O2" value={stats.o2} />
            <Stat label="Convocations envoyées" value={stats.convoc} />
          </div>
          <h2>Demandes par formation</h2>
          <div className="card">
            {stats.byFormation.length === 0 ? <p className="muted">Aucune demande.</p> : (
              <table>
                <thead><tr><th>Formation</th><th>Demandes</th></tr></thead>
                <tbody>
                  {stats.byFormation.map(([code, n]) => (
                    <tr key={code}><td>{code}</td><td>{n}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p><Link className="btn primary" to="/admin/formations">Ouvrir le suivi des formations</Link></p>
        </>
      )}
    </>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`stat card ${accent ? 'accent' : ''}`}>
      <div className="num">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  )
}
