import Link from 'next/link'
import { LayoutDashboard, Home, CreditCard, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-50">
      {/* Abstract Color Grading / Mesh Gradient Background */}
      <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-200/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white/70 backdrop-blur-md md:flex relative z-10">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-all hover:text-zinc-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/admin/homestays"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-all hover:text-zinc-900"
            >
              <Home className="h-4 w-4" />
              Homestays
            </Link>
            <Link
              href="/admin/transactions"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-all hover:text-zinc-900"
            >
              <CreditCard className="h-4 w-4" />
              Transactions
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 relative z-10">
        {children}
      </main>
    </div>
  )
}
