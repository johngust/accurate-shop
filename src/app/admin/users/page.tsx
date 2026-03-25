import { prisma } from '@/lib/prisma';
import { Users, Crown, Briefcase, ShoppingCart } from 'lucide-react';

export const runtime = "edge";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        include: { _count: { select: { orders: true, projects: true } } },
        orderBy: { id: 'desc' },
        take: 50,
    });

    const b2bCount = users.filter(u => u.role === 'B2B_CONTRACTOR').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Пользователи</h1>
                    <p className="text-gray-400 text-sm mt-1">{users.length} зарегистрировано · {b2bCount} B2B</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Всего', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Физ. лица (B2C)', value: users.filter(u => u.role === 'B2C').length, icon: Crown, color: 'from-violet-500 to-purple-500' },
                    { label: 'Прорабы (B2B)', value: b2bCount, icon: Briefcase, color: 'from-orange-500 to-amber-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs uppercase text-gray-500 tracking-wider">
                            <th className="px-6 py-3.5">Пользователь</th>
                            <th className="px-6 py-3.5 text-center">Роль</th>
                            <th className="px-6 py-3.5 text-center">Заказы</th>
                            <th className="px-6 py-3.5 text-center">Проекты</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.email}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">#{user.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'B2B_CONTRACTOR'
                                        ? 'bg-orange-500/10 text-orange-400'
                                        : 'bg-gray-700 text-gray-300'
                                        }`}>
                                        {user.role === 'B2B_CONTRACTOR' ? <><Briefcase size={10} /> Прораб</> : <>B2C</>}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                                        <ShoppingCart size={13} className="text-gray-600" /> {user._count.orders}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                                        <Briefcase size={13} className="text-gray-600" /> {user._count.projects}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-16 text-gray-500">
                                    <Users size={36} className="mx-auto mb-3 text-gray-700" />
                                    Нет пользователей
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
