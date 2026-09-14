import type { FeaturedMember, NewsItem } from "./types"

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    iconLabel: "✨",
    title: "Eleven 2.0 ya está aquí",
    body: "Después de meses rehaciendo sistemas grandes, la 2.0 ya está disponible. Top 1 de rol en 24 horas.",
    likes: 32,
  },
  {
    id: "2",
    iconLabel: "📅",
    title: "Ya hay fecha: la v2 abre el viernes 24 de julio",
    body: "Viernes 24 de julio a las 21:00, hora española. 65 sistemas nuevos, 21 reescritos de cero y una ciudad que ya no se juega igual.",
    likes: 40,
    unread: true,
  },
  {
    id: "3",
    iconLabel: "❤️",
    title: "Ayuda para Venezuela",
    body: "Esta semana, todo lo recaudado con cada nuevo Partner se destina íntegramente a apoyar a la comunidad venezolana.",
    likes: 32,
    unread: true,
  },
  {
    id: "4",
    iconLabel: "📢",
    title: "Comunicado oficial sobre la fecha de lanzamiento",
    body: "El lanzamiento se retrasa unos días por una suspensión temporal ajena a nuestra voluntad. El proyecto continúa exactamente igual.",
    likes: 33,
    unread: true,
  },
  {
    id: "5",
    iconLabel: "🚀",
    title: "Si la v1 os ha gustado, espérate a ver qué pasará en la v2",
    body: "La V2 está en camino, y más cerca que nunca. Valoramos la V1 como un éxito rotundo y con la V2 aspiramos a ir mucho más lejos.",
    likes: 44,
    unread: true,
  },
  {
    id: "6",
    iconLabel: "✨",
    title: "¡Bienvenido a Eleven!",
    body: "Un proyecto de 11 fundadores que recupera el roleplay de calidad de la época 2019-2020: historias, inmersión y coherencia.",
    likes: 37,
    unread: true,
  },
]

export const MOCK_FEATURED: FeaturedMember = {
  id: "villegas",
  name: "Villegas",
  avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  flags: ["🇦🇷", "🍲", "🍃", "💗"],
  joinedLabel: "Se unió hace 1 día",
  logros: "4 logros desbloqueados",
}
