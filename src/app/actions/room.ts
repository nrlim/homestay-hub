'use server'

import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { RoomSchema, RoomFormState } from '@/lib/validations/homestay'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase'

export async function createRoom(homestayId: string, state: RoomFormState, formData: FormData): Promise<RoomFormState> {
  await requireAdmin()

  const validatedFields = RoomSchema.safeParse({
    roomNumber: formData.get('roomNumber'),
    type: formData.get('type'),
    pricePerNight: formData.get('pricePerNight'),
    facilities: formData.get('facilities'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data',
    }
  }

  const { roomNumber, type, pricePerNight, facilities } = validatedFields.data
  
  // Parse comma-separated facilities into string[]
  const facilitiesArray = facilities 
    ? facilities.split(',').map(f => f.trim()).filter(f => f.length > 0)
    : []

  const imageFile = formData.get('image') as File | null
  let roomImageUrl: string | undefined = undefined

  try {
    if (imageFile && imageFile.size > 0 && imageFile.type.startsWith('image/')) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const { error } = await supabaseServer.storage
        .from('homestay-bucket')
        .upload(`rooms/${fileName}`, buffer, {
          contentType: imageFile.type,
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error('Failed to upload room image')
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from('homestay-bucket')
        .getPublicUrl(`rooms/${fileName}`)

      roomImageUrl = publicUrlData.publicUrl
    }

    await prisma.room.create({
      data: {
        homestayId,
        roomNumber,
        type,
        pricePerNight: parseInt(pricePerNight),
        facilities: facilitiesArray,
        image: roomImageUrl,
        isAvailable: true,
      }
    })
    
    revalidatePath(`/admin/homestays/${homestayId}/rooms`)
    revalidatePath(`/homestays/${homestayId}`)
    return { message: 'success' }
  } catch (error) {
    return { message: 'Failed to create room' }
  }
}

export async function deleteRoom(id: string, homestayId: string) {
  try {
    await requireAdmin()
    await prisma.room.delete({ where: { id } })
    revalidatePath(`/admin/homestays/${homestayId}/rooms`)
    revalidatePath(`/homestays/${homestayId}`)
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to delete room' }
  }
}

export async function toggleRoomAvailability(id: string, homestayId: string, isAvailable: boolean) {
  await requireAdmin()
  await prisma.room.update({
    where: { id },
    data: { isAvailable }
  })
  revalidatePath(`/admin/homestays/${homestayId}/rooms`)
  revalidatePath(`/homestays/${homestayId}`)
}
