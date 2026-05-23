'use client'

import { useState } from 'react'
import { verifyPaymentSimulator } from '@/app/actions/transaction'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, CreditCard, Sparkles, Server } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SimulatorPage() {
  const [vaNumber, setVaNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vaNumber.trim()) return

    setIsLoading(true)
    setResult(null)
    
    try {
      const res = await verifyPaymentSimulator(vaNumber.trim())
      setResult(res)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error('An error occurred while verifying the payment.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 px-4">
      {/* Abstract Color Grading / Mesh Gradient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-sky-300/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-teal-500/30 mb-3">
            <Server className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Bank Simulator
          </h1>
          <p className="text-sm text-slate-500 max-w-sm">
            Bypass real transactions and simulate successful payments instantly.
          </p>
        </div>

        <Card className="shadow-2xl shadow-slate-900/5 border-slate-200/60 bg-white/80 backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 pb-6">
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Verify Virtual Account
            </CardTitle>
            <CardDescription>
              Enter the VA number generated during booking checkout.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleVerify}>
            <CardContent className="pt-6 pb-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="vaNumber" className="text-slate-700 font-medium text-sm">
                  Virtual Account Number
                </Label>
                <div className="relative group">
                  <Input 
                    id="vaNumber" 
                    placeholder="e.g. 891012345678" 
                    value={vaNumber}
                    onChange={(e) => setVaNumber(e.target.value)}
                    className="font-mono text-lg py-5 px-4 tracking-wider bg-slate-50 border-slate-200 transition-all focus-visible:ring-teal-500 focus-visible:border-teal-500 shadow-sm"
                    required
                  />
                  <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-teal-500/0 group-focus-within:ring-teal-500/20 pointer-events-none transition-all duration-300"></div>
                </div>
              </div>

              {result && (
                <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  result.success 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' 
                    : 'bg-red-50 text-red-800 border border-red-200/60'
                }`}>
                  {result.success 
                    ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" /> 
                    : <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
                  }
                  <p className="text-sm font-medium leading-snug">{result.message}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pb-8 pt-2 flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 transition-all duration-300 border-0" 
                disabled={isLoading || !vaNumber}
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Simulate Payment
                  </>
                )}
              </Button>
              
              {result?.success && (
                <Link 
                  href="/bookings" 
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 text-center hover:underline underline-offset-4 transition-all"
                >
                  View your bookings →
                </Link>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
