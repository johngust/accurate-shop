import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

export default async function AdminSettingsPage() {
  let settings: any = {
    headerPhone: '',
    footerAbout: '',
    footerEmail: '',
    footerAddress: ''
  }
  try {
    settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' }
    }) || settings;
  } catch (e) {
    // fallback to defaults
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-serif text-white mb-8 uppercase tracking-tight text-center md:text-left">Общая информация</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
