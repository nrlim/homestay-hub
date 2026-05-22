'use server'

import { LoginSchema, RegisterSchema, AuthFormState } from '@/lib/validations/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function login(state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid email or password',
    }
  }

  const { email, password } = validatedFields.data

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { message: 'Invalid credentials' }
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    return { message: 'Invalid credentials' }
  }

  await createSession(user.id, user.role)
  redirect(user.role === 'ADMIN' ? '/admin' : '/')
}

export async function register(state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to register',
    }
  }

  const { name, email, password } = validatedFields.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { message: 'Email already exists' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'USER',
    },
  })

  if (!user) {
    return { message: 'Failed to create user' }
  }

  await createSession(user.id, user.role)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
