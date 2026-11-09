import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { UserProfile } from '../types'

/** Crée le profil agent s'il n'existe pas (rôle toujours "agent" à la création). */
export async function ensureUserDoc(
  user: User,
  extra: Partial<Pick<UserProfile, 'nom' | 'prenom' | 'matricule'>> = {},
) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return
  const parts = (user.displayName || '').trim().split(/\s+/)
  const prenom = extra.prenom ?? parts[0] ?? ''
  const nom = extra.nom ?? parts.slice(1).join(' ')
  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: number } = {
    uid: user.uid,
    email: user.email || '',
    displayName: `${prenom} ${nom}`.trim() || user.email || '',
    nom,
    prenom,
    matricule: extra.matricule ?? '',
    role: 'agent',
    createdAt: Date.now(),
  }
  await setDoc(ref, profile)
}
