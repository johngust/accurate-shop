import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    Truck,
    AlertCircle,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const runtime = "edge";

async function getStats() {
    const [
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        recentOrders,
        lowStockVariants,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.findMany({
            take: 8,
            orderBy: { id: 'desc' },
            include: { user: true, items: true },
        }),
        prisma.productVariant.findMany({
            where: { stock: { lte: 5 } },
            take: 5,
            include: { product: true },
        }),
    ]);

    const revenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['PAID', 'DELIVERED'] } },
    });

    return { totalProducts, totalOrders, totalUsers, pendingOrders, recentOrders, lowStockVariants, revenue };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Ожидает', color: 'text-yellow-400 bg-yellow-400/10', icon: Clock },
    PAID: { label: 'Оплачен', color: 'text-blue-400 bg-blue-400/10', icon: CheckCircle },
    PROCESSING: { label: 'В работе', color: 'text-purple-400 bg-purple-400/10', icon: Package },
    SHIPPING_BULKY: { label: 'Доставка', color: 'text-cyan-400 bg-cyan-400/10', icon: Truck },
    DELIVERED: { label: 'Доставлен', color: 'text-green-400 bg-green-400/10', icon: CheckCircle },
};

export default async function AdminDashboard() {
    const { totalProducts, totalOrders, totalUsers, pendingOrders, recentOrders, lowStockVariants, revenue } = await getStats();

    const stats = [
        {
            label: 'Выручка',
            value: `${new Intl.NumberFormat('ru-RU').format(Number(revenue._sum.totalAmount ?? 0))} тг.`,
            icon: TrendingUp,
            change: '+12%',
            up: true,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Заказов',
            value: String(totalOrders),
            icon: ShoppingCart,
            change: `${pendingOrders} ожидают`,
            up: true,
            color: 'from-violet-500 to-purple-500',
        },
        {
            label: 'Товаров',
            value: String(totalProducts),
            icon: Package,
            change: `${lowStockVariants.length} мало остатков`,
            up: lowStockVariants.length === 0,
            color: 'from-emerald-500 to-teal-500',
        },
        {
            label: 'Пользователей',
            value: String(totalUsers),
            icon: Users,
            change: '+5 сегодня',
            up: true,
            color: 'from-orange-500 to-amber-500',
        },
    ];

    return (
        <div className="space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <Icon size={16} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Orders */}
                <div className="xl:col-span-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                        <h2 className="text-sm font-semibold text-white">Последние заказы</h2>
                        <Link href="/admin/orders" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            Все заказы →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {recentOrders.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-10">Заказов пока нет</p>
                        )}
                        {recentOrders.map((order) => {
                            const cfg = statusConfig[order.status] ?? statusConfig['PENDING'];
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={order.id} className="flex items-center px-6 py-3.5 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {order.user?.email ?? 'Гость'} · {order.items.length} поз.
                                        </p>
                                    </div>
                                    <div className="ml-4 text-right flex flex-col items-end gap-1.5">
                                        <p className="text-sm font-bold text-white">
                                            {new Intl.NumberFormat('ru-RU').format(Number(order.totalAmount))} тг.
                                        </p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>
                                            <StatusIcon size={10} /> {cfg.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <AlertCircle size={15} className="text-orange-400" /> Мало остатков
                        </h2>
                        <Link href="/admin/products" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            Все →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {lowStockVariants.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-10">Всё в порядке! 🎉</p>
                        )}
                        {lowStockVariants.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-6 py-3.5">
                                <div className="min-w-0 flex-grow">
                                    <p className="text-sm text-white font-medium truncate">{v.product.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{v.sku}</p>
                                </div>
                                <span className={`ml-3 text-sm font-bold px-2.5 py-1 rounded-lg ${v.stock === 0 ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                    {v.stock} шт.
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Быстрые действия</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { href: '/admin/products/new', label: 'Добавить товар', icon: Package, color: 'hover:border-blue-500/50 hover:bg-blue-500/5' },
                        { href: '/admin/orders', label: 'Открыть заказы', icon: ShoppingCart, color: 'hover:border-violet-500/50 hover:bg-violet-500/5' },
                        { href: '/admin/categories', label: 'Категории', icon: Package, color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5' },
                        { href: '/admin/hero-slider', label: 'Слайдер', icon: ArrowUpRight, color: 'hover:border-blue-400/50 hover:bg-blue-400/5' },
                        { href: '/admin/users', label: 'Пользователи', icon: Users, color: 'hover:border-orange-500/50 hover:bg-orange-500/5' },
                    ].map(({ href, label, icon: Icon, color }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center gap-2 p-5 bg-gray-900 border border-gray-800 rounded-xl text-center transition-all ${color}`}
                        >
                            <Icon size={22} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-300">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
