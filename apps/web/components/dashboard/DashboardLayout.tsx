'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

// Contexte pour fermer la sidebar depuis les liens
const SidebarContext = createContext<{
  closeSidebar: () => void;
}>({
  closeSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ closeSidebar }}>
      <div className="min-h-screen bg-slate-50">
        {/* ===== SIDEBAR DESKTOP - Toujours visible sur md+ ===== */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-50">
          <Sidebar />
        </aside>

        {/* ===== SIDEBAR MOBILE - Overlay qui s'affiche quand ouverte ===== */}
        {isSidebarOpen && (
          <>
            {/* Overlay sombre */}
            <div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={closeSidebar}
              aria-hidden="true"
            />
            {/* Sidebar mobile */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
              <Sidebar />
            </aside>
          </>
        )}

        {/* ===== CONTENU PRINCIPAL ===== */}
        <div className="md:pl-64 flex flex-col min-h-screen">
          {/* Header Mobile avec Burger Menu */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 md:hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {title || 'Dashboard'}
              </h1>
            </div>
          </header>

          {/* TopBar Desktop */}
          <div className="hidden md:block sticky top-0 z-30">
            <TopBar />
          </div>

          {/* Zone de contenu */}
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
