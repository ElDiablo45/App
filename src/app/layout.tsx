import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Eleven Project — Whitelist",
  description: "Inicia sesión con Discord para solicitar tu whitelist en Eleven Project",
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
