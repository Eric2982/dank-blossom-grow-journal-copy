import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, MessageSquare, Users, BookOpen, Leaf, Zap, Trophy, ShoppingBag, Settings, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const tabNavItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Chat", path: "/Chat", icon: MessageSquare },
  { name: "Summary", path: "/Summary", icon: Zap },
  { name: "Challenges", path: "/Challenges", icon: Trophy },
  { name: "Settings", path: "/Settings", icon: Settings },
];

const sidebarNavItems = [
  { name: "Community", path: "/Community", icon: Users },
  { name: "Learn", path: "/Learn", icon: BookOpen },
  { name: "Nutrients", path: "/Nutrients", icon: Leaf },
  { name: "Store", path: "/Store", icon: ShoppingBag },
  { name: "Premium", path: "/Premium", icon: Crown },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden md:flex-row flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/[0.02] border-r border-white/5 fixed h-screen left-0 top-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-light text-white">Dank Blossom</h1>
          <p className="text-white/40 text-xs mt-1">Grow Tracking</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {[...tabNavItems, ...sidebarNavItems].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${active ? "bg-emerald-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button onClick={() => base44.auth.logout()} variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 justify-center gap-2" size="sm">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:ml-64 pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/[0.02] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-light text-white">Dank Blossom</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <motion.div
          initial={{ x: sidebarOpen ? 0 : -256 }}
          animate={{ x: sidebarOpen ? 0 : -256 }}
          className="fixed left-0 top-12 h-[calc(100vh-3rem-80px)] w-64 bg-white/[0.02] border-r border-white/5 z-40 md:hidden overflow-y-auto"
        >
          <nav className="p-4 space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                >
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${active ? "bg-emerald-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </motion.div>

        {/* Page Content */}
        <motion.div
          className="p-4 md:p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          key={location.pathname}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 md:hidden bg-white/[0.02] border-t border-white/5 z-50"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around">
          {tabNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex-1"
              >
                <motion.div
                  className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${active ? "text-emerald-600" : "text-white/40"}`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}