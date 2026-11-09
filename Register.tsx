import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'
import { ensureUserDoc } from '../lib/users'
import { registration } from '../lib/AuthContext'
import { authErrorMessage } from '../lib/errors'

export default function Register() {
  const [f, setF] = useState({ prenom: '', nom: '', matricule: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (f.password.length < 6) return setError('Mot de passe : 6 caractères minimum.')
    if (f.password !== f.confirm) return setError('Les mots de passe ne correspondent pas.')
    setBusy(true)
    registration.inProgress = true
    try {
      const { user } = await createUserWithEmailAndPassword(auth, f.email.trim(), f.password)
      const prenom = f.prenom.trim()
      const nom = f.nom.trim().toUpperCase()
      const displayName = `${prenom} ${nom}`
      await updateProfile(user, { displayName })
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        nom,
        prenom,
        matricule: f.matricule.trim(),
        role: 'agent',
        createdAt: Date.now(),
      })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      registration.inProgress = false
      setBusy(false)
    }
  }

  async function google() {
    setError('')
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(cred.user)
    } catch (err) {
      setError(authErrorMessage(err))
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Créer un compte agent</h1>
        {error && <div className="alert error">{error}</div>}
        <div className="grid2">
          <label>Prénom<input value={f.prenom} onChange={set('prenom')} required /></label>
          <label>Nom<input value={f.nom} onChange={set('nom')} required /></label>
        </div>
        <label>Matricule (facultatif)<input value={f.matricule} onChange={set('matricule')} /></label>
        <label>E-mail<input type="email" value={f.email} onChange={set('email')} required autoComplete="email" /></label>
        <div className="grid2">
          <label>Mot de passe<input type="password" value={f.password} onChange={set('password')} required autoComplete="new-password" /></label>
          <label>Confirmation<input type="password" value={f.confirm} onChange={set('confirm')} required autoComplete="new-password" /></label>
        </div>
        <button className="btn primary" disabled={busy}>{busy ? 'Création…' : 'Créer mon compte'}</button>
        <button type="button" className="btn" onClick={google}>S'inscrire avec Google</button>
        <p className="muted center">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </form>
    </div>
  )
}
