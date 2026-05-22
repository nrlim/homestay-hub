import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EditHomestayForm } from './edit-form'
import { requireAdmin } from '@/lib/auth'

export default async function EditHomestayPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  
  const homestay = await prisma.homestay.findUnique({
    where: { id: params.id }
  })

  if (!homestay) {
    notFound()
  }

  return <EditHomestayForm homestay={homestay} />
}
