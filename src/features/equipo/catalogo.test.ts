import { describe, expect, it, vi, afterEach } from "vitest"
import { getCatalogDetail, getCatalogo, getCatalogSlugs, parseCatalogInfobox } from "./hunt-api"

const CHOKE_WIKITEXT = `{{Infobox Tool
|Title=Choke Bombs
|image=Tool Choke Bombs.png
|Price=25
|Quantity=2
}}
[[Category: Throwable Tools]]`

const DYNAMITE_WIKITEXT = `{{Infobox Consumable
|Title=Dynamite Stick
|image= Consumable Dynamite Stick.png
|Price=18
}}
[[Category: Throwable Consumables]]
[[Category: Explosive Consumbles]]`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("parseCatalogInfobox", () => {
  it("extrae herramienta con nombre, imagen y precio (sin temas ni tamaño)", () => {
    expect(parseCatalogInfobox("herramientas", "Tools/Choke Bombs", CHOKE_WIKITEXT)).toEqual({
      slug: "Tools/Choke Bombs",
      nombre: "Choke Bombs",
      imagen: "Tool Choke Bombs.png",
      tamano: null,
      precio: 25,
      tipo: "herramientas",
      temas: [],
    })
  })

  it("mapea categorías wiki a temas de filtro (explosivos)", () => {
    const item = parseCatalogInfobox("consumibles", "Consumables/Dynamite Stick", DYNAMITE_WIKITEXT)
    expect(item.nombre).toBe("Dynamite Stick")
    expect(item.precio).toBe(18)
    expect(item.temas).toContain("explosivos")
    expect(item.tipo).toBe("consumibles")
  })
})

describe("getCatalogSlugs", () => {
  it("excluye herramientas retiradas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        query: { categorymembers: [{ title: "Tools/Choke Bombs" }, { title: "Tools/Multitool" }, { title: "Tools/Electric Lamp" }] },
      }),
    } as Response)))
    expect(await getCatalogSlugs("herramientas")).toEqual(["Tools/Choke Bombs"])
  })

  it("excluye tarot y evento de consumibles", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        query: {
          categorymembers: [
            { title: "Consumables/Dynamite Stick" },
            { title: "Consumables/The Fool" },
            { title: "Consumables/50-Proof Vapours" },
            { title: "Consumables/Wormseed Shot" },
          ],
        },
      }),
    } as Response)))
    expect(await getCatalogSlugs("consumibles")).toEqual(["Consumables/Dynamite Stick"])
  })
})

describe("getCatalogo", () => {
  it("devuelve items listos para la UI (sin los que no tienen imagen)", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("list=categorymembers")) {
        return { ok: true, json: async () => ({ query: { categorymembers: [{ title: "Tools/Choke Bombs" }, { title: "Tools/Decoys" }] } }) } as Response
      }
      if (url.includes("action=parse")) {
        const wikitext = url.includes("Choke") ? CHOKE_WIKITEXT : "{{Infobox Tool\n|Title=Decoys\n|Price=12\n}}"
        return { ok: true, json: async () => ({ parse: { wikitext } }) } as Response
      }
      const thumb = url.includes("Choke") ? "https://huntshowdown.wiki.gg/images/thumb/choke.png" : null
      return {
        ok: true,
        json: async () => ({ query: { pages: [{ imageinfo: thumb ? [{ url: "https://huntshowdown.wiki.gg/images/choke.png", thumburl: thumb }] : [] }] } }),
      } as Response
    }))
    const items = await getCatalogo("herramientas")
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual(expect.objectContaining({ nombre: "Choke Bombs", precio: 25, tipo: "herramientas" }))
    expect(items[0].imagenUrl).toContain("huntshowdown.wiki.gg")
  })
})

describe("getCatalogDetail", () => {
  it("combina wikitext + imageinfo en un item con URLs de la wiki", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("action=parse")) {
        return { ok: true, json: async () => ({ parse: { wikitext: CHOKE_WIKITEXT } }) } as Response
      }
      return {
        ok: true,
        json: async () => ({
          query: { pages: [{ imageinfo: [{ url: "https://huntshowdown.wiki.gg/images/x.png", thumburl: "https://huntshowdown.wiki.gg/images/thumb/x.png" }] }] },
        }),
      } as Response
    }))
    const item = await getCatalogDetail("herramientas", "Tools/Choke Bombs")
    expect(item.nombre).toBe("Choke Bombs")
    expect(item.imagenUrl).toContain("huntshowdown.wiki.gg")
    expect(item.precio).toBe(25)
  })
})
