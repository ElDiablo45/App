import type { Loadout } from "./types"

export const TOPICS = [
  "pvp",
  "pve",
  "extracción",
  "principiante",
  "avanzado",
  "equipo",
  "solo",
  "tácticas",
  "sigilo",
  "combate",
  "defensivo",
  "gestión",
]

export const MOCK_LOADOUTS: Loadout[] = [
  {
    id: "mock-1",
    title: "FARMEO XP EARLY GAME - 0 RIESGO",
    description:
      "Ruta segura para subir de nivel tus personajes sin exponerte: qué llevar, por dónde entrar y cuándo extraer.",
    topics: ["principiante", "solo", "eficiencia"],
    authorName: "drpenguin",
    authorAvatarUrl: "https://i.pravatar.cc/64?img=5",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480&h=270&fit=crop",
    ratingAvg: 4.6,
    ratingCount: 128,
    views: 19600,
    createdAt: "2025-11-04T00:00:00.000Z",
  },
  {
    id: "mock-2",
    title: "CHULETA DE ITEMS",
    description:
      "Todos los materiales, dónde salen y qué merece la pena guardar en el alijo.",
    topics: ["consejos", "completo", "gestion"],
    authorName: "bazeso",
    authorAvatarUrl: "https://i.pravatar.cc/64?img=12",
    coverUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=270&fit=crop",
    ratingAvg: 4.6,
    ratingCount: 94,
    views: 19800,
    createdAt: "2025-11-04T00:00:00.000Z",
  },
  {
    id: "mock-3",
    title: "CÁLCULO DE DAÑO DE ESCUDOS",
    description:
      "Cuánto aguanta cada escudo por tier y qué munición llevar contra cada uno.",
    topics: ["pvp", "defensivo", "combate"],
    authorName: "bazeso",
    authorAvatarUrl: "https://i.pravatar.cc/64?img=12",
    coverUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=480&h=270&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 211,
    views: 24300,
    createdAt: "2025-12-04T00:00:00.000Z",
  },
  {
    id: "mock-4",
    title: "PATRULLA NOCTURNA EN PAREJA",
    description:
      "Roles, comunicaciones y equipo mínimo para patrullar el condado de noche.",
    topics: ["equipo", "tacticas", "nocturno"],
    authorName: "Villegas",
    authorAvatarUrl: "https://i.pravatar.cc/64?img=22",
    coverUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=480&h=270&fit=crop",
    ratingAvg: 4.2,
    ratingCount: 37,
    views: 5200,
    createdAt: "2026-09-02T00:00:00.000Z",
  },
]
