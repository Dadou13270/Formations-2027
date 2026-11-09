import { STATUT_LABEL, type Statut } from '../types'

export default function StatutBadge({ statut }: { statut: Statut }) {
  return <span className={`badge ${statut}`}>{STATUT_LABEL[statut]}</span>
}
