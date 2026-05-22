import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { TransactionManagement } from './transaction-management'
import { Prisma } from '@prisma/client'

export default async function AdminTransactionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const searchParams = await props.searchParams

  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
  const filter = typeof searchParams.status === 'string' ? searchParams.status : ''
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
  
  const limit = 10
  const skip = (Math.max(1, page) - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {}
  
  if (q) {
    whereClause.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  if (filter && ['PENDING', 'SUCCESS', 'FAILED'].includes(filter.toUpperCase())) {
    whereClause.status = filter.toUpperCase() as Prisma.EnumTransactionStatusFilter
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'oldest') orderBy = { createdAt: 'asc' }
  if (sort === 'amount-desc') orderBy = { totalPrice: 'desc' }
  if (sort === 'amount-asc') orderBy = { totalPrice: 'asc' }

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        bookingItems: {
          include: {
            room: { select: { roomNumber: true, type: true, homestay: { select: { name: true } } } }
          }
        }
      }
    }),
    prisma.transaction.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <TransactionManagement 
      transactions={transactions} 
      totalPages={totalPages} 
      currentPage={page} 
    />
  )
}
