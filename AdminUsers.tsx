import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../lib/AuthContext'
import { useInscriptions } from '../../lib/useInscriptions'
import AdminNav from '../../components/AdminNav'
import { fmtDateTime, type Role, type UserProfile } from '../../types'

export default function AdminUsers() {
  const { user } = useAuth()
  const { items } = useInscriptions()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'users'),
        (s) => setUsers(s.docs.map((d) => d.data() as UserProfile).sort((a, b) => a.displayName.localeCompare(b.displayName))),
        (e) => setError(e.message),
      ),
    [],
  )

  const count = (uid: string) => items.filter((i) => i.userId === uid).length
  const filtered = users.filter((u) => `${u.displayName} ${u.email} ${u.matricule || ''}`.toLowerCase().includes(q.toLowerCase()))

  async function setRole(uid: string, role: Role) {
    if (!confirm(`Passer cet utilisateur en « ${role} » ?`)) return
    try { await updateDoc(doc(db, 'users', uid), { role }) } catch (e) { setError((e as Error).message) }
  }

  async function remove(u: UserProfile) {
    if (!confirm(`Supprimer le profil de ${u.displayName} et toutes ses demandes ?\n(Le compte de connexion reste dans Firebase Authentication.)`)) return
    try {
      await Promise.all(items.filter((i) => i.userId === u.uid).map((i) => deleteDoc(doc(db, 'inscriptions', i.id))))
      await deleteDoc(doc(db, 'users', u.uid))
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <h1>Utilisateurs inscrits <span className="pill">{users.length}</span></h1>
      <AdminNav />
      {error && <div className="alert error">{error}</div>}
      <input className="search" placeholder="Rechercher nom, e-mail, matricule…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card table-wrap">
        <table className="responsive">
          <thead><tr><th>Nom</th><th>E-mail</th><th>Matricule</th><th>Demandes</th><th>Rôle</th><th>Créé le</th><th></th></tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.uid}>
                <td data-label="Nom"><strong>{u.displayName}</strong></td>
                <td data-label="E-mail">{u.email}</td>
                <td data-label="Matricule">{u.matricule || '—'}</td>
                <td data-label="Demandes">{count(u.uid)}</td>
                <td data-label="Rôle"><span className={`badge ${u.role === 'admin' ? 'retenu' : 'en_attente'}`}>{u.role}</span></td>
                <td data-label="Créé le">{fmtDateTime(u.createdAt)}</td>
                <td className="actions">
                  {u.uid !== user?.uid && (
                    <>
                      <button className="btn small" onClick={() => setRole(u.uid, u.role === 'admin' ? 'agent' : 'admin')}>
                        {u.role === 'admin' ? 'Retirer admin' : 'Passer admin'}
                      </button>
                      <button className="btn small danger" onClick={() => remove(u)}>Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted">Aucun utilisateur.</p>}
      </div>
    </>
  )
}
