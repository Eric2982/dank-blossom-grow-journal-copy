import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, MessageSquare, Users, BookOpen, Leaf, Zap, Trophy, ShoppingBag, Settings, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Chat", path: "/Chat", icon: MessageSquare },
    { name: "Community", path: "/Community", icon: Users },
    { name: "Learn", path: "/Learn", icon: BookOpen },
    { name: "Nutrients", path: "/Nutrients", icon: Leaf },
    { name: "Summary", path: "/Summary", icon: Zap },
    { name: "Challenges", path: "/Challenges", icon: Trophy },
    { name: "Store", path: "/Store", icon: ShoppingBag },
    { name: "Premium", path: "/Premium", icon: Crown },
    { name: "Settings", path: "/Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white/[0.02] border-r border-white/5 transform transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <h1 className="text-xl font-light text-white">Dank Blossom</h1>
            <p className="text-white/40 text-xs mt-1">Grow Tracking</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.name} to={item.path} onClick={() => setSidebarOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${active ? "bg-emerald-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <Button onClick={() => base44.auth.logout()} variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 justify-center gap-2" size="sm">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/[0.02] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-light text-white">Dank Blossom</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 pb-20">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}