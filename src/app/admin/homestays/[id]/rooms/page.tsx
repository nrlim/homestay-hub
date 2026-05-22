import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { RoomManagement } from './room-management'

export default async function AdminRoomsPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const params = await props.params
  const searchParams = await props.searchParams

  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'number-asc'
  const filter = typeof searchParams.status === 'string' ? searchParams.status : ''
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
  
  const limit = 10
  const skip = (Math.max(1, page) - 1) * limit
  
  const homestay = await prisma.homestay.findUnique({
    where: { id: params.id },
  })

  if (!homestay) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = { homestayId: params.id }
  if (q) {
    whereClause.OR = [
      { roomNumber: { contains: q, mode: 'insensitive' } },
      { type: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (filter === 'available') whereClause.isAvailable = true
  if (filter === 'unavailable') whereClause.isAvailable = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { roomNumber: 'asc' }
  if (sort === 'price-desc') orderBy = { pricePerNight: 'desc' }
  if (sort === 'price-asc') orderBy = { pricePerNight: 'asc' }
  if (sort === 'newest') orderBy = { createdAt: 'desc' }

  const [rooms, totalCount] = await Promise.all([
    prisma.room.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.room.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <RoomManagement 
      homestay={homestay} 
      rooms={rooms} 
      totalPages={totalPages} 
      currentPage={page} 
    />
  )
}
