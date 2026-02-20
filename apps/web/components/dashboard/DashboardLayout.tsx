'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const SidebarContext = createContext<{
  closeSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}>({
  closeSidebar: () => {},
  isCollapsed: false,
  toggleCollapse: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ closeSidebar, isCollapsed, toggleCollapse }}>
      <div className="min-h-screen bg-white">
        {/* Desktop sidebar */}
        <aside
          className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 transition-all duration-300 ${
            isCollapsed ? 'md:w-[68px]' : 'md:w-[240px]'
          }`}
        >
          <Sidebar />
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                onClick={closeSidebar}
              />
              <motion.aside
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden"
              >
                <Sidebar />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            isCollapsed ? 'md:pl-[68px]' : 'md:pl-[240px]'
          }`}
        >
          {/* Mobile header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] md:hidden">
            <div className="flex items-center gap-3 px-4 h-14">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 rounded-md hover:bg-[#f0f0f0] transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-[#0a0a0a]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#0a0a0a]" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#0a0a0a]">
                  <span className="text-[10px] font-bold text-white">W</span>
                </div>
                <span className="text-sm font-semibold text-[#0a0a0a]">Whataybo</span>
              </div>
            </div>
          </header>

          {/* Desktop top bar */}
          <div className="hidden md:block">
            <TopBar />
          </div>

          {/* Content area */}
          <main className="flex-1 p-4 md:p-6 bg-[#fafafa]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-[1400px] mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
