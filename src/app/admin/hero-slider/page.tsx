import { prisma } from '@/lib/prisma';
import HeroSliderClient from './HeroSliderClient';

export default async function HeroSliderPage() {
  let slides: any[] = []
  try {
    slides = (prisma as any).heroSlide
      ? await (prisma as any).heroSlide.findMany({ orderBy: { order: 'asc' } })
      : [];
  } catch (e) {
    slides = []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Управление слайдером</h2>
          <p className="text-gray-400 text-sm mt-1">Редактируйте баннеры на главной странице</p>
        </div>
      </div>

      <HeroSliderClient initialSlides={slides} />
    </div>
  );
}
