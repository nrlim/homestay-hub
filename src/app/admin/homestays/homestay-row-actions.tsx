'use client'

import { deleteHomestay } from '@/app/actions/homestay'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal'
import { Pencil, BedDouble, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface HomestayRowActionsProps {
  id: string
}

export function HomestayRowActions({ id }: HomestayRowActionsProps) {
  const handleDelete = async () => {
    const result = await deleteHomestay(id)
    if (result && result.success) {
      toast.success('Homestay deleted successfully.')
    } else {
      toast.error(result?.message || 'Failed to delete homestay.')
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/homestays/${id}/rooms`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <BedDouble className="h-4 w-4 mr-1" /> Rooms
      </Link>
      <Link href={`/admin/homestays/${id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <Pencil className="h-4 w-4" />
      </Link>
      <ConfirmDeleteModal 
        title="Delete Homestay?"
        description="Are you sure you want to delete this homestay? All associated rooms and bookings will also be deleted."
        onConfirm={handleDelete}
      />
    </div>
  )
}
