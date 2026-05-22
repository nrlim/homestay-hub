import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data
  await prisma.bookingItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.room.deleteMany()
  await prisma.homestay.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@homestayhub.com',
      name: 'Admin Homestay Hub',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create User
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
      passwordHash: userPassword,
      role: 'USER',
    },
  })

  // Create Homestays
  const homestay1 = await prisma.homestay.create({
    data: {
      name: 'Villa Bali Bliss',
      description: 'A beautiful villa located in the heart of Bali with a private pool and stunning views.',
      location: 'Bali, Indonesia',
      address: 'Jl. Raya Seminyak No. 123, Seminyak, Kuta, Kabupaten Badung, Bali 80361',
      images: [
        'https://sftxagiuietrmsmzsxca.supabase.co/storage/v1/object/public/homestay-bucket/villa-bali-1.jpg',
        'https://sftxagiuietrmsmzsxca.supabase.co/storage/v1/object/public/homestay-bucket/villa-bali-2.jpg'
      ],
      rooms: {
        create: [
          { roomNumber: '101', type: 'Deluxe', pricePerNight: 1500000, isAvailable: true },
          { roomNumber: '102', type: 'Standard', pricePerNight: 800000, isAvailable: true },
        ]
      }
    }
  })

  const homestay2 = await prisma.homestay.create({
    data: {
      name: 'Bandung Cozy Retreat',
      description: 'Cozy and cool homestay in the mountains of Bandung, perfect for family getaways.',
      location: 'Bandung, Indonesia',
      address: 'Jl. Setiabudi No. 45, Lembang, Bandung Barat, Jawa Barat 40391',
      images: [
        'https://sftxagiuietrmsmzsxca.supabase.co/storage/v1/object/public/homestay-bucket/bandung-1.jpg'
      ],
      rooms: {
        create: [
          { roomNumber: 'A1', type: 'Family Suite', pricePerNight: 2500000, isAvailable: true },
          { roomNumber: 'A2', type: 'Standard', pricePerNight: 750000, isAvailable: true },
        ]
      }
    }
  })

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
