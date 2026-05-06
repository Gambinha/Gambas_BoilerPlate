import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Olá, {user?.name}</h1>
      <p className="text-muted-foreground">{user?.email}</p>
      <button
        onClick={logout}
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors"
      >
        Sair
      </button>
    </div>
  )
}
