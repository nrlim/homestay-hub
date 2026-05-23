import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Home } from 'lucide-react'

export default async function BookingsPage() {
  const session = await requireAuth()

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      bookingItems: {
        include: {
          room: {
            include: {
              homestay: true
            }
          }
        }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 pt-6 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Bookings</h1>
        <p className="text-zinc-500 mt-2">Manage and view your past and upcoming stays.</p>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-6">
          {transactions.map((transaction) => {
            const firstItem = transaction.bookingItems[0]
            const homestay = firstItem?.room.homestay
            
            return (
              <div key={transaction.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {homestay && (
                    <div className="w-full sm:w-48 h-48 sm:h-auto bg-zinc-100 flex-shrink-0">
                      <img 
                        src={homestay.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} 
                        alt={homestay.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-zinc-900 line-clamp-1">
                          {homestay?.name || 'Homestay Room'}
                        </h3>
                        <Badge 
                          variant={
                            transaction.status === 'COMPLETED' ? 'default' :
                            transaction.status === 'UNPAID' ? 'destructive' :
                            transaction.status === 'PENDING' ? 'outline' :
                            transaction.status === 'CANCELLED' ? 'secondary' : 'outline'
                          }
                          className="ml-2"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mt-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-zinc-400" />
                          <span>
                            {format(new Date(transaction.checkIn), 'MMM d, yyyy')} - {format(new Date(transaction.checkOut), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-zinc-400" />
                          <span>
                            {transaction.bookingItems.length} {transaction.bookingItems.length === 1 ? 'Room' : 'Rooms'} 
                            ({transaction.bookingItems.map(item => `${item.room.type}`).join(', ')})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-end">
                      <span className="text-xs text-zinc-500">
                        Booked on {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </span>
                      <div className="text-right">
                        <span className="block text-xs text-zinc-500 mb-1">Total Payment</span>
                        <span className="text-lg font-bold text-zinc-900">{formatCurrency(transaction.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <CalendarDays className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900">No bookings yet</h3>
          <p className="text-zinc-500 mt-2">You haven&apos;t made any reservations yet.</p>
        </div>
      )}
    </div>
  )
}
