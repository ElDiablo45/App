/**
 * Roles de prestigio del Discord de Hunt Hispano (ID -> nivel).
 * IDs reales leídas del servidor. Si se crea un nuevo tramo, añadir aquí.
 */
export const PRESTIGE_LEVELS: Record<string, number> = {
  "1518579400667303956": 1,
  "1518579399132450877": 5,
  "1518579397454725223": 10,
  "1518579396112420994": 15,
  "1518579393654427688": 20,
  "1518579391720853696": 30,
  "1518580938769043627": 40,
  "1518580942883651634": 50,
  "1518580943424720976": 60,
  "1518580935266664711": 70,
  "1518579380417335417": 80,
  "1518581065101348884": 90,
  "1518581618296492052": 100,
}

/**
 * Devuelve el nivel de prestigio más alto entre los roles del miembro,
 * o undefined si no tiene ninguno.
 */
export function prestigeForRoles(roles: Array<{ id: string }>): number | undefined {
  let best: number | undefined
  for (const r of roles) {
    const level = PRESTIGE_LEVELS[r.id]
    if (typeof level === "number" && (best === undefined || level > best)) {
      best = level
    }
  }
  return best
}
