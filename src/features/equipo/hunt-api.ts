const API = "https://huntshowdown.wiki.gg/api.php"

/** Timeout por llamada a la wiki: sin esto, un cuelgue de wiki.gg
 *  deja la petición colgada hasta el timeout de conexión de undici (~10s)
 *  y multiplica la espera por cientos de armas en /api/armas. */
const WIKI_TIMEOUT_MS = 8000

function wikiFetch(url: string, revalidate = 86400): Promise<Response> {
  return fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(WIKI_TIMEOUT_MS) } as RequestInit)
}

export interface Arma {
  slug: string
  nombre: string
  imagen: string
  imagenUrl?: string
  imagenThumbUrl?: string
  tamano: number
  precio: number
  municion: string
  stats: Record<string, number>
}

function campo(src: string, nombre: string): string {
  const m = src.match(new RegExp(`\\|\\s*${nombre}\\s*=\\s*([^\\n|}]+)`, "i"))
  return (m?.[1] ?? "").trim()
}

export type CatalogKind = "armas" | "herramientas" | "consumibles"

export interface EquipoItem {
  slug: string
  nombre: string
  imagen: string
  tamano: number | null
  precio: number
  tipo: CatalogKind
  temas: string[]
}

/** Páginas de la wiki que existen pero no se venden en el arsenal (retiradas, tarot, evento). */
const EXCLUIDAS_HERRAMIENTAS = ["Tools/Multitool", "Tools/Electric Lamp"]
const EXCLUIDOS_CONSUMIBLES = [
  "Consumables/15-Proof Vapours",
  "Consumables/25-Proof Vapours",
  "Consumables/50-Proof Vapours",
  "Consumables/Wormseed Shot",
  "Consumables/Bronze Wormseed Shot",
  "Consumables/Silver Wormseed Shot",
  "Consumables/Gold Wormseed Shot",
  "Consumables/Iron Reliquary",
  "Consumables/Silver Reliquary",
  "Consumables/Ivory Reliquary",
]

const CATALOGS: Record<CatalogKind, { category: string; prefix: string; excluida: (titulo: string) => boolean }> = {
  armas: {
    category: "Category:Weapons",
    prefix: "Weapons/",
    excluida: (t) => !(t.startsWith("Weapons/") && t.split("/").length === 2),
  },
  herramientas: {
    category: "Category:Tools",
    prefix: "Tools/",
    excluida: (t) => !t.startsWith("Tools/") || EXCLUIDAS_HERRAMIENTAS.includes(t),
  },
  consumibles: {
    category: "Category:Consumables",
    prefix: "Consumables/",
    excluida: (t) =>
      !t.startsWith("Consumables/") || t.startsWith("Consumables/The ") || EXCLUIDOS_CONSUMIBLES.includes(t),
  },
}

/** Primera palabra de cada [[Category:X]] mapeada a los ids de filtro del editor. */
const TEMAS: Record<string, string> = {
  explosive: "explosivos",
  healing: "curacion",
  fire: "fuego",
  poison: "veneno",
}

