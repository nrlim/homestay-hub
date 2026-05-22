'use server'

import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { HomestaySchema, HomestayFormState } from '@/lib/validations/homestay'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase'

export async function createHomestay(state: HomestayFormState, formData: FormData): Promise<HomestayFormState> {
  await requireAdmin()

  const validatedFields = HomestaySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    location: formData.get('location'),
    address: formData.get('address'),
    images: formData.getAll('images'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data',
    }
  }

  const { name, description, location, address } = validatedFields.data
  
  const imageFiles = formData.getAll('images') as File[]
  const validFiles = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))
  
  if (validFiles.length === 0) {
    return {
      errors: { images: ['Please upload at least one image'] },
      message: 'Invalid data'
    }
  }

  const imageUrls: string[] = []

  try {
    for (const file of validFiles) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const { data, error } = await supabaseServer.storage
        .from('homestay-bucket')
        .upload(`images/${fileName}`, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error('Failed to upload image')
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from('homestay-bucket')
        .getPublicUrl(`images/${fileName}`)

      imageUrls.push(publicUrlData.publicUrl)
    }

    const homestay = await prisma.homestay.create({
      data: {
        name,
        description,
        location,
        address,
        images: imageUrls,
      }
    })
    
    if (homestay) {
      revalidatePath('/admin/homestays')
      revalidatePath('/')
      redirect('/admin/homestays')
    }
  } catch (error) {
    return { message: 'Failed to create homestay' }
  }
}

export async function updateHomestay(id: string, state: HomestayFormState, formData: FormData): Promise<HomestayFormState> {
  await requireAdmin()

  const validatedFields = HomestaySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    location: formData.get('location'),
    address: formData.get('address'),
    images: formData.getAll('images'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data',
    }
  }

  const { name, description, location, address } = validatedFields.data
  
  const imageFiles = formData.getAll('images') as File[]
  const validFiles = imageFiles.filter(file => file.size > 0 && file.type.startsWith('image/'))
  
  try {
    let imageUrls: string[] | undefined = undefined;

    if (validFiles.length > 0) {
      imageUrls = []
      for (const file of validFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data, error } = await supabaseServer.storage
          .from('homestay-bucket')
          .upload(`images/${fileName}`, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', error)
          throw new Error('Failed to upload image')
        }

        const { data: publicUrlData } = supabaseServer.storage
          .from('homestay-bucket')
          .getPublicUrl(`images/${fileName}`)

        imageUrls.push(publicUrlData.publicUrl)
      }
    }

    const dataToUpdate: any = {
      name,
      description,
      location,
      address,
    }

    if (imageUrls && imageUrls.length > 0) {
      dataToUpdate.images = imageUrls
    }

    await prisma.homestay.update({
      where: { id },
      data: dataToUpdate
    })
    
    revalidatePath('/admin/homestays')
    revalidatePath(`/homestays/${id}`)
    redirect('/admin/homestays')
  } catch (error) {
    return { message: 'Failed to update homestay' }
  }
}

export async function deleteHomestay(id: string) {
  try {
    await requireAdmin()
    await prisma.homestay.delete({ where: { id } })
    revalidatePath('/admin/homestays')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to delete homestay' }
  }
}
