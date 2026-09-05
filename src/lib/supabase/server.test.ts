// Tests run server-side so the server-only guard is a no-op in tests.
vi.mock("server-only", () => ({}))
import { afterEach, describe, expect, it, vi } from "vitest"
import { getServiceSupabase } from "./server"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getServiceSupabase", () => {
  it("returns null when env is missing (fail open to mocks)", () => {
    vi.stubEnv("SUPABASE_URL", "")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "")
    expect(getServiceSupabase()).toBeNull()
  })

  it("returns a client when env is present", () => {
    vi.stubEnv("SUPABASE_URL", "https://xyz.supabase.co")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key")
    const client = getServiceSupabase()
    expect(client).not.toBeNull()
  })
})
