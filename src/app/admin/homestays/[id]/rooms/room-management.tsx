/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useActionState, useEffect } from 'react'
import { createRoom, deleteRoom, toggleRoomAvailability } from '@/app/actions/room'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { AdminTableToolbar } from '@/components/admin-table-toolbar'
import { AdminPagination } from '@/components/admin-pagination'
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal'

export function RoomManagement({ homestay, rooms, totalPages, currentPage }: { homestay: any, rooms: any[], totalPages: number, currentPage: number }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const createRoomWithId = createRoom.bind(null, homestay.id)
  const [state, formAction, pending] = useActionState(createRoomWithId, undefined)

  useEffect(() => {
    if (state?.message === 'success') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAddOpen(false)
      toast.success('Room added successfully')
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  const handleDelete = async (roomId: string) => {
    const result = await deleteRoom(roomId, homestay.id)
    if (result && result.success) {
      toast.success('Room deleted successfully')
    } else {
      toast.error(result?.message || 'Failed to delete room')
    }
  }

  const handleToggle = async (roomId: string, currentState: boolean) => {
    await toggleRoomAvailability(roomId, homestay.id, !currentState)
    toast.success(`Room marked as ${!currentState ? 'available' : 'unavailable'}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/homestays" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rooms for {homestay.name}</h1>
            <p className="text-zinc-500">Manage room inventory and availability.</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Room
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number/Name</Label>
                  <Input id="roomNumber" name="roomNumber" placeholder="101, Deluxe A, etc." required />
                  {state?.errors?.roomNumber && <p className="text-sm text-red-500">{state.errors.roomNumber[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Input id="type" name="type" placeholder="Standard, Deluxe, Suite" required />
                  {state?.errors?.type && <p className="text-sm text-red-500">{state.errors.type[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price per Night (IDR)</Label>
                  <Input id="pricePerNight" name="pricePerNight" type="number" placeholder="500000" required />
                  {state?.errors?.pricePerNight && <p className="text-sm text-red-500">{state.errors.pricePerNight[0]}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Input id="facilities" name="facilities" placeholder="AC, WiFi, TV, Breakfast" />
                {state?.errors?.facilities && <p className="text-sm text-red-500">{state.errors.facilities[0]}</p>}
                <p className="text-xs text-zinc-500">Separate multiple facilities with commas.</p>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Saving...' : 'Save Room'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="p-4 border-b">
          <AdminTableToolbar 
            searchPlaceholder="Search rooms by number or type..."
            sortOptions={[
              { label: 'Room Number (A-Z)', value: 'number-asc' },
              { label: 'Price (High to Low)', value: 'price-desc' },
              { label: 'Price (Low to High)', value: 'price-asc' },
              { label: 'Newest Added', value: 'newest' },
            ]}
            filterOptions={[
              {
                paramKey: 'status',
                placeholder: 'Availability',
                options: [
                  { label: 'Available', value: 'available' },
                  { label: 'Unavailable', value: 'unavailable' },
                ]
              }
            ]}
          />
        </div>
        <div className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-zinc-50/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Room Number</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Price/Night</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Availability</th>
                  <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {rooms.map((room: any) => (
                  <tr key={room.id} className="border-b transition-colors hover:bg-zinc-50/50">
                    <td className="p-4 align-middle font-medium">{room.roomNumber}</td>
                    <td className="p-4 align-middle">{room.type}</td>
                    <td className="p-4 align-middle">{formatCurrency(room.pricePerNight)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={room.isAvailable} 
                          onCheckedChange={() => handleToggle(room.id, room.isAvailable)}
                        />
                        <Badge variant={room.isAvailable ? "default" : "secondary"}>
                          {room.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <ConfirmDeleteModal 
                        title="Delete Room?"
                        description="This room will be permanently deleted. This action cannot be undone."
                        onConfirm={() => handleDelete(room.id)}
                        triggerNode={
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">No rooms found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <AdminPagination currentPage={currentPage} totalPages={totalPages} />
      </Card>
    </div>
  )
}
