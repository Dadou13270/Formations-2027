import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { fmtDate, fmtDateTime, STATUT_LABEL, todayISO, type Inscription, type Statut } from '../../types'

interface Form {
  statut: Statut
  statutDate: string
  inscriptionO2: boolean
  o2Date: string
  convocationEnvoyee: boolean
  convocationDate: string
  annulee: boolean
  annuleeDate: string
}

const fromItem = (i: Inscription): Form => ({
  statut: i.statut,
  statutDate: i.statutDate || '',
  inscriptionO2: i.inscriptionO2,
  o2Date: i.o2Date || '',
  convocationEnvoyee: i.convocationEnvoyee,
  convocationDate: i.convocationDate || '',
  annulee: !!i.annulee,
  annuleeDate: i.annuleeDate || '',
})

export default function AdminFormationDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState<Inscription | null>(null)
  const [missing, setMissing] = useState(false)
  const [f, setF] = useState<Form | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(
    () =>
      onSnapshot(
        doc(db, 'inscriptions', id),
        (s) => {
          if (!s.exists()) return setMissing(true)
          const d = { ...(s.data() as Inscription), id: s.id }
          setItem(d)
          setF((prev) => (prev && dirty ? prev : fromItem(d)))
        },
        (e) => setError(e.message),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  )

  const up = (patch: Partial<Form>) => {
    setF((prev) => (prev ? { ...prev, ...patch } : prev))
    setDirty(true)
    setMsg('')
  }

  async function save() {
    if (!f) return
    setBusy(true)
    setError('')
    const retenu = f.statut === 'retenu'
    try {
      await updateDoc(doc(db, 'inscriptions', id), {
        statut: f.statut,
        statutDate: f.statutDate || todayISO(),
        inscriptionO2: f.inscriptionO2,
        o2Date: f.inscriptionO2 ? f.o2Date || todayISO() : '',
        convocationEnvoyee: retenu ? f.convocationEnvoyee : false,
        convocationDate: retenu && f.convocationEnvoyee ? f.convocationDate || todayISO() : '',
        annulee: f.annulee,
        annuleeDate: f.annulee ? f.annuleeDate || todayISO() : '',
        updatedAt: Date.now(),
      })
      setDirty(false)
      setMsg("Fiche mise à jour — visible immédiatement par l'agent.")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Supprimer définitivement cette demande ?')) return
    await deleteDoc(doc(db, 'inscriptions', id))
    nav('/admin/formations')
  }

  if (missing) return <><p>Demande introuvable.</p><Link to="/admin/formations">← Retour</Link></>
  if (!item || !f) return <p className="muted">Chargement…</p>

  return (
    <>
      <p><Link to="/admin/formations">← Suivi des formations</Link></p>
      <h1>{item.formationCode}</h1>
      <div className="card">
        <dl className="details">
          <dt>Demandée par</dt><dd>{item.userName} ({item.userEmail})</dd>
          <dt>Dates</dt><dd>Du {fmtDate(item.dateDebut)} au {fmtDate(item.dateFin)}</dd>
          <dt>Lieu</dt><dd>{item.lieu}</dd>
          <dt>Demande du</dt><dd>{fmtDateTime(item.createdAt)}</dd>
          <dt>Motivations</dt><dd className="pre">{item.motivations}</dd>
        </dl>
      </div>

      <h2>Traitement de la demande</h2>
      <div className="card form">
        {error && <div className="alert error">{error}</div>}
        {msg && <div className="alert ok">{msg}</div>}

        <div className="dated">
          <label className="check">
            <input type="checkbox" checked={f.inscriptionO2}
              onChange={(e) => up({ inscriptionO2: e.target.checked, o2Date: e.target.checked ? f.o2Date || todayISO() : '' })} />
            Inscription O2 effectuée
          </label>
          <input type="date" aria-label="Date inscription O2" value={f.o2Date} disabled={!f.inscriptionO2}
            onChange={(e) => up({ o2Date: e.target.value })} />
        </div>

        <fieldset>
          <legend>Statut</legend>
          {(Object.keys(STATUT_LABEL) as Statut[]).map((s) => (
            <label key={s} className="check">
              <input type="radio" name="statut" checked={f.statut === s}
                onChange={() => up({
                  statut: s,
                  statutDate: todayISO(),
                  ...(s !== 'retenu' ? { convocationEnvoyee: false, convocationDate: '' } : {}),
                })} />
              {STATUT_LABEL[s]}
            </label>
          ))}
          <div className="dated" style={{ width: '100%' }}>
            <span className="dlabel">Date du statut</span>
            <input type="date" aria-label="Date du statut" value={f.statutDate} onChange={(e) => up({ statutDate: e.target.value })} />
          </div>
        </fieldset>

        <div className="dated">
          <label className="check">
            <input type="checkbox" checked={f.convocationEnvoyee} disabled={f.statut !== 'retenu'}
              onChange={(e) => up({ convocationEnvoyee: e.target.checked, convocationDate: e.target.checked ? f.convocationDate || todayISO() : '' })} />
            Convocation envoyée {f.statut !== 'retenu' && <small className="muted">(si « Retenu »)</small>}
          </label>
          <input type="date" aria-label="Date convocation" value={f.convocationDate} disabled={!f.convocationEnvoyee || f.statut !== 'retenu'}
            onChange={(e) => up({ convocationDate: e.target.value })} />
        </div>

        <div className="dated">
          <label className="check">
            <input type="checkbox" checked={f.annulee}
              onChange={(e) => up({ annulee: e.target.checked, annuleeDate: e.target.checked ? f.annuleeDate || todayISO() : '' })} />
            Annulée à la demande de l'agent
          </label>
          <input type="date" aria-label="Date d'annulation" value={f.annuleeDate} disabled={!f.annulee}
            onChange={(e) => up({ annuleeDate: e.target.value })} />
        </div>

        <div className="row">
          <button className="btn primary" onClick={save} disabled={busy || !dirty}>{busy ? 'Enregistrement…' : 'Mettre à jour la fiche'}</button>
          <button className="btn danger" onClick={remove}>Supprimer la demande</button>
        </div>
        <small className="muted">Dernière mise à jour : {fmtDateTime(item.updatedAt)}</small>
      </div>
    </>
  )
}
