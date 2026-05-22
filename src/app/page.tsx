import { HeroSearch } from '@/components/hero-search'
import { HomestayCard } from '@/components/homestay-card'
import prisma from '@/lib/prisma'

export default async function Home() {
  const recentHomestays = await prisma.homestay.findMany({
    take: 6,
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden flex flex-col items-center text-center px-4 -mt-16">
        {/* Background Image */}
        <div 
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80')" }}
        ></div>
        
        {/* Gradient Overlays for readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/20 to-background"></div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl drop-shadow-md">
          Find Your Perfect <span className="text-sky-300">Stay</span> Anywhere
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-100 max-w-2xl drop-shadow">
          Discover premium homestays, villas, and apartments for your next getaway. Book seamlessly with Homestay Hub.
        </p>
        <div className="mt-8 w-full">
          <HeroSearch />
        </div>
      </section>

      {/* Featured Homestays Section */}
      <section className="py-16 bg-muted/30 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Featured Stays</h2>
              <p className="text-zinc-500 mt-2">Explore our most popular and newly added destinations.</p>
            </div>
          </div>
          
          {recentHomestays.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentHomestays.map((homestay) => (
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
            <div className="text-center py-20">
              <p className="text-zinc-500">No homestays available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
