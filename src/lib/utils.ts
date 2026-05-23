import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function calculateNights(checkIn: Date, checkOut: Date) {
  return differenceInDays(new Date(checkOut), new Date(checkIn))
}

export function generateVaNumber(transactionId: string) {
  let hash = 0;
  for (let i = 0; i < transactionId.length; i++) {
    hash = (hash << 5) - hash + transactionId.charCodeAt(i);
    hash |= 0;
  }
  return `8910${Math.abs(hash).toString().padStart(8, '0').slice(0, 8)}`;
}
