import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ensureUserDoc } from './users'
import type { UserProfile } from '../types'

interface Ctx {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthCtx = createContext<Ctx>(null as unknown as Ctx)
export const useAuth = () => useContext(AuthCtx)

/** Évite que le fallback de création ne double un flux d'inscription en cours. */
export const registration = { inProgress: false }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile: (() => void) | undefined
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      unsubProfile?.()
      setUser(u)
      if (!u) {
        setProfile(null)
        setLoading(false)
        return
      }
      setLoading(true)
      unsubProfile = onSnapshot(
        doc(db, 'users', u.uid),
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile)
            setLoading(false)
          } else if (!registration.inProgress) {
            ensureUserDoc(u).catch(() => setLoading(false))
          }
        },
        () => setLoading(false),
      )
    })
    return () => {
      unsubAuth()
      unsubProfile?.()
    }
  }, [])

  const value: Ctx = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    logout: () => signOut(auth),
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
