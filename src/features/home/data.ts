import type { FeaturedMember, LiveChannel, NewMember, NewsItem } from "./types"

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

export const MOCK_LIVE: LiveChannel[] = [
  {
    id: "1",
    username: "alexisrb_25",
    thumbUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop",
  },
  {
    id: "2",
    username: "momonkunn",
    thumbUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
  },
  {
    id: "3",
    username: "DiNo",
    thumbUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=225&fit=crop",
    offline: true,
  },
  {
    id: "4",
    username: "Urdas_151",
    thumbUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=225&fit=crop",
    offline: true,
  },
]

export const MOCK_NEW: NewMember[] = [
  { id: "1", name: "Jack-K...", avatarUrl: "https://i.pravatar.cc/100?img=10", sinceLabel: "hoy", flags: ["🇨🇴", "🇦🇷", "🍃"] },
  { id: "2", name: "Dinbo", avatarUrl: "https://i.pravatar.cc/100?img=12", sinceLabel: "hoy", flags: ["🇪🇸", "🇦🇷", "🍃"] },
  { id: "3", name: "! Dolly ...", avatarUrl: "https://i.pravatar.cc/100?img=15", sinceLabel: "hoy", flags: ["🇪🇸", "💗", "🍃"] },
  { id: "4", name: "Effecto", avatarUrl: "https://i.pravatar.cc/100?img=8", sinceLabel: "hoy", flags: ["🍃", "💗"] },
  { id: "5", name: "Lily", avatarUrl: "https://i.pravatar.cc/100?img=16", sinceLabel: "1 día", flags: ["🇪🇸", "🇪🇸", "🍃"] },
  { id: "6", name: "Mr.Fath...", avatarUrl: "https://i.pravatar.cc/100?img=22", sinceLabel: "1 día", flags: ["🇪🇸", "🇦🇷", "🍃"] },
  { id: "7", name: "*Kati ズ", avatarUrl: "https://i.pravatar.cc/100?img=18", sinceLabel: "1 día", flags: ["🇪🇸", "🍃", "🍃"] },
  { id: "8", name: "Villegas", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face", sinceLabel: "1 día", flags: ["🇦🇷", "🍃", "🍃"] },
  { id: "9", name: "Arthurs...", avatarUrl: "https://i.pravatar.cc/100?img=33", sinceLabel: "1 día", flags: ["🇲🇽", "🍃", "💗"] },
  { id: "10", name: "xZcPx", avatarUrl: "https://i.pravatar.cc/100?img=20", sinceLabel: "1 día", flags: ["🇦🇷", "🍲", "🍃"] },
  { id: "11", name: "Loloo", avatarUrl: "https://i.pravatar.cc/100?img=25", sinceLabel: "1 día", flags: ["🇦🇷", "🍃", "🍃"] },
  { id: "12", name: "Sirvicol", avatarUrl: "https://i.pravatar.cc/100?img=27", sinceLabel: "2 días", flags: ["🍃", "💗"] },
  { id: "13", name: "rayan_g...", avatarUrl: "https://i.pravatar.cc/100?img=29", sinceLabel: "2 días", flags: ["🇪🇸", "🇵🇹", "🍃"] },
  { id: "14", name: "parxeao", avatarUrl: "https://i.pravatar.cc/100?img=31", sinceLabel: "2 días", flags: ["🇪🇸", "🇪🇸", "🍃"] },
  { id: "15", name: "eduu.vc", avatarUrl: "https://i.pravatar.cc/100?img=32", sinceLabel: "2 días", flags: ["🇪🇸", "🇵🇹", "🍃"] },
  { id: "16", name: "GaTo", avatarUrl: "https://i.pravatar.cc/100?img=35", sinceLabel: "3 días", flags: ["🇨🇴", "🍃", "💗"] },
  { id: "17", name: "Yokoume", avatarUrl: "https://i.pravatar.cc/100?img=36", sinceLabel: "3 días", flags: ["🇪🇸", "🇵🇹", "🍃"] },
  { id: "18", name: "Gabela", avatarUrl: "https://i.pravatar.cc/100?img=37", sinceLabel: "3 días", flags: ["🇪🇸", "🇭🇷", "🍃"] },
  { id: "19", name: "_nxxz_", avatarUrl: "https://i.pravatar.cc/100?img=38", sinceLabel: "3 días", flags: ["🇨🇴", "🍃", "💗"] },
  { id: "20", name: "Valkyrie", avatarUrl: "https://i.pravatar.cc/100?img=39", sinceLabel: "3 días", flags: ["🇪🇸", "🇪🇸", "🍃"] },
]
