'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from './DashboardLayout';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Menu',
    href: '/dashboard/menu',
    icon: UtensilsCrossed,
  },
  {
    label: 'Commandes',
    href: '/dashboard/orders',
    icon: Package,
  },
  {
    label: 'Inbox',
    href: '/dashboard/inbox',
    icon: MessageSquare,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { closeSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return user.name || user.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email?.split('@')[0] || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="h-screen w-full bg-slate-900 text-white flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <span className="text-xl font-bold text-white">W</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">WhatsOrder</h1>
          <p className="text-xs text-slate-400">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Fermer la sidebar sur mobile après clic sur un lien
                    if (window.innerWidth < 768) {
                      closeSidebar();
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      active
                        ? 'bg-slate-800 text-primary border-l-4 border-primary'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - User Info */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold text-sm">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || 'email@example.com'}
            </p>
            {user?.role && (
              <p className="text-xs text-slate-500 mt-0.5 capitalize">
                {user.role.toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
