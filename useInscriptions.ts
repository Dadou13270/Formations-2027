import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from './firebase'
import type { Inscription } from '../types'

const sortRecent = (a: Inscription, b: Inscription) => b.createdAt - a.createdAt

/** Temps réel : toute mise à jour admin apparaît immédiatement côté agent. */
export function useInscriptions(userId?: string) {
  const [items, setItems] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const base = collection(db, 'inscriptions')
    const q = userId ? query(base, where('userId', '==', userId)) : base
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ ...(d.data() as Inscription), id: d.id })).sort(sortRecent))
        setLoading(false)
      },
      (e) => {
        setError(e.message)
        setLoading(false)
      },
    )
  }, [userId])

  return { items, loading, error }
}
