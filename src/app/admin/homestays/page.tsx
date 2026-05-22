import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Pencil, BedDouble } from 'lucide-react'
import { HomestayRowActions } from './homestay-row-actions'
import { AddHomestayDialog } from '@/components/add-homestay-dialog'
import { AdminTableToolbar } from '@/components/admin-table-toolbar'
import { AdminPagination } from '@/components/admin-pagination'
import { Badge } from '@/components/ui/badge'

export default async function AdminHomestaysPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const searchParams = await props.searchParams

  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
  
  const limit = 10
  const skip = (Math.max(1, page) - 1) * limit

  const whereClause = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { location: { contains: q, mode: 'insensitive' as const } },
    ]
  } : {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'oldest') orderBy = { createdAt: 'asc' }
  if (sort === 'name-asc') orderBy = { name: 'asc' }
  if (sort === 'name-desc') orderBy = { name: 'desc' }

  const [homestays, totalCount] = await Promise.all([
    prisma.homestay.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: { _count: { select: { rooms: true } } }
    }),
    prisma.homestay.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homestays</h1>
          <p className="text-zinc-500">Manage your homestay properties.</p>
        </div>
        <AddHomestayDialog />
      </div>

      <Card>
        <div className="p-4 border-b">
          <AdminTableToolbar 
            searchPlaceholder="Search homestays by name or location..."
            sortOptions={[
              { label: 'Newest Added', value: 'newest' },
              { label: 'Oldest Added', value: 'oldest' },
              { label: 'Name (A-Z)', value: 'name-asc' },
              { label: 'Name (Z-A)', value: 'name-desc' },
            ]}
          />
        </div>
        <div className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-zinc-50/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Location</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Rooms</th>
                  <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {homestays.map((homestay) => (
                  <tr key={homestay.id} className="border-b transition-colors hover:bg-zinc-50/50">
                    <td className="p-4 align-middle font-medium">{homestay.name}</td>
                    <td className="p-4 align-middle">{homestay.location}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary" className="font-mono">
                        {homestay._count.rooms}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <HomestayRowActions id={homestay.id} />
                    </td>
                  </tr>
                ))}
                {homestays.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500">No homestays found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <AdminPagination currentPage={page} totalPages={totalPages} />
      </Card>
    </div>
  )
}
