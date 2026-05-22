import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { MapPin, BedDouble, Images, CheckCircle2 } from 'lucide-react'
import { BookingForm } from '@/components/booking-form'

export default async function HomestayDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const id = params.id

  const homestay = await prisma.homestay.findUnique({
    where: { id },
    include: {
      rooms: {
        where: { isAvailable: true },
        orderBy: { pricePerNight: 'asc' },
      }
    }
  })

  if (!homestay) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">{homestay.name}</h1>
        <div className="flex items-center text-zinc-500 mt-3 gap-2 text-sm md:text-base">
          <MapPin className="h-5 w-5 text-zinc-400" />
          <span>{homestay.address}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="md:col-span-3 aspect-video relative overflow-hidden rounded-2xl bg-zinc-100">
          <img 
            src={homestay.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
            alt={homestay.name} 
            className="object-cover w-full h-full"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          {homestay.images.slice(1, 3).map((img, idx) => (
            <div key={idx} className="aspect-square relative overflow-hidden rounded-2xl bg-zinc-100">
              <img src={img} alt={`${homestay.name} ${idx + 2}`} className="object-cover w-full h-full" />
            </div>
          ))}
          {homestay.images.length === 1 && (
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-200">
              <Images className="h-8 w-8 text-zinc-300" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">About this stay</h2>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{homestay.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Available Rooms</h2>
            {homestay.rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homestay.rooms.map((room) => (
                  <div key={room.id} className="p-0 border border-zinc-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                    {room.image ? (
                      <div className="aspect-video relative overflow-hidden bg-zinc-100">
                        <img src={room.image} alt={`Room ${room.roomNumber}`} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="aspect-video relative overflow-hidden bg-zinc-100 flex items-center justify-center border-b border-zinc-100">
                        <BedDouble className="h-8 w-8 text-zinc-300" />
                      </div>
                    )}
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-zinc-900">{room.type}</h3>
                      <p className="text-zinc-500 text-sm mt-1">Room {room.roomNumber}</p>
                      
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {room.facilities.map((fac: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600">
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-zinc-50 rounded-2xl text-center border border-zinc-200 border-dashed">
                <p className="text-zinc-500">No rooms are currently available for this homestay.</p>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <BookingForm rooms={homestay.rooms} />
        </div>
      </div>
    </div>
  )
}
