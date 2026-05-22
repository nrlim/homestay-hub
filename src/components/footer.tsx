import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-zinc-50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-zinc-900 p-1.5 rounded-md">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Homestay Hub</span>
            </Link>
            <p className="text-sm text-zinc-500">
              Discover the perfect stay for your next adventure. Premium homestays, curated for you.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Explore</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/homestays" className="hover:text-zinc-900 transition-colors">All Homestays</Link></li>
              <li><Link href="/homestays?q=bali" className="hover:text-zinc-900 transition-colors">Bali</Link></li>
              <li><Link href="/homestays?q=bandung" className="hover:text-zinc-900 transition-colors">Bandung</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Support</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Cancellation Options</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Homestay Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
