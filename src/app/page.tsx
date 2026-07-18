import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"

interface HomeProps {
  searchParams: Promise<{ error?: string | string[] }>
}

export default async function Home({ searchParams }: HomeProps) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ])
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error

  return (
    <main className="login-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <LoginPanel authenticated={Boolean(session)} errorCode={errorCode} />
    </main>
  )
}
