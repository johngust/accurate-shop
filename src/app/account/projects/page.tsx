import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileSpreadsheet, Plus, ExternalLink, Download } from 'lucide-react'

export default async function ProjectsPage() {
  let projects: any[] = []
  try {
    projects = await prisma.project.findMany({
      take: 5
    })
  } catch (e) {
    projects = []
  }

  return (
    <div className="bg-surface min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="font-serif text-5xl text-primary mb-4 uppercase tracking-tight">Мои сметы</h1>
            <p className="text-gray-500 font-light text-sm uppercase tracking-widest">Личный кабинет партнера (B2B)</p>
          </div>
          <button className="btn-accent flex items-center justify-center gap-3 h-14 px-8 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-accent/20 transition-all active:scale-[0.98]">
            <Plus className="w-5 h-5" /> Создать новый проект
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-6">Название проекта</th>
                  <th className="px-8 py-6">Создан</th>
                  <th className="px-8 py-6">Объекты</th>
                  <th className="px-8 py-6 text-right">Розница (тг.)</th>
                  <th className="px-8 py-6 text-right text-accent">B2B Цена (тг.)</th>
                  <th className="px-8 py-6 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-serif text-lg text-primary group-hover:text-accent transition-colors cursor-pointer">{project.name}</span>
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-400 font-medium">
                        {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-gray-100 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                          {JSON.parse(project.items || '[]').length} позиции
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-gray-400 line-through font-light">
                        {(450000).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-8 py-6 text-right text-lg font-bold text-primary">
                        {(385000).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-4">
                          <button className="p-2 text-gray-400 hover:text-accent transition-colors" title="Скачать PDF">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors" title="Открыть">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-serif text-lg">У вас пока нет активных смет</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 p-8 bg-primary rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="text-center md:text-left">
            <h4 className="font-serif text-2xl text-white mb-2 italic">Нужна помощь в расчетах?</h4>
            <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-medium leading-relaxed">Наши эксперты помогут собрать полную спецификацию под ваш проект</p>
          </div>
          <button className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all">
            Заказать расчет спецификации
          </button>
        </div>
      </div>
    </div>
  )
}
