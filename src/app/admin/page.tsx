import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, BedDouble, CreditCard, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboard() {
  await requireAdmin()

  const [homestaysCount, roomsCount, transactionsCount, completedTransactions] = await Promise.all([
    prisma.homestay.count(),
    prisma.room.count(),
    prisma.transaction.count(),
    prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      select: { totalPrice: true }
    })
  ])

  const totalRevenue = completedTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0)

  const recentTransactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-zinc-500">Summary of your platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-zinc-500">From completed transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homestays</CardTitle>
            <Home className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homestaysCount}</div>
            <p className="text-xs text-zinc-500">Properties listed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <BedDouble className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomsCount}</div>
            <p className="text-xs text-zinc-500">Total rooms available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsCount}</div>
            <p className="text-xs text-zinc-500">Total bookings made</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Recent Transactions</h2>
        <Card>
          <div className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-zinc-50/50 data-[state=selected]:bg-zinc-50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b transition-colors hover:bg-zinc-50/50 data-[state=selected]:bg-zinc-50">
                      <td className="p-4 align-middle font-mono text-xs">{tx.id.slice(-8)}</td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{tx.user.name}</div>
                        <div className="text-xs text-zinc-500">{tx.user.email}</div>
                      </td>
                      <td className="p-4 align-middle">{formatCurrency(tx.totalPrice)}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          tx.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-500">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
