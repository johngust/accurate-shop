'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
  const headerPhone = formData.get('headerPhone') as string
  const footerAbout = formData.get('footerAbout') as string
  const footerEmail = formData.get('footerEmail') as string
  const footerAddress = formData.get('footerAddress') as string

  try {
    await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: { headerPhone, footerAbout, footerEmail, footerAddress },
      create: { id: 'global', headerPhone, footerAbout, footerEmail, footerAddress }
    })

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Settings update error:', error)
    return { success: false, error: 'Ошибка при сохранении' }
  }
}
