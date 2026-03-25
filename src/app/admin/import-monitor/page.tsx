import { prisma } from '@/lib/prisma';
import { Activity, CheckCircle, AlertTriangle, XCircle, Package } from 'lucide-react';

import { AutoRefresh } from '@/components/admin/AutoRefresh';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = "edge";

export default async function ImportMonitor() {
    // Используем прямой SQL запрос для максимальной надежности
    const statusRaw: any[] = await prisma.$queryRaw`SELECT * FROM ImportStatus WHERE id = 'active' LIMIT 1`;
    const status = statusRaw[0] || null;

    const productsCount = await prisma.product.count();
    const stats = {
        total: status?.total || 0,
        success: status?.success || 0,
        errors: status?.errors || 0,
        reviews: status?.reviews || 0,
        noImageCount: status?.noImageCount || 0,
        misplacedCount: status?.misplacedCount || 0,
        lastSku: status?.lastSku || 'N/A',
        updatedAt: status?.updatedAt ? new Date(status.updatedAt) : new Date()
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <AutoRefresh interval={5000} />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                        <Activity className="text-accent animate-pulse" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter text-glow">LIVE_STREAM_MONITOR</h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black">
                            Last DB Heartbeat: {new Date(stats.updatedAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Page Render Time</p>
                        <p className="text-accent font-mono text-xs font-bold">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                    <Package className="text-blue-400 mb-4" size={24} />
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Всего в базе</p>
                    <p className="text-4xl font-black text-white mt-1">{productsCount}</p>
                </div>
                <div className="bg-gray-900 border border-emerald-900/30 p-6 rounded-3xl">
                    <CheckCircle className="text-emerald-400 mb-4" size={24} />
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Успешно (4K)</p>
                    <p className="text-4xl font-black text-white mt-1">{stats.success - stats.noImageCount}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase font-black">С полным медиа-пакетом</p>
                </div>
                <div className="bg-gray-900 border border-yellow-900/30 p-6 rounded-3xl relative overflow-hidden group">
                    <AlertTriangle className="text-yellow-400 mb-4" size={24} />
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Внимание / Review</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-2xl font-black text-white mt-1">{stats.noImageCount}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Без изображения</p>
                        </div>
                        <div className="pt-2 border-t border-gray-800">
                            <p className="text-2xl font-black text-white mt-1">{stats.misplacedCount}</p>
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Не в ту категорию</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-red-900/30 p-6 rounded-3xl">
                    <XCircle className="text-red-400 mb-4" size={24} />
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Ошибки/Пропуск</p>
                    <p className="text-4xl font-black text-white mt-1">{stats.errors}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase font-black">Критический отказ ИИ</p>
                </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-[40px] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Activity size={200} />
                </div>
                
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-accent text-[10px] uppercase font-black tracking-[0.3em] mb-2">Общий прогресс выгрузки</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter">
                                {Math.min(Math.round((productsCount / 8000) * 100), 100)}%
                            </span>
                            <span className="text-gray-500 font-mono text-sm">/ 100%</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Обработано</p>
                        <p className="text-xl font-bold text-white">{productsCount} <span className="text-gray-600 text-sm">из 8000</span></p>
                    </div>
                </div>

                {/* Основная шкала */}
                <div className="relative h-8 bg-gray-900/50 rounded-2xl border border-gray-800 p-1 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-accent/50 via-accent to-white rounded-xl transition-all duration-1000 relative shadow-[0_0_20px_rgba(201,169,110,0.3)]" 
                        style={{ width: `${Math.min((productsCount / 8000) * 100, 100)}%` }}
                    >
                        {/* Эффект блика на шкале */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
                        <div className="absolute inset-0 animate-[pulse_2s_infinite] bg-white/10"></div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        <span className="text-[10px] uppercase font-bold tracking-widest">Текущий SKU:</span>
                    </div>
                    <span className="text-white font-mono text-sm">{stats.lastSku || 'Ожидание потока...'}</span>
                </div>
            </div>
        </div>
    );
}
