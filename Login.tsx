import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { ensureUserDoc } from '../lib/users'
import { authErrorMessage } from '../lib/errors'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function google() {
    setError('')
    setInfo('')
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(cred.user)
    } catch (err) {
      setError(authErrorMessage(err))
    }
  }

  async function reset() {
    if (!email.trim()) return setError('Saisissez votre e-mail puis cliquez sur « Mot de passe oublié ».')
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setError('')
      setInfo('E-mail de réinitialisation envoyé.')
    } catch (err) {
      setError(authErrorMessage(err))
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>🚒 Formations départementales 2027</h1>
        <p className="muted">Connexion agent</p>
        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert ok">{info}</div>}
        <label>E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="btn primary" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        <button type="button" className="btn" onClick={google}>Continuer avec Google</button>
        <button type="button" className="link" onClick={reset}>Mot de passe oublié</button>
        <p className="muted center">Pas de compte ? <Link to="/creer-compte">Créer un compte</Link></p>
      </form>
    </div>
  )
}
