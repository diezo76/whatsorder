'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Vue d\'ensemble' },
  '/dashboard/menu': { title: 'Menu', subtitle: 'Gestion des plats' },
  '/dashboard/orders': { title: 'Commandes', subtitle: 'Suivi en temps reel' },
  '/dashboard/inbox': { title: 'Inbox', subtitle: 'Messages clients' },
  '/dashboard/analytics': { title: 'Analytics', subtitle: 'Statistiques' },
  '/dashboard/settings': { title: 'Parametres', subtitle: 'Configuration' },
};

export default function TopBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getPageInfo = () => {
    if (!pathname) return { title: 'Dashboard' };
    return pageTitles[pathname] || { title: 'Dashboard' };
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

  const pageInfo = getPageInfo();

  return (
    <>
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] sticky top-0 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Page title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[15px] font-semibold text-[#0a0a0a] leading-tight">
                {pageInfo.title}
              </h1>
              {pageInfo.subtitle && (
                <p className="text-[11px] text-[#a3a3a3]">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 100);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] transition-all text-[#a3a3a3] text-[13px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Recherche...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-white border border-[#e5e5e5] rounded text-[#a3a3a3]">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-md hover:bg-[#f0f0f0] transition-all text-[#737373] hover:text-[#0a0a0a]">
              <Bell className="w-4 h-4" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f0f0f0] transition-all"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] text-white text-[11px] font-semibold">
                  {getUserInitials()}
                </div>
                <ChevronDown className={`w-3 h-3 text-[#a3a3a3] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#e5e5e5] py-1 z-50"
                  >
                    <div className="px-3 py-2.5 border-b border-[#e5e5e5]">
                      <p className="text-[13px] font-medium text-[#0a0a0a]">
                        {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <p className="text-[11px] text-[#a3a3a3] truncate">{user?.email || ''}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setIsDropdownOpen(false); router.push('/dashboard/settings?tab=profile'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-all"
                      >
                        <User className="w-3.5 h-3.5" />
                        Mon profil
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); router.push('/dashboard/settings'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Parametres
                      </button>
                    </div>

                    <div className="border-t border-[#e5e5e5] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Deconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#e5e5e5] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5e5]">
                <Search className="w-4 h-4 text-[#a3a3a3]" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Rechercher commandes, clients, plats..."
                  className="flex-1 bg-transparent text-[14px] text-[#0a0a0a] placeholder-[#a3a3a3] outline-none"
                />
                <kbd className="px-2 py-0.5 text-[10px] font-medium bg-[#fafafa] border border-[#e5e5e5] rounded text-[#a3a3a3]">
                  ESC
                </kbd>
              </div>
              <div className="px-4 py-8 text-center text-[13px] text-[#a3a3a3]">
                Tapez pour rechercher...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
