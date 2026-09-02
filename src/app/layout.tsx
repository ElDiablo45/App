import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/features/theme/theme-provider"

export const metadata: Metadata = {
  title: "Hunt Hispano — Whitelist",
  description: "Inicia sesión con Discord para solicitar tu whitelist en Hunt Hispano",
  icons: {
    icon: [
      { url: "/hunt/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "512x512" },
      { url: "/hunt/icon.svg", type: "image/svg+xml" },
    ],
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
