import * as z from 'zod'

export const BookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  roomIds: z.array(z.string()).min(1, 'Please select at least one room'),
})

export type BookingFormState =
  | {
      errors?: {
        checkIn?: string[]
        checkOut?: string[]
        roomIds?: string[]
      }
      message?: string
      transactionId?: string
      totalPrice?: number
      redirectTo?: string
    }
  | undefined
