'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop: fixed, Mobile: overlay */}
      <div
        className={`
          fixed left-0 top-0 z-50 h-screen transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* Overlay pour mobile quand sidebar ouverte */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* TopBar avec burger menu */}
        <div className="sticky top-0 z-30 flex-shrink-0">
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-slate-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-slate-900">
              {title || 'Dashboard'}
            </h1>
          </div>
          <TopBar />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