function extraerTemas(wikitext: string): string[] {
  const out = new Set<string>()
  for (const m of wikitext.matchAll(/\[\[Category:\s*([^\]|]+)/gi)) {
    const tema = TEMAS[m[1].trim().split(/\s+/)[0].toLowerCase()]
    if (tema) out.add(tema)
  }
  return [...out]
}

export function parseCatalogInfobox(kind: CatalogKind, slug: string, wikitext: string): EquipoItem {
  return {
    slug,
    nombre: campo(wikitext, "Title") || slug.split("/").pop()!,
    imagen: campo(wikitext, "image"),
    tamano: kind === "armas" ? Number(campo(wikitext, "Size")) || 1 : null,
    precio: Number(campo(wikitext, "Price")) || 0,
    tipo: kind,
    temas: extraerTemas(wikitext),
  }
}

export async function getCatalogSlugs(kind: CatalogKind): Promise<string[]> {
  const { category, excluida } = CATALOGS[kind]
  const url = `${API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=500&format=json&formatversion=2`
  const res = await wikiFetch(url)
  if (!res.ok) return []
  const json = (await res.json()) as { query?: { categorymembers?: Array<{ title: string }> } }
  const titles = json.query?.categorymembers?.map((m) => m.title) ?? []
  return titles.filter((t) => !excluida(t))
}

async function getImageUrls(imagen: string): Promise<{ imagenUrl: string; imagenThumbUrl: string }> {
  if (!imagen) return { imagenUrl: "", imagenThumbUrl: "" }
  const imgUrl = `${API}?action=query&titles=${encodeURIComponent(`File:${imagen}`)}&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=500&format=json&formatversion=2`
  const imgRes = await wikiFetch(imgUrl)
  if (!imgRes.ok) return { imagenUrl: "", imagenThumbUrl: "" }
  const imgJson = (await imgRes.json()) as { query?: { pages?: Array<{ imageinfo?: Array<{ url: string; thumburl: string }> }> } }
  const info = imgJson.query?.pages?.[0]?.imageinfo?.[0]
  if (!info) return { imagenUrl: "", imagenThumbUrl: "" }
  return { imagenUrl: info.url, imagenThumbUrl: info.thumburl ?? info.url }
}

export async function getCatalogDetail(
  kind: CatalogKind,
  slug: string,
): Promise<EquipoItem & { imagenUrl: string; imagenThumbUrl: string }> {
  const parseUrl = `${API}?action=parse&page=${encodeURIComponent(slug)}&prop=wikitext&format=json&formatversion=2`
  const parseRes = await wikiFetch(parseUrl)
  if (!parseRes.ok) throw new Error(`wiki parse failed: ${slug}`)
  const parseJson = (await parseRes.json()) as { parse?: { wikitext?: string } }
  const base = parseCatalogInfobox(kind, slug, parseJson.parse?.wikitext ?? "")
  return { ...base, ...(await getImageUrls(base.imagen)) }
}

export interface CatalogItem {
  slug: string
  nombre: string
  imagenUrl: string
  tamano: number | null
  precio: number
  tipo: CatalogKind
  temas: string[]
}

const CONCURRENCY = 6

/** Catálogo listo para la UI: solo items con imagen resoluble. Sin DB, todo live. */
export async function getCatalogo(kind: CatalogKind): Promise<CatalogItem[]> {
  const slugs = await getCatalogSlugs(kind)
  const out: CatalogItem[] = []
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      slugs.slice(i, i + CONCURRENCY).map((slug) => getCatalogDetail(kind, slug).catch(() => null)),
    )
    for (const item of batch) {
      if (!item || !item.imagenUrl) continue
      out.push({
        slug: item.slug,
        nombre: item.nombre,
        imagenUrl: item.imagenThumbUrl || item.imagenUrl,
        tamano: item.tamano,
        precio: item.precio,
        tipo: item.tipo,
        temas: item.temas,
      })
    }
  }
  return out
}

export function parseWeaponInfobox(slug: string, wikitext: string): Arma {
  const nombre = campo(wikitext, "Title") || slug.split("/").pop()!
  const imagen = campo(wikitext, "image")
  const tamano = Number(campo(wikitext, "Size")) || 1
  const precio = Number(campo(wikitext, "Price")) || 0
  const municion = campo(wikitext, "Ammo Type")
  const stats: Record<string, number> = {}
  for (const key of ["Damage", "Drop Range", "Rate of Fire", "Cycle Time", "Muzzle Velocity"]) {
    const raw = campo(wikitext, key)
    if (raw !== "") {
      const n = Number(raw)
      if (!Number.isNaN(n)) stats[key.replace(/\s/g, "")] = n
    }
  }
  return { slug, nombre, imagen, tamano, precio, municion, stats }
}

export async function getWeaponSlugs(): Promise<string[]> {
  const url = `${API}?action=query&list=categorymembers&cmtitle=Category%3AWeapons&cmlimit=500&format=json&formatversion=2`
  const res = await wikiFetch(url)
  if (!res.ok) return []
  const json = (await res.json()) as { query?: { categorymembers?: Array<{ title: string }> } }
  const titles = json.query?.categorymembers?.map((m) => m.title) ?? []
  return titles.filter((t) => t.startsWith("Weapons/") && t.split("/").length === 2)
}

