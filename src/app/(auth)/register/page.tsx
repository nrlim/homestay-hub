'use client'

import { useActionState, useState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { CalendarCheck, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || ''

  return (
    <form action={formAction}>
      {/* Pass the next URL so the action can redirect back after registration */}
      {next && <input type="hidden" name="next" value={next} />}
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending booking notice */}
          {next && (
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
              <CalendarCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Your booking selection has been saved. Register to continue.</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>
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
            {pending ? 'Creating account...' : 'Create account'}
          </Button>
          <div className="text-sm text-center text-zinc-500">
            Already have an account?{' '}
            <Link 
              href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} 
              className="text-zinc-900 underline hover:text-zinc-700"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
