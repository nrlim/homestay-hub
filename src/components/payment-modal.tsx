'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency, generateVaNumber } from '@/lib/utils'
import { checkTransactionStatus, markTransactionAsUnpaid } from '@/app/actions/transaction'
import { CheckCircle2, RefreshCw, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  totalPrice: number
}

export function PaymentModal({ isOpen, onOpenChange, transactionId, totalPrice }: PaymentModalProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleCheckStatus = async () => {
    setIsChecking(true)
    try {
      const status = await checkTransactionStatus(transactionId)
      if (status === 'COMPLETED' || status === 'CONFIRMED') {
        setIsSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          router.push('/bookings')
        }, 2000)
      } else {
        // If unpaid, mark as UNPAID in database, don't block the user. Close the modal and redirect to bookings.
        await markTransactionAsUnpaid(transactionId)
        setIsChecking(false)
        onOpenChange(false)
        router.push('/bookings')
      }
    } catch (e) {
      setIsChecking(false)
    }
  }

  // Generate a fake Virtual Account number based on transaction ID
  const fakeVaNumber = generateVaNumber(transactionId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing manually if success
      if (isSuccess) return
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Complete Your Payment
              </DialogTitle>
              <DialogDescription>
                Please transfer the exact amount to the Virtual Account number below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 my-4 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
                <span className="text-zinc-500 text-sm">Total Amount</span>
                <span className="text-xl font-bold text-zinc-900">{formatCurrency(totalPrice)}</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-zinc-500 text-sm block">Virtual Account Number (BCA)</span>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-mono font-bold tracking-wider text-zinc-800">{fakeVaNumber}</span>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(fakeVaNumber)}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-sm text-center text-zinc-500 mb-2">
              Waiting for payment...
            </div>

            <Button 
              className="w-full h-12 text-md" 
              onClick={handleCheckStatus} 
              disabled={isChecking}
            >
              {isChecking ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
              ) : (
                'I Have Paid - Check Status'
              )}
            </Button>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900">Payment Successful!</h3>
            <p className="text-zinc-500 text-center">Your booking has been confirmed.<br/>Redirecting to your bookings...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
