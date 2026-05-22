/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { BookingSchema, BookingFormState } from '@/lib/validations/booking'
import { redirect } from 'next/navigation'
import { differenceInDays } from 'date-fns'

export async function createBooking(state: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const session = await requireAuth()

  const roomIds = formData.getAll('roomIds').map(id => String(id))

  const validatedFields = BookingSchema.safeParse({
    checkIn: formData.get('checkIn'),
    checkOut: formData.get('checkOut'),
    roomIds,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid booking data',
    }
  }

  const { checkIn, checkOut, roomIds: validRoomIds } = validatedFields.data
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (checkInDate >= checkOutDate) {
    return { message: 'Check-out date must be after check-in date' }
  }

  const nights = differenceInDays(checkOutDate, checkInDate)
  if (nights < 1) {
    return { message: 'Minimum booking is 1 night' }
  }

  try {
    const transactionIdResult = await prisma.$transaction(async (tx) => {
      // 1. Re-validate room availability
      const rooms = await tx.room.findMany({
        where: { id: { in: validRoomIds }, isAvailable: true }
      })

      if (rooms.length !== validRoomIds.length) {
        throw new Error('One or more selected rooms are no longer available')
      }
      
      // 2. Calculate total price
      const totalPrice = rooms.reduce((sum, r) => sum + (r.pricePerNight * nights), 0)
      
      // 3. Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: session.userId,
          totalPrice,
          status: 'PENDING',
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bookingItems: {
            create: rooms.map(r => ({
              roomId: r.id,
              priceAtBooking: r.pricePerNight * nights,
            }))
          }
        }
      })
      
      // 4. Mark rooms as unavailable
      await tx.room.updateMany({
        where: { id: { in: validRoomIds } },
        data: { isAvailable: false }
      })
      
      return { id: transaction.id, totalPrice }
    })

    if (transactionIdResult) {
      return { 
        message: 'success', 
        transactionId: transactionIdResult.id,
        totalPrice: transactionIdResult.totalPrice
      }
    }
  } catch (error: any) {
    return { message: error.message || 'Failed to create booking' }
  }
  
  return { message: 'Failed to create booking' }
}

export async function checkTransactionStatus(transactionId: string) {
  const session = await requireAuth()
  
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId, userId: session.userId },
    select: { status: true }
  })
  
  return tx?.status || 'PENDING'
}

export async function updateTransactionStatus(transactionId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status }
  })
}
