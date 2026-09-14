import { NextResponse } from "next/server"
import { getCatalogo, type CatalogKind } from "@/features/equipo/hunt-api"

export const revalidate = 86400

const TIPOS: CatalogKind[] = ["armas", "herramientas", "consumibles"]

export async function GET(req: Request) {
  const tipo = new URL(req.url).searchParams.get("tipo")
  if (!tipo || !(TIPOS as string[]).includes(tipo)) {
    return NextResponse.json({ error: "tipo inválido (armas|herramientas|consumibles)" }, { status: 400 })
  }
  try {
    return NextResponse.json(await getCatalogo(tipo as CatalogKind))
  } catch {
    return NextResponse.json({ error: "wiki no disponible" }, { status: 502 })
  }
}
