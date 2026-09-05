export interface DatedMedal {
  title: string
  verified: boolean
  at: string | null
}

export interface ActivityInput {
  guildJoinedAt?: string | null
  registroAt?: string | null
  verifiedAt?: string | null
  medals: DatedMedal[]
}

export interface ActivityEvent {
  id: string
  label: string
  at: string | null
}

export const MAX_ACTIVITY_EVENTS = 6

/**
 * Cronología del perfil: recientes primero, tope de MAX_ACTIVITY_EVENTS
 * (al llegar, cae la más antigua y entra la más reciente). Sin fecha van
 * al final. Los eventos de whitelist/historia/loadouts llegan en fase 2.
 */
export function buildActivity(input: ActivityInput): ActivityEvent[] {
  const dated: ActivityEvent[] = []
  const undated: ActivityEvent[] = []

  const push = (id: string, label: string, at: string | null | undefined) => {
    if (at) dated.push({ id, label, at })
    else undated.push({ id, label, at: null })
  }

  const verifiedMedal = input.medals.find((m) => m.verified)
  if (verifiedMedal) {
    push("badge-verified", `Obtuvo la insignia "${verifiedMedal.title}"`, verifiedMedal.at ?? input.verifiedAt)
  }
  if (input.verifiedAt) {
    push("verified", "Verificó su cuenta", input.verifiedAt)
  }
  if (input.registroAt) {
    push("account", "Creó su cuenta en Hunt Hispano", input.registroAt)
  }
  for (const medal of input.medals) {
    if (medal.verified) continue
    push(`badge-${medal.title}`, `Obtuvo la insignia "${medal.title}"`, medal.at ?? input.guildJoinedAt)
  }
  if (input.guildJoinedAt) {
    push("joined", "Se unió al Discord", input.guildJoinedAt)
  }

  dated.sort((a, b) => +new Date(b.at!) - +new Date(a.at!))
  return [...dated, ...undated].slice(0, MAX_ACTIVITY_EVENTS)
}
