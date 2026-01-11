'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PageTitle {
  [key: string]: string;
}

const pageTitles: PageTitle = {
  '/dashboard': 'Dashboard',
  '/dashboard/menu': 'Menu',
  '/dashboard/orders': 'Commandes',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Paramètres',
};

export default function TopBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getPageTitle = () => {
    return pageTitles[pathname] || 'Dashboard';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return user.name || user.firstName || user.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.firstName || user.email?.split('@')[0] || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Titre de la page */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Menu utilisateur */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="Menu utilisateur"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900">
                {getUserDisplayName()}
              </p>
              {user?.role && (
                <p className="text-xs text-slate-500 capitalize">
                  {user.role.toLowerCase()}
                </p>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'email@example.com'}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/settings?tab=profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Mon profil</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </button>

              <div className="border-t border-slate-200 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
