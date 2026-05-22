/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { updateTransactionStatus } from '@/app/actions/transaction'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AdminTableToolbar } from '@/components/admin-table-toolbar'
import { AdminPagination } from '@/components/admin-pagination'

export function TransactionManagement({ 
  transactions, 
  totalPages, 
  currentPage 
}: { 
  transactions: any[],
  totalPages: number,
  currentPage: number
}) {
  const router = useRouter()

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    try {
      await updateTransactionStatus(transactionId, newStatus as any)
      toast.success('Transaction status updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-zinc-500">Manage bookings and payments.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b">
          <AdminTableToolbar 
            searchPlaceholder="Search by ID, User Name, or Email..."
            sortOptions={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Amount (High to Low)', value: 'amount-desc' },
              { label: 'Amount (Low to High)', value: 'amount-asc' },
            ]}
            filterOptions={[
              {
                paramKey: 'status',
                placeholder: 'All Status',
                options: [
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Confirmed', value: 'CONFIRMED' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">ID / Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Customer</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Booking Details</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {transactions.map((tx) => {
                  const homestayName = tx.bookingItems[0]?.room?.homestay?.name || 'Unknown Homestay'
                  return (
                    <tr key={tx.id} className="border-b transition-colors hover:bg-zinc-50/50">
                      <td className="p-4 align-middle">
                        <div className="font-mono text-xs">{tx.id.slice(-8)}</div>
                        <div className="text-xs text-zinc-500">{format(new Date(tx.createdAt), 'MMM d, yyyy')}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{tx.user.name}</div>
                        <div className="text-xs text-zinc-500">{tx.user.email}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium line-clamp-1">{homestayName}</div>
                        <div className="text-xs text-zinc-500">
                          {format(new Date(tx.checkIn), 'MMM d')} - {format(new Date(tx.checkOut), 'MMM d')}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {tx.bookingItems.length} rooms ({tx.bookingItems.map((item: any) => item.room.roomNumber).join(', ')})
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium">{formatCurrency(tx.totalPrice)}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-2">
                          <Select 
                            value={tx.status} 
                            onValueChange={(val) => {
                              if (val) handleStatusChange(tx.id, val)
                            }}
                          >
                            <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold ${
                              tx.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              tx.status === 'CANCELLED' ? 'bg-red-50 text-red-800 border-red-200' :
                              'bg-yellow-50 text-yellow-800 border-yellow-200'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {tx.status === 'PENDING' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              className="w-[130px] h-8 text-xs font-bold"
                              onClick={() => handleStatusChange(tx.id, 'CONFIRMED')}
                            >
                              Simulate Payment
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      No transactions found matching your criteria.
                    </td>
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
