'use client'

import { useState, useActionState, useEffect } from 'react'
import { createHomestay } from '@/app/actions/homestay'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

export function AddHomestayDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createHomestay, undefined)

  useEffect(() => {
    if (state?.message === 'success') {
      setIsOpen(false)
      toast.success('Homestay added successfully')
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Homestay
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Homestay</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" name="name" placeholder="Villa Bali Bliss" required />
                {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the property..." 
                  rows={6} 
                  required 
                />
                {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City/Region)</Label>
                <Input id="location" name="location" placeholder="Bali, Indonesia" required />
                {state?.errors?.location && <p className="text-sm text-red-500">{state.errors.location[0]}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" placeholder="Jl. Raya Seminyak No. 123" required />
                {state?.errors?.address && <p className="text-sm text-red-500">{state.errors.address[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <Input 
                  id="images" 
                  name="images" 
                  type="file"
                  accept="image/*"
                  multiple
                  required 
                />
                <p className="text-xs text-zinc-500">You can select multiple images to upload.</p>
                {state?.errors?.images && <p className="text-sm text-red-500">{state.errors.images[0]}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={pending} className="px-8">
              {pending ? 'Saving...' : 'Save Homestay'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
