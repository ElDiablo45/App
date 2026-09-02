"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const saved = localStorage.getItem("hunt-theme") as Theme | null
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
    const initial = saved ?? (prefersLight ? "light" : "dark")
    setThemeState(initial)
    document.documentElement.setAttribute("data-theme", initial)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem("hunt-theme", t)
    document.documentElement.setAttribute("data-theme", t)
  }

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark")

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider")
  return ctx
}
