'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Tag,
  Settings,
  LogOut,
  Store,
  ChevronRight,
  Bell,
  Images,
  Zap,
  Smartphone,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/mobile-preview', label: 'Вид с телефона', icon: Smartphone },
  { href: '/admin/import-monitor', label: 'Мониторинг', icon: Activity },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Категории', icon: FolderTree },
  { href: '/admin/brands', label: 'Бренды', icon: Tag },
  { href: '/admin/hero-slider', label: 'Слайдер', icon: Images },
  { href: '/admin/deals', label: 'Товары дня', icon: Zap },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/settings', label: 'Информация', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight leading-none">AquaSpace</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Панель управления</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive(href, exact)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive(href, exact) && (
                <ChevronRight size={14} className="ml-auto text-blue-300" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <Store size={18} />
            <span>Открыть магазин</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all">
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-white">
              {navItems.find(i => isActive(i.href, i.exact))?.label ?? 'Панель управления'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <Bell size={18} className="text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-none">Администратор</p>
                <p className="text-xs text-gray-500 mt-0.5">admin@aquaspace.ru</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
