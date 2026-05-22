import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env BEFORE anything else
dotenv.config({ path: path.join(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from '@supabase/supabase-js'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const BUCKET_NAME = 'homestay-bucket'

async function uploadImage(filename: string): Promise<string> {
  const filePath = path.join(__dirname, 'images', filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image not found: ${filePath}`)
  }

  const fileBuffer = fs.readFileSync(filePath)
  const destPath = `sample-data/${Date.now()}_${filename}`

  console.log(`Uploading ${filename}...`)
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(destPath, fileBuffer, {
      contentType: 'image/png',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload ${filename}: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(destPath)

  return publicUrlData.publicUrl
}

async function main() {
  console.log('Starting seed process...')
  
  const dataPath = path.join(__dirname, 'homestays.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const homestays = JSON.parse(rawData)

  console.log('Clearing existing homestays and rooms...')
  await prisma.homestay.deleteMany({})

  // Cache to avoid re-uploading the exact same base image multiple times
  const uploadedUrls = new Map<string, string>()

  for (const hs of homestays) {
    console.log(`Processing Homestay: ${hs.name}`)
    
    // Upload homestay image
    let hsImageUrl = uploadedUrls.get(hs.image)
    if (!hsImageUrl) {
      hsImageUrl = await uploadImage(hs.image)
      uploadedUrls.set(hs.image, hsImageUrl)
    }

    const homestayRecord = await prisma.homestay.create({
      data: {
        name: hs.name,
        description: hs.description,
        location: hs.location,
        address: hs.address,
        images: [hsImageUrl],
      }
    })

    console.log(`Created Homestay: ${homestayRecord.id}`)

    for (const room of hs.rooms) {
      // Upload room image
      let roomImageUrl = uploadedUrls.get(room.image)
      if (!roomImageUrl) {
        roomImageUrl = await uploadImage(room.image)
        uploadedUrls.set(room.image, roomImageUrl)
      }
      
      let facilities: string[] = ["WiFi", "AC", "Private Bathroom"]
      if (room.type === 'Standard') facilities.push("Queen Bed", "TV")
      if (room.type === 'Deluxe') facilities.push("King Bed", "Smart TV", "Mini Fridge", "Breakfast")
      if (room.type === 'Family') facilities.push("2 Queen Beds", "Smart TV", "Kitchenette", "Breakfast", "Living Area")
      if (room.type === 'Suite') facilities.push("King Bed", "Smart TV", "Bathtub", "Mini Bar", "Balcony", "Breakfast")
      if (room.type === 'Dormitory') facilities = ["WiFi", "AC", "Shared Bathroom", "Bunk Bed", "Lockers"]
      
      await prisma.room.create({
        data: {
          homestayId: homestayRecord.id,
          roomNumber: room.roomNumber,
          type: room.type,
          pricePerNight: room.pricePerNight,
          image: roomImageUrl,
          facilities: facilities,
          isAvailable: true,
        }
      })
      console.log(`  Created Room: ${room.roomNumber} (${room.type})`)
    }
  }

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
