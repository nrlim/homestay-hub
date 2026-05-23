'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MapPin, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NavbarClient({ user }: { user: any }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const isTransparent = isHome && !isScrolled

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isTransparent 
        ? "bg-transparent border-transparent" 
        : "bg-white/90 backdrop-blur-md border-b border-zinc-200"
    )}>
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-md shadow-sm transition-colors",
              isTransparent ? "bg-white" : "bg-primary"
            )}>
              <MapPin className={cn(
                "h-5 w-5",
                isTransparent ? "text-primary" : "text-primary-foreground"
              )} />
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight hidden md:inline-block transition-colors",
              isTransparent ? "text-white" : "text-primary"
            )}>
              Homestay Hub
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/homestays" className={cn(
              "text-sm font-medium transition-colors",
              isTransparent ? "text-white hover:text-sky-200" : "text-zinc-600 hover:text-zinc-900"
            )}>
              Find Stays
            </Link>
            <Link href="/simulator" className={cn(
              "text-sm font-medium transition-colors",
              isTransparent ? "text-white hover:text-sky-200" : "text-zinc-600 hover:text-zinc-900"
            )}>
              Simulator
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={cn(
                "text-sm font-medium transition-colors",
                isTransparent ? "text-white hover:text-sky-200" : "text-zinc-600 hover:text-zinc-900"
              )}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'relative h-8 w-8 rounded-full' })}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="w-full">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link href="/bookings" className="w-full">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form action={logout}>
                    <button type="submit" className="w-full text-left">Log out</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/login" className={buttonVariants({ variant: isTransparent ? 'outline' : 'ghost', className: isTransparent ? 'bg-transparent text-white border-white hover:bg-white/20 hover:text-white' : '' })}>Log in</Link>
              <Link href="/register" className={buttonVariants({ variant: isTransparent ? 'secondary' : 'default' })}>Sign up</Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden">
              <span className="sr-only">Toggle Menu</span>
              <Menu className={cn("h-6 w-6", isTransparent ? "text-white" : "text-zinc-900")} />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-4">
                <Link href="/homestays" className="text-lg font-medium">Find Stays</Link>
                <Link href="/simulator" className="text-lg font-medium">Simulator</Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-lg font-medium">Dashboard</Link>
                )}
                {!user && (
                  <>
                    <Link href="/login" className="text-lg font-medium">Log in</Link>
                    <Link href="/register" className="text-lg font-medium">Sign up</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
