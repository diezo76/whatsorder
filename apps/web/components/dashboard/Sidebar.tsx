'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from './DashboardLayout';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Commandes', href: '/dashboard/orders', icon: Package },
  { label: 'Menu', href: '/dashboard/menu', icon: UtensilsCrossed },
  { label: 'Inbox', href: '/dashboard/inbox', icon: MessageSquare },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Parametres', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { closeSidebar, isCollapsed, toggleCollapse } = useSidebar();
  const router = useRouter();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return user.name || user.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email?.split('@')[0] || 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={`
        h-screen flex flex-col bg-[#fafafa] border-r border-[#e5e5e5]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#e5e5e5] shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0a0a0a]">
          <span className="text-sm font-bold text-white">W</span>
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h1 className="text-sm font-semibold text-[#0a0a0a] tracking-tight">Whataybo</h1>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) closeSidebar();
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2 rounded-md
                    text-[13px] font-medium transition-all duration-150
                    ${active
                      ? 'bg-[#0a0a0a] text-white'
                      : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f0f0f0]'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-[#737373] group-hover:text-[#0a0a0a]'}`} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-[#3b82f6] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle - desktop only */}
      <div className="hidden md:flex px-3 py-2 border-t border-[#e5e5e5]">
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center w-full py-1.5 rounded-md text-[#a3a3a3] hover:text-[#0a0a0a] hover:bg-[#f0f0f0] transition-all"
          title={isCollapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#e5e5e5] shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] text-white text-xs font-semibold shrink-0">
            {getUserInitials()}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[13px] font-medium text-[#0a0a0a] truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-[11px] text-[#a3a3a3] truncate">
                {user?.email || ''}
              </p>
            </motion.div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 transition-all"
              title="Deconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
