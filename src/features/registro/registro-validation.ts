export interface RegistroInput {
  email: string
  birthDate: string
  nationality?: string
}

export interface RegistroErrors {
  email?: string
  birthDate?: string
  nationality?: string
}

export const COUNTRIES = [
  "España",
  "México",
  "Argentina",
  "Colombia",
  "Chile",
  "Perú",
  "Venezuela",
  "Ecuador",
  "Guatemala",
  "Cuba",
  "Bolivia",
  "República Dominicana",
  "Honduras",
  "Paraguay",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panamá",
  "Uruguay",
  "Puerto Rico",
  "Estados Unidos",
  "Portugal",
  "Francia",
  "Italia",
  "Alemania",
  "Reino Unido",
  "Países Bajos",
  "Bélgica",
  "Suiza",
  "Suecia",
  "Noruega",
  "Polonia",
  "Rumanía",
  "Marruecos",
  "Argelia",
  "Brasil",
  "Canadá",
  "Andorra",
  "Otro",
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function calcAge(birth: Date, now: Date) {
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function validateRegistro(
  input: RegistroInput,
  now: Date = new Date(),
): RegistroErrors {
  const errors: RegistroErrors = {}

  const email = input.email?.trim() ?? ""
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    errors.email = "Introduce un email válido."
  }

  const rawBirth = input.birthDate?.trim() ?? ""
  if (!rawBirth) {
    errors.birthDate = "Selecciona tu fecha de nacimiento."
  } else {
    const birth = new Date(`${rawBirth}T00:00:00`)
    if (Number.isNaN(birth.getTime()) || birth.getFullYear() < 1900) {
      errors.birthDate = "Selecciona tu fecha de nacimiento."
    } else if (birth > now || calcAge(birth, now) < 18) {
      errors.birthDate = "Debes tener al menos 18 años."
    }
  }

  const nationality = input.nationality?.trim() ?? ""
  if (nationality && !COUNTRIES.includes(nationality)) {
    errors.nationality = "Selecciona un país válido."
  }

  return errors
}

export function isRegistroValid(
  input: RegistroInput,
  now?: Date,
): boolean {
  return Object.keys(validateRegistro(input, now)).length === 0
}
