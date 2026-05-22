'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FilterOption {
  label: string
  value: string
}

interface AdminTableToolbarProps {
  searchPlaceholder?: string
  sortOptions?: FilterOption[]
  filterOptions?: {
    paramKey: string
    placeholder: string
    options: FilterOption[]
  }[]
}

export function AdminTableToolbar({
  searchPlaceholder = 'Search...',
  sortOptions,
  filterOptions
}: AdminTableToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Local state for debounced search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  // Create query string utility
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when filtering/sorting changes
      if (name !== 'page') {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || ''
      if (searchTerm !== currentQ) {
        router.push(`${pathname}?${createQueryString('q', searchTerm)}`)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, createQueryString, searchParams])

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      <div className="flex w-full sm:w-auto items-center gap-3">
        {filterOptions?.map((filter) => (
          <Select 
            key={filter.paramKey} 
            value={searchParams.get(filter.paramKey) || 'all'}
            onValueChange={(val) => {
              const valueToSet = val === 'all' ? '' : (val || '')
              router.push(`${pathname}?${createQueryString(filter.paramKey, valueToSet)}`)
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {sortOptions && (
          <Select 
            value={searchParams.get('sort') || sortOptions[0]?.value || 'newest'}
            onValueChange={(val) => router.push(`${pathname}?${createQueryString('sort', val || '')}`)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
