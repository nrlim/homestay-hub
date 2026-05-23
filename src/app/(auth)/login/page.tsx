'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { CalendarCheck, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || ''

  return (
    <form action={formAction}>
      {/* Pass the next URL so the action can redirect back after login */}
      {next && <input type="hidden" name="next" value={next} />}
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending booking notice */}
          {next && (
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
              <CalendarCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Your booking selection has been saved. Log in to continue.</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
          </Button>
          <div className="text-sm text-center text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link 
              href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} 
              className="text-zinc-900 underline hover:text-zinc-700"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
