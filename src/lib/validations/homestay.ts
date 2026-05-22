import * as z from 'zod'

export const HomestaySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  images: z.any(),
})

export type HomestayFormState =
  | {
      errors?: {
        name?: string[]
        description?: string[]
        location?: string[]
        address?: string[]
        images?: string[]
      }
      message?: string
    }
  | undefined

export const RoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.string().min(2, 'Room type is required'),
  pricePerNight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  facilities: z.string().optional(),
})

export type RoomFormState =
  | {
      errors?: {
        roomNumber?: string[]
        type?: string[]
        pricePerNight?: string[]
        facilities?: string[]
      }
      message?: string
    }
  | undefined
