import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInscriptions } from '../../lib/useInscriptions'
import AdminNav from '../../components/AdminNav'
import StatutBadge from '../../components/StatutBadge'
import { fmtDate, STATUT_LABEL, type Statut } from '../../types'

export default function AdminFormations() {
  const { items, loading, error } = useInscriptions()
  const nav = useNavigate()
  const [statut, setStatut] = useState<'all' | 'annulee' | Statut>('all')
  const [q, setQ] = useState('')

  const filtered = items.filter(
    (i) =>
      (statut === 'all' || (statut === 'annulee' ? !!i.annulee : i.statut === statut)) &&
      `${i.formationCode} ${i.userName} ${i.lieu}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <>
      <h1>Suivi des formations <span className="pill">{items.length} demandée{items.length > 1 ? 's' : ''}</span></h1>
      <AdminNav />
      {error && <div className="alert error">{error}</div>}
      <div className="row filters">
        <input className="search" placeholder="Rechercher formation, agent, lieu…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statut} onChange={(e) => setStatut(e.target.value as 'all' | 'annulee' | Statut)}>
          <option value="all">Tous les statuts</option>
          {(Object.keys(STATUT_LABEL) as Statut[]).map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          <option value="annulee">Annulées à la demande de l'agent</option>
        </select>
      </div>
      {loading ? <p className="muted">Chargement…</p> : (
        <div className="card table-wrap">
          <table className="clickable responsive">
            <thead><tr><th>Formation</th><th>Demandée par</th><th>Dates</th><th>Lieu</th><th>O2</th><th>Convoc.</th><th>Statut</th></tr></thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} onClick={() => nav(`/admin/formations/${i.id}`)}>
                  <td data-label="Formation"><Link to={`/admin/formations/${i.id}`} onClick={(e) => e.stopPropagation()}><strong>{i.formationCode}</strong></Link></td>
                  <td data-label="Demandée par"><strong>{i.userName}</strong></td>
                  <td data-label="Dates">{fmtDate(i.dateDebut)} → {fmtDate(i.dateFin)}</td>
                  <td data-label="Lieu">{i.lieu}</td>
                  <td data-label="O2">{i.inscriptionO2 ? <>✅<span className="sub">{fmtDate(i.o2Date || '')}</span></> : '—'}</td>
                  <td data-label="Convocation">{i.convocationEnvoyee ? <>✅<span className="sub">{fmtDate(i.convocationDate || '')}</span></> : '—'}</td>
                  <td data-label="Statut">
                    <StatutBadge statut={i.statut} />
                    {i.statutDate && <span className="sub">{fmtDate(i.statutDate)}</span>}
                    {i.annulee && <span className="badge annule" style={{ marginTop: 4 }}>Annulée agent{i.annuleeDate ? ` · ${fmtDate(i.annuleeDate)}` : ''}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="muted">Aucune demande.</p>}
        </div>
      )}
    </>
  )
}
