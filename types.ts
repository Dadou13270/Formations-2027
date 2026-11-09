export type Role = 'agent' | 'admin'
export type Statut = 'en_attente' | 'non_retenu' | 'retenu'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  nom: string
  prenom: string
  matricule?: string
  role: Role
  createdAt?: number
}

export interface Inscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  formationCode: string
  dateDebut: string // YYYY-MM-DD
  dateFin: string
  lieu: string
  motivations: string
  statut: Statut
  inscriptionO2: boolean
  convocationEnvoyee: boolean
  statutDate?: string // YYYY-MM-DD
  o2Date?: string
  convocationDate?: string
  annulee?: boolean // annulée à la demande de l'agent
  annuleeDate?: string
  createdAt: number
  updatedAt: number
}

export const STATUT_LABEL: Record<Statut, string> = {
  en_attente: 'En attente',
  non_retenu: 'Non retenu',
  retenu: 'Retenu',
}

export const FORMATION_REGEX = /^FOR-27[-A-Z0-9]+$/

export const fmtDate = (iso: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR') : ''

export const fmtDateTime = (ts?: number) =>
  ts ? new Date(ts).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : ''

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
