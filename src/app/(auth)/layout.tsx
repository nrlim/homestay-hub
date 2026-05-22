import { ReactNode } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Abstract Color Grading / Mesh Gradient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 p-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-transform">
            <div className="bg-primary p-2 rounded-xl shadow-md">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-primary">Homestay Hub</span>
          </Link>
          <p className="text-sm text-zinc-500 max-w-sm">
            Access your account to manage your bookings and find your next perfect getaway.
          </p>
        </div>
        
        {/* The Card wrapper handles the form styling */}
        <div className="shadow-2xl shadow-sky-900/5 rounded-xl">
          {children}
        </div>
      </div>
    </div>
  )
}
