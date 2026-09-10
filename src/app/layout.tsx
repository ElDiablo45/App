import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/features/theme/theme-provider"

export const metadata: Metadata = {
  title: "Hunt: Showdown Hispano",
  description: "Inicia sesión con Discord para poder disfrutar de más ventajas y conocer más de Hunt Hispano",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/favicon.png", type: "image/png", sizes: "any" }],
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
