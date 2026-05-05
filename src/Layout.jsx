import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, MessageSquare, Users, BookOpen, Leaf, Zap, Trophy, ShoppingBag, Settings, Crown, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigation } from "@/lib/NavigationContext";
import MobileHeader from "@/components/MobileHeader";

const tabNavItems = [
  { name: "Dashboard", path: "/", icon: Home, label: "Go to Dashboard" },
  { name: "Chat", path: "/Chat", icon: MessageSquare, label: "Go to Chat" },
  { name: "Summary", path: "/Summary", icon: Zap, label: "Go to Summary" },
  { name: "Challenges", path: "/Challenges", icon: Trophy, label: "Go to Challenges" },
];

const sidebarNavItems = [
  { name: "Analytics", path: "/Analytics", icon: BarChart2, label: "Go to Analytics" },
  { name: "Community", path: "/Community", icon: Users, label: "Go to Community" },
  { name: "Learn", path: "/Learn", icon: BookOpen, label: "Go to Learn" },
  { name: "Nutrients", path: "/Nutrients", icon: Leaf, label: "Go to Nutrients" },
  { name: "Store", path: "/Store", icon: ShoppingBag, label: "Go to Store" },
  { name: "Premium", path: "/Premium", icon: Crown, label: "Go to Premium" },
  { name: "Settings", path: "/Settings", icon: Settings, label: "Go to Settings" },
];

const slideVariants = {
  enterForward: { x: '100%', opacity: 0 },
  enterBackward: { x: '-100%', opacity: 0 },
  enterTab: { opacity: 0, y: 8 },
  center: { x: 0, opacity: 1, y: 0 },
  exitForward: { x: '-30%', opacity: 0 },
  exitBackward: { x: '30%', opacity: 0 },
  exitTab: { opacity: 0, y: -8 },
};

export function PageTransitionWrapper({ children, direction, locationKey }) {
  const initial = direction === 'forward' ? 'enterForward' : direction === 'backward' ? 'enterBackward' : 'enterTab';
  const exit = direction === 'forward' ? 'exitForward' : direction === 'backward' ? 'exitBackward' : 'exitTab';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        initial={slideVariants[initial]}
        animate={slideVariants.center}
        exit={slideVariants[exit]}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 overflow-y-auto"
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { navigateTo, direction } = useNavigation();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigateTo(path);
    setSidebarOpen(false);
  };

  const allNavItems = [...tabNavItems, ...sidebarNavItems];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden md:flex-row flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/[0.02] border-r border-white/5 fixed h-screen left-0 top-0" role="navigation" aria-label="Main navigation">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-light text-white">Dank Blossom</h1>
          <p className="text-white/40 text-xs mt-1">Grow Tracking</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors min-h-[44px] ${active ? "bg-emerald-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button
            onClick={() => base44.auth.logout()}
            variant="outline"
            className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 justify-center gap-2 min-h-[44px]"
            size="sm"
            aria-label="Log out of your account"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden md:ml-64 pb-20 md:pb-0 flex flex-col">
        {/* Mobile Header - top bar (always visible on mobile) */}
        <div className="md:hidden sticky top-0 z-30 bg-white/[0.02] border-b border-white/5 px-4 py-3 flex items-center justify-between" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <h1 className="text-lg font-light text-white">Dank Blossom</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/60 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
        {/* Sub-page back button header */}
        <MobileHeader />

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.nav
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-white/5 z-40 md:hidden overflow-y-auto"
              style={{ paddingTop: "max(3rem, calc(env(safe-area-inset-top) + 3rem))", paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
            >
              <div className="p-4 space-y-1">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.path)}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors min-h-[44px] ${active ? "bg-emerald-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <PageTransitionWrapper direction={direction} locationKey={location.pathname}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </PageTransitionWrapper>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden bg-zinc-900/95 backdrop-blur-sm border-t border-white/5 z-50"
        role="navigation"
        aria-label="Tab navigation"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around">
          {tabNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-2 px-2 transition-colors min-w-[44px] min-h-[44px] flex-1 ${active ? "text-emerald-500" : "text-white/40"}`}
              >
                <Icon className="w-6 h-6 mb-0.5" aria-hidden="true" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}