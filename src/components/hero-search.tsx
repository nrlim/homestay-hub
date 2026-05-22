'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/homestays?q=${encodeURIComponent(query)}`)
    } else {
      router.push(`/homestays`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl shadow-lg border border-zinc-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input 
            type="text" 
            placeholder="Where do you want to stay?" 
            className="w-full h-12 pl-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="rounded-lg h-12 px-8 text-base">
          Search
        </Button>
      </form>
    </div>
  )
}
