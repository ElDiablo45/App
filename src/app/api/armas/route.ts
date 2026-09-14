import { NextResponse } from "next/server"
import { getWeaponsCatalog } from "@/features/equipo/hunt-api"

export const revalidate = 86400

export async function GET() {
  try {
    const catalog = await getWeaponsCatalog()
    const out = catalog.map((arma) => ({
      slug: arma.slug,
      nombre: arma.nombre,
      imagenUrl: arma.imagenThumbUrl || arma.imagenUrl,
      tamano: arma.tamano,
      precio: arma.precio,
      municion: arma.municion,
    }))
    if (out.length === 0) return NextResponse.json({ error: "wiki no disponible" }, { status: 502 })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: "wiki no disponible" }, { status: 502 })
  }
}
