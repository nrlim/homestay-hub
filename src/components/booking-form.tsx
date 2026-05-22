/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useActionState, useEffect } from 'react'
import { createBooking } from '@/app/actions/transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, calculateNights } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { PaymentModal } from '@/components/payment-modal'

interface Room {
  id: string
  roomNumber: string
  type: string
  pricePerNight: number
}

interface BookingFormProps {
  rooms: Room[]
}

export function BookingForm({ rooms }: BookingFormProps) {
  const [state, formAction, pending] = useActionState(createBooking, undefined)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>({})
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [finalPrice, setFinalPrice] = useState(0)

  useEffect(() => {
    if (state?.message === 'success' && state?.transactionId && state?.totalPrice) {
      setTransactionId(state.transactionId)
      setFinalPrice(state.totalPrice)
      setIsPaymentModalOpen(true)
    }
  }, [state])

  const nights = (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) 
    ? calculateNights(new Date(checkIn), new Date(checkOut)) 
    : 0

  const totalPrice = rooms.reduce((sum, room) => {
    if (selectedRooms[room.id] && nights > 0) {
      return sum + (room.pricePerNight * nights)
    }
    return sum
  }, 0)

  const today = format(new Date(), 'yyyy-MM-dd')
  const checkOutMin = checkIn 
    ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd')
    : format(addDays(new Date(), 1), 'yyyy-MM-dd')

  return (
    <>
      <form action={formAction} className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle>Book your stay</CardTitle>
          <CardDescription>Select dates and rooms to complete your reservation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input 
                id="checkIn" 
                name="checkIn" 
                type="date" 
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  // Reset checkout if it's not valid based on new checkIn
                  if (checkOut && e.target.value >= checkOut) {
                    setCheckOut('')
                  }
                }}
                required 
              />
              {state?.errors?.checkIn && (
                <p className="text-sm text-red-500">{state.errors.checkIn[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out</Label>
              <Input 
                id="checkOut" 
                name="checkOut" 
                type="date" 
                min={checkOutMin}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required 
              />
              {state?.errors?.checkOut && (
                <p className="text-sm text-red-500">{state.errors.checkOut[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select Rooms</Label>
            {rooms.length === 0 ? (
              <p className="text-sm text-zinc-500">No rooms available.</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`room-${room.id}`} 
                        name="roomIds" 
                        value={room.id}
                        checked={selectedRooms[room.id] || false}
                        onCheckedChange={(checked) => {
                          setSelectedRooms(prev => ({...prev, [room.id]: checked === true}))
                        }}
                      />
                      <Label htmlFor={`room-${room.id}`} className="flex flex-col cursor-pointer">
                        <span className="font-medium text-sm">Room {room.roomNumber} - {room.type}</span>
                        <span className="text-zinc-500 text-xs">{formatCurrency(room.pricePerNight)} / night</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {state?.errors?.roomIds && (
              <p className="text-sm text-red-500">{state.errors.roomIds[0]}</p>
            )}
          </div>

          {nights > 0 && totalPrice > 0 && (
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center mb-2 text-sm text-zinc-600">
                <span>{nights} {nights === 1 ? 'night' : 'nights'} selected</span>
                <span>{Object.values(selectedRooms).filter(Boolean).length} rooms</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Price</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          {state?.message && (
            <p className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-md">{state.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full text-lg h-12" 
            disabled={pending || rooms.length === 0 || Object.values(selectedRooms).filter(Boolean).length === 0}
          >
            {pending ? 'Processing...' : 'Book Now'}
          </Button>
        </CardFooter>
      </Card>
    </form>
    
    {transactionId && (
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onOpenChange={setIsPaymentModalOpen}
        transactionId={transactionId}
        totalPrice={finalPrice}
      />
    )}
    </>
  )
}
