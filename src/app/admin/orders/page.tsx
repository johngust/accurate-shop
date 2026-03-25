import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingCart, Clock, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';

export const runtime = "edge";

type Props = { searchParams: { status?: string; page?: string } };

const statusConfig: Record<string, { label: string; color: string; border: string; icon: React.ElementType }> = {
    ALL: { label: 'Все', color: 'text-white bg-gray-700', border: 'border-gray-700', icon: ShoppingCart },
    PENDING: { label: 'Ожидают', color: 'text-yellow-400 bg-yellow-400/10', border: 'border-yellow-600', icon: Clock },
    PAID: { label: 'Оплачены', color: 'text-blue-400 bg-blue-400/10', border: 'border-blue-600', icon: CheckCircle },
    PROCESSING: { label: 'В работе', color: 'text-purple-400 bg-purple-400/10', border: 'border-purple-600', icon: Package },
    SHIPPING_BULKY: { label: 'Доставка', color: 'text-cyan-400 bg-cyan-400/10', border: 'border-cyan-600', icon: Truck },
    DELIVERED: { label: 'Доставлены', color: 'text-green-400 bg-green-400/10', border: 'border-green-600', icon: CheckCircle },
};

export default async function AdminOrdersPage({ searchParams }: Props) {
    const statusFilter = searchParams.status ?? 'ALL';
    const page = Number(searchParams.page ?? 1);
    const perPage = 12;

    const where = statusFilter !== 'ALL' ? { status: statusFilter } : {};

    const [orders, total, counts] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { user: true, items: true },
            orderBy: { id: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
        }),
        prisma.order.count({ where }),
        Promise.all(
            Object.keys(statusConfig).map(async (s) => ({
                status: s,
                count: s === 'ALL' ? await prisma.order.count() : await prisma.order.count({ where: { status: s } }),
            }))
        ),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Заказы</h1>
                <p className="text-gray-400 text-sm mt-1">Всего {total} заказов</p>
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {counts.map(({ status, count }) => {
                    const cfg = statusConfig[status];
                    const Icon = cfg.icon;
                    const isActive = statusFilter === status;
                    return (
                        <Link
                            key={status}
                            href={`/admin/orders?status=${status}`}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${isActive
                                ? `${cfg.color} ${cfg.border}`
                                : 'text-gray-400 bg-gray-900 border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <Icon size={13} />
                            {cfg.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-gray-700 text-gray-300'}`}>
                                {count}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs uppercase text-gray-500 tracking-wider">
                            <th className="px-6 py-3.5">№ Заказа</th>
                            <th className="px-6 py-3.5">Клиент</th>
                            <th className="px-6 py-3.5 text-center">Позиций</th>
                            <th className="px-6 py-3.5 text-center">Особые условия</th>
                            <th className="px-6 py-3.5 text-right">Сумма</th>
                            <th className="px-6 py-3.5 text-center">Статус</th>
                            <th className="px-6 py-3.5 text-center">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-16 text-gray-500">
                                    <ShoppingCart size={36} className="mx-auto mb-3 text-gray-700" />
                                    Заказов нет
                                </td>
                            </tr>
                        )}
                        {orders.map((order) => {
                            const cfg = statusConfig[order.status] ?? statusConfig['PENDING'];
                            const StatusIcon = cfg.icon;
                            const hasBulky = order.requiresLift || order.requiresAssembly;

                            return (
                                <tr key={order.id} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white">{order.user?.email ?? 'Гость'}</p>
                                        <p className="text-xs text-gray-500">{order.user?.role ?? 'B2C'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-medium text-gray-300">{order.items.length}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {hasBulky ? (
                                            <div className="flex flex-col gap-1">
                                                {order.requiresLift && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold">
                                                        <AlertCircle size={9} /> Подъём
                                                    </span>
                                                )}
                                                {order.requiresAssembly && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                                                        <Package size={9} /> Монтаж
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-white">
                                            {new Intl.NumberFormat('ru-RU').format(Number(order.totalAmount))} тг.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                                            <StatusIcon size={11} /> {cfg.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium"
                                        >
                                            Открыть
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <Link
                            key={i}
                            href={`/admin/orders?status=${statusFilter}&page=${i + 1}`}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
