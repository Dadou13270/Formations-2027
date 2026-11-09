const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
  'auth/weak-password': 'Mot de passe trop faible (6 caractères minimum).',
  'auth/popup-closed-by-user': 'Connexion Google annulée.',
  'auth/cancelled-popup-request': 'Connexion Google annulée.',
  'auth/popup-blocked': 'Pop-up bloquée par le navigateur : autorisez-la.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
  'auth/network-request-failed': 'Erreur réseau.',
  'permission-denied': 'Action non autorisée.',
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || ''
  const key = code.replace('firestore/', '')
  return MESSAGES[code] || MESSAGES[key] || (err as Error)?.message || 'Une erreur est survenue.'
}
