/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useActionState } from 'react'
import { updateHomestay } from '@/app/actions/homestay'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function EditHomestayForm({ homestay }: { homestay: any }) {
  const updateHomestayWithId = updateHomestay.bind(null, homestay.id)
  const [state, formAction, pending] = useActionState(updateHomestayWithId, undefined)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/homestays" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Homestay</h1>
          <p className="text-zinc-500">Update property listing details.</p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" name="name" defaultValue={homestay.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={homestay.description}
                rows={5} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City/Region)</Label>
                <Input id="location" name="location" defaultValue={homestay.location} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" defaultValue={homestay.address} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Upload New Images (Optional)</Label>
              <Input 
                id="images" 
                name="images" 
                type="file"
                accept="image/*"
                multiple
              />
              <p className="text-xs text-zinc-500">Leave empty to keep existing images. Select multiple files to replace them.</p>
            </div>

            {state?.message && (
              <p className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-md">{state.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Link href="/admin/homestays" className={buttonVariants({ variant: 'outline' })}>Cancel</Link>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
