import { Outlet, Link, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { logoutUser } from '../firebase/client';
import { LayoutDashboard, Key, Tent, BarChart3, Settings, Book, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function Layout({ user }: { user: User }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', path: '/keys', icon: Key },
    { name: 'Playground', path: '/playground', icon: Tent },
    { name: 'Usage', path: '/usage', icon: BarChart3 },
    { name: 'Documentation', path: '/docs', icon: Book },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 hidden md:flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-white rounded-lg flex items-center justify-center text-neutral-950 font-bold text-xl leading-none tracking-tighter">N</div>
          <span className="font-semibold text-xl tracking-tight">NGAI</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative z-0 ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-neutral-800 rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-neutral-900 rounded-md">
          <div className="size-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium uppercase border border-neutral-700 shrink-0">
            {user.email?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800 overflow-hidden">
      
      {/* Mobile Top Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md z-20 flex justify-between items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-white rounded-lg flex items-center justify-center text-neutral-950 font-bold text-xl leading-none tracking-tighter">N</div>
          <span className="font-semibold text-xl tracking-tight">NGAI</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-neutral-400 hover:text-white">
          <Menu className="size-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-neutral-800 bg-neutral-950 flex-col z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-neutral-950 border-r border-neutral-800 z-40 md:hidden flex flex-col pt-16"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
              >
                <X className="size-6" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto mt-16 md:mt-0 flex flex-col">
        <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
