import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useInscriptions } from '../lib/useInscriptions'
import StatutBadge from '../components/StatutBadge'
import { fmtDate, fmtDateTime } from '../types'

export default function MesFormations() {
  const { user } = useAuth()
  const { items, loading, error } = useInscriptions(user?.uid)

  return (
    <>
      <div className="row between">
        <h1>Suivi de mes formations</h1>
        <Link className="btn primary" to="/inscription">+ Nouvelle demande</Link>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <p className="muted">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="card empty">Aucune demande pour le moment.</div>
      ) : (
        <div className="cards">
          {items.map((i) => (
            <article key={i.id} className="card item">
              <div className="row between">
                <h3>{i.formationCode}</h3>
                <StatutBadge statut={i.statut} />
              </div>
              {i.statutDate && <div className="muted small">Statut au {fmtDate(i.statutDate)}</div>}
              <p>📅 Du {fmtDate(i.dateDebut)} au {fmtDate(i.dateFin)}<br />📍 {i.lieu}</p>
              <ul className="checks">
                <li className={i.inscriptionO2 ? 'on' : ''}>{i.inscriptionO2 ? '✅' : '⬜'} Inscription O2{i.o2Date ? ` · ${fmtDate(i.o2Date)}` : ''}</li>
                <li className={i.convocationEnvoyee ? 'on' : ''}>{i.convocationEnvoyee ? '✅' : '⬜'} Convocation envoyée{i.convocationDate ? ` · ${fmtDate(i.convocationDate)}` : ''}</li>
              </ul>
              {i.annulee && <div className="note-annule">Annulée à votre demande{i.annuleeDate ? ` le ${fmtDate(i.annuleeDate)}` : ''}.</div>}
              <div className="muted small">Mis à jour le {fmtDateTime(i.updatedAt)}</div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
