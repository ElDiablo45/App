export const PAIS_A_ISO: Record<string, string | null> = {
  España: "ES",
  México: "MX",
  Argentina: "AR",
  Colombia: "CO",
  Chile: "CL",
  Perú: "PE",
  Venezuela: "VE",
  Ecuador: "EC",
  Guatemala: "GT",
  Cuba: "CU",
  Bolivia: "BO",
  "República Dominicana": "DO",
  Honduras: "HN",
  Paraguay: "PY",
  "El Salvador": "SV",
  Nicaragua: "NI",
  "Costa Rica": "CR",
  Panamá: "PA",
  Uruguay: "UY",
  "Puerto Rico": "PR",
  "Estados Unidos": "US",
  Portugal: "PT",
  Francia: "FR",
  Italia: "IT",
  Alemania: "DE",
  "Reino Unido": "GB",
  "Países Bajos": "NL",
  Bélgica: "BE",
  Suiza: "CH",
  Suecia: "SE",
  Noruega: "NO",
  Polonia: "PL",
  Rumanía: "RO",
  Marruecos: "MA",
  Argelia: "DZ",
  Brasil: "BR",
  Canadá: "CA",
  Andorra: "AD",
  Otro: null,
}

export function isoABandera(iso: string): string {
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  )
}

export function banderaParaPais(nombre: string): string | null {
  const iso = PAIS_A_ISO[nombre?.trim() ?? ""]
  return iso ? isoABandera(iso) : null
}
