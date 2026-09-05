import { Award, BadgeCheck, Video, Wrench, type LucideIcon } from "lucide-react"

export interface RoleMedalDef {
  icon?: LucideIcon
  color: string
  title: string
  description: string
}

export interface RoleMedal extends RoleMedalDef {
  roleId: string
  roleName: string
  automatic: boolean
}

export interface RoleRef {
  id: string
  name: string
  color: string
}

/**
 * Mapeo manual rol de Discord -> medalla (por ID, estable aunque renombres el rol).
 * Pásame más entradas como: ID del rol, icono lucide, título y descripción.
 */
export const VERIFIED_ROLE_ID = "1545800486215487599"

export const ROLE_MEDALS: Record<string, RoleMedalDef> = {
  "1352786195482017873": {
    icon: Wrench,
    color: "#0080FF",
    title: "Staff",
    description: "Miembro del staff de Hunt Hispano.",
  },
  "1352786191593767022": {
    icon: Video,
    color: "#c4b5fd",
    title: "Streamer",
    description: "Crea contenido de Hunt Hispano en directo.",
  },
  "1518581618296492052": {
    icon: Award,
    color: "#d8960e",
    title: "Prestigio 100",
    description: "Alcanzó el prestigio máximo.",
  },
  [VERIFIED_ROLE_ID]: {
    icon: BadgeCheck,
    color: "#22c55e",
    title: "Verificado",
    description: "Aceptaste los términos y condiciones de Hunt Hispano.",
  },
}

export function medalsForRoles(roles: RoleRef[]): RoleMedal[] {
  const medals: RoleMedal[] = []
  for (const r of roles) {
    const def = ROLE_MEDALS[r.id]
    if (!def) continue
    medals.push({
      roleId: r.id,
      roleName: r.name,
      icon: def.icon,
      color: def.color,
      title: def.title,
      description: def.description,
      automatic: false,
    })
  }
  return medals
}
