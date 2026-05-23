/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { requireAuth } from '@/lib/auth'
import { BookingSchema, BookingFormState } from '@/lib/validations/booking'
import { differenceInDays } from 'date-fns'
import { sendBookingConfirmationEmail } from '@/lib/nodemailer'

export async function createBooking(state: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const session = await getSession()

  if (!session) {
    // Return redirect URL to the client so it can save booking state before redirecting
    const homestayId = String(formData.get('homestayId') || '')
    const redirectTo = homestayId ? `/login?next=/homestays/${homestayId}` : '/login'
    return { message: 'redirect_to_login', redirectTo }
  }

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

export async function markTransactionAsUnpaid(transactionId: string) {
  const session = await requireAuth()
  
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId, userId: session.userId }
  })
  
  if (tx && tx.status === 'PENDING') {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'UNPAID' }
    })
  }
}

export async function updateTransactionStatus(transactionId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status }
  })

  // Send confirmation email when booking is confirmed
  if (status === 'CONFIRMED') {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: { select: { name: true, email: true } },
          bookingItems: {
            include: {
              room: {
                include: { homestay: true }
              }
            }
          }
        }
      })

      if (transaction && transaction.user.email) {
        const homestay = transaction.bookingItems[0]?.room.homestay
        await sendBookingConfirmationEmail({
          to: transaction.user.email,
          userName: transaction.user.name,
          homestayName: homestay?.name || 'Homestay',
          homestayAddress: homestay?.address || '',
          checkIn: transaction.checkIn,
          checkOut: transaction.checkOut,
          rooms: transaction.bookingItems.map(item => ({
            roomNumber: item.room.roomNumber,
            type: item.room.type,
            priceAtBooking: item.priceAtBooking,
          })),
          totalPrice: transaction.totalPrice,
          transactionId: transaction.id,
        })
      }
    } catch (emailError) {
      // Don't fail the status update if email fails
      console.error('Failed to send confirmation email:', emailError)
    }
  }
}

export async function verifyPaymentSimulator(vaNumber: string) {
  // Find a pending or unpaid transaction with the matching VA number
  const pendingTxs = await prisma.transaction.findMany({
    where: { 
      status: { in: ['PENDING', 'UNPAID'] } 
    }
  })
  
  // Use a dynamic import or directly import utils if needed, but since we are in a server action,
  // we can just implement the hash here or import from utils. Let's import from utils.
  const { generateVaNumber } = await import('@/lib/utils');
  
  const tx = pendingTxs.find(t => generateVaNumber(t.id) === vaNumber);
  
  if (!tx) {
    return { success: false, message: 'Virtual Account not found or already paid' };
  }
  
  // Update status directly to COMPLETED since we skip CONFIRMED now
  
  await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: 'COMPLETED' }
  });

  // Trigger email
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: tx.id },
      include: {
        user: { select: { name: true, email: true } },
        bookingItems: { include: { room: { include: { homestay: true } } } }
      }
    })

    if (transaction && transaction.user.email) {
      const homestay = transaction.bookingItems[0]?.room.homestay
      await sendBookingConfirmationEmail({
        to: transaction.user.email,
        userName: transaction.user.name,
        homestayName: homestay?.name || 'Homestay',
        homestayAddress: homestay?.address || '',
        checkIn: transaction.checkIn,
        checkOut: transaction.checkOut,
        rooms: transaction.bookingItems.map(item => ({
          roomNumber: item.room.roomNumber,
          type: item.room.type,
          priceAtBooking: item.priceAtBooking,
        })),
        totalPrice: transaction.totalPrice,
        transactionId: transaction.id,
      })
    }
  } catch (emailError) {
    console.error('Failed to send confirmation email from simulator:', emailError)
  }
  
  return { success: true, message: 'Payment successfully verified!' };
}
