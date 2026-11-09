import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { FORMATION_REGEX } from '../types'
import { authErrorMessage } from '../lib/errors'

export default function NouvelleInscription() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ formationCode: 'FOR-27-', dateDebut: '', dateFin: '', lieu: '', motivations: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: k === 'formationCode' ? e.target.value.toUpperCase() : e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const code = f.formationCode.trim()
    if (!FORMATION_REGEX.test(code)) return setError('Intitulé invalide : format attendu FOR-27-XXX (ex. FOR-27-001).')
    if (f.dateFin < f.dateDebut) return setError('La date de fin doit être postérieure à la date de début.')
    if (!f.motivations.trim()) return setError('Les motivations sont obligatoires.')
    if (!user || !profile) return
    setBusy(true)
    try {
      const now = Date.now()
      await addDoc(collection(db, 'inscriptions'), {
        userId: user.uid,
        userName: profile.displayName,
        userEmail: profile.email,
        formationCode: code,
        dateDebut: f.dateDebut,
        dateFin: f.dateFin,
        lieu: f.lieu.trim(),
        motivations: f.motivations.trim(),
        statut: 'en_attente',
        inscriptionO2: false,
        convocationEnvoyee: false,
        createdAt: now,
        updatedAt: now,
      })
      nav('/mes-formations')
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <>
      <h1>Inscription à une formation</h1>
      <form className="card form" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        <label>Intitulé de la formation
          <input value={f.formationCode} onChange={set('formationCode')} placeholder="FOR-27-001" required maxLength={40} />
          <small className="muted">Format : FOR-27-…</small>
        </label>
        <div className="grid2">
          <label>Date de début<input type="date" value={f.dateDebut} onChange={set('dateDebut')} required /></label>
          <label>Date de fin<input type="date" value={f.dateFin} min={f.dateDebut} onChange={set('dateFin')} required /></label>
        </div>
        <label>Lieu<input value={f.lieu} onChange={set('lieu')} required /></label>
        <label>Motivations
          <textarea rows={6} value={f.motivations} onChange={set('motivations')} required />
        </label>
        <button className="btn primary" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer ma demande'}</button>
      </form>
    </>
  )
}