export async function getWeaponDetail(slug: string): Promise<Arma & { imagenUrl: string; imagenThumbUrl: string }> {
  const parseUrl = `${API}?action=parse&page=${encodeURIComponent(slug)}&prop=wikitext&format=json&formatversion=2`
  const parseRes = await wikiFetch(parseUrl)
  if (!parseRes.ok) throw new Error(`wiki parse failed: ${slug}`)
  const parseJson = (await parseRes.json()) as { parse?: { wikitext?: string } }
  const base = parseWeaponInfobox(slug, parseJson.parse?.wikitext ?? "")

  let imagenUrl = ""
  let imagenThumbUrl = ""
  if (base.imagen) {
    const imgUrl = `${API}?action=query&titles=${encodeURIComponent(`File:${base.imagen}`)}&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=500&format=json&formatversion=2`
    const imgRes = await wikiFetch(imgUrl)
    if (imgRes.ok) {
      const imgJson = (await imgRes.json()) as { query?: { pages?: Array<{ imageinfo?: Array<{ url: string; thumburl: string }> }> } }
      const info = imgJson.query?.pages?.[0]?.imageinfo?.[0]
      if (info) {
        imagenUrl = info.url
        imagenThumbUrl = info.thumburl ?? info.url
      }
    }
  }
  return { ...base, imagenUrl, imagenThumbUrl }
}

interface WeaponImage {
  imagenUrl: string
  imagenThumbUrl: string
}

/**
 * Resuelve imágenes en lote: MediaWiki acepta hasta 50 títulos por
 * petición imageinfo. Evita ~100 peticiones individuales (una por arma)
 * que era lo que colgaba /api/armas cuando wiki.gg va lento.
 */
export async function getWeaponImagesBatch(imagenes: string[]): Promise<Map<string, WeaponImage>> {
  const out = new Map<string, WeaponImage>()
  const unnamed = imagenes.filter(Boolean)
  for (let i = 0; i < unnamed.length; i += 50) {
    const chunk = unnamed.slice(i, i + 50)
    const titles = chunk.map((n) => `File:${n}`).join("|")
    const imgUrl = `${API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=500&format=json&formatversion=2`
    try {
      const imgRes = await wikiFetch(imgUrl)
      if (!imgRes.ok) continue
      const imgJson = (await imgRes.json()) as {
        query?: { pages?: Array<{ title?: string; imageinfo?: Array<{ url: string; thumburl: string }> }> }
      }
      for (const page of imgJson.query?.pages ?? []) {
        const info = page.imageinfo?.[0]
        const name = (page.title ?? "").replace(/^File:/i, "")
        if (info && name) out.set(name, { imagenUrl: info.url, imagenThumbUrl: info.thumburl ?? info.url })
      }
    } catch {
      // lote caído: esas armas se filtran luego por falta de imagen
    }
  }
  return out
}

/** Catálogo de armas optimizado: 1 petición de slugs + N parses + ~3 lotes de imágenes. */
export async function getWeaponsCatalog(): Promise<Array<Arma & { imagenUrl: string; imagenThumbUrl: string }>> {
  const slugs = await getWeaponSlugs()
  if (slugs.length === 0) throw new Error("wiki no disponible")
  const bases: Arma[] = []
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      slugs.slice(i, i + CONCURRENCY).map(async (slug) => {
        try {
          const parseUrl = `${API}?action=parse&page=${encodeURIComponent(slug)}&prop=wikitext&format=json&formatversion=2`
          const parseRes = await wikiFetch(parseUrl)
          if (!parseRes.ok) return null
          const parseJson = (await parseRes.json()) as { parse?: { wikitext?: string } }
          return parseWeaponInfobox(slug, parseJson.parse?.wikitext ?? "")
        } catch {
          return null
        }
      }),
    )
    for (const b of batch) if (b) bases.push(b)
  }
  const images = await getWeaponImagesBatch(bases.map((b) => b.imagen))
  return bases.flatMap((b) => {
    const img = b.imagen ? images.get(b.imagen) : undefined
    if (!img) return []
    return [{ ...b, ...img }]
  })
}
