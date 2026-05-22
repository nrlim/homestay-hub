import { HomestayCard } from '@/components/homestay-card'
import prisma from '@/lib/prisma'
import { HeroSearch } from '@/components/hero-search'

export const dynamic = 'force-dynamic'

export default async function HomestaysPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''

  const whereClause = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { location: { contains: q, mode: 'insensitive' as const } },
    ]
  } : {}

  const homestays = await prisma.homestay.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      rooms: {
        where: { isAvailable: true },
        orderBy: { pricePerNight: 'asc' },
        take: 1,
      }
    }
  })

  return (
    <div className="container mx-auto px-4 pt-6 pb-12">
      <div className="mb-10 flex flex-col items-center justify-center text-center bg-muted/30 p-8 rounded-3xl border border-zinc-100">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">Find Your Stay</h1>
        <p className="text-zinc-500 mb-6 max-w-lg">Search through our premium selection of homestays, villas, and apartments.</p>
        <div className="w-full">
          <HeroSearch />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {q ? `Search results for "${q}"` : 'All Homestays'}
        </h2>
        <span className="text-zinc-500 text-sm">{homestays.length} {homestays.length === 1 ? 'result' : 'results'}</span>
      </div>

      {homestays.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {homestays.map((homestay) => (
            <HomestayCard 
              key={homestay.id}
              id={homestay.id}
              name={homestay.name}
              location={homestay.location}
              imageUrl={homestay.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
              price={homestay.rooms.length > 0 ? homestay.rooms[0].pricePerNight : 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <p className="text-zinc-500 text-lg">No homestays found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
