'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface HomestayCardProps {
  id: string
  name: string
  location: string
  imageUrl: string
  price: number
}

export function HomestayCard({ id, name, location, imageUrl, price }: HomestayCardProps) {
  return (
    <Link href={`/homestays/${id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-zinc-100 aspect-[4/3] relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
          }}
        />
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-zinc-900 group-hover:underline line-clamp-1">{name}</h3>
        </div>
        <p className="flex items-center text-zinc-500 text-sm mt-1 gap-1">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{location}</span>
        </p>
        <p className="mt-2 text-zinc-900">
          <span className="font-semibold">{formatCurrency(price)}</span> <span className="text-zinc-500 text-sm">/ night</span>
        </p>
      </div>
    </Link>
  )
}
