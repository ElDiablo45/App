import { describe, expect, it, vi, afterEach } from "vitest"
import { parseWeaponInfobox, getWeaponSlugs, getWeaponDetail } from "./hunt-api"

const CENTENNIAL_WIKITEXT = `{{Infobox Weapon
|Title=Centennial
|image=Weapon Centennial.png
|Rarity=
|Price=157
|Size=4
|Update=1.5
|Ammo Type=Medium
|Loaded=9+1
|Extra=12
|Damage=123
|Drop Range=140
|Rate of Fire=23
|Cycle Time=1.6
|Spread=25
|Sway=77
|Vertical Recoil=11
|Reload Speed=15.5
|Muzzle Velocity=600
|Melee Damage=27
|Heavy Melee Damage=54
|Stamina Consumption=25
}}`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("parseWeaponInfobox", () => {
  it("extrae nombre, imagen, tamaño, precio y stats del infobox", () => {
    const arma = parseWeaponInfobox("Weapons/Centennial", CENTENNIAL_WIKITEXT)
    expect(arma).toEqual({
      slug: "Weapons/Centennial",
      nombre: "Centennial",
      imagen: "Weapon Centennial.png",
      tamano: 4,
      precio: 157,
      municion: "Medium",
      stats: expect.objectContaining({ Damage: 123, MuzzleVelocity: 600 }),
    })
  })
})

describe("getWeaponSlugs", () => {
  it("devuelve solo armas base (excluye variantes con /)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        query: {
          categorymembers: [
            { title: "Weapons/Centennial" },
            { title: "Weapons/Centennial/Shorty" },
            { title: "Weapons/Bornheim No. 3" },
          ],
        },
      }),
    } as Response)))
    const slugs = await getWeaponSlugs()
    expect(slugs).toEqual(["Weapons/Centennial", "Weapons/Bornheim No. 3"])
  })
})

describe("getWeaponDetail", () => {
  it("combina wikitext + imageinfo en un Arma con URLs de la wiki", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("action=parse")) {
        return { ok: true, json: async () => ({ parse: { wikitext: CENTENNIAL_WIKITEXT } }) } as Response
      }
      return {
        ok: true,
        json: async () => ({
          query: {
            pages: [{
              imageinfo: [{
                url: "https://huntshowdown.wiki.gg/images/Weapon_Centennial.png?2a33c1",
                thumburl: "https://huntshowdown.wiki.gg/images/thumb/Weapon_Centennial.png/500px-Weapon_Centennial.png?2a33c1",
              }],
            }],
          },
        }),
      } as Response
    }))
    const arma = await getWeaponDetail("Weapons/Centennial")
    expect(arma.nombre).toBe("Centennial")
    expect(arma.imagenUrl).toContain("huntshowdown.wiki.gg/images/")
    expect(arma.precio).toBe(157)
    expect(arma.tamano).toBe(4)
  })
})
