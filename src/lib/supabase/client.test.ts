import { beforeEach, describe, expect, it, vi } from "vitest"
import { createClient } from "./client"

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://xyz.supabase.co")
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key")
})

describe("supabase browser client", () => {
  it("creates a client without throwing", () => {
    expect(() => createClient()).not.toThrow()
  })
})
