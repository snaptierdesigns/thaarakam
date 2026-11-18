'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdmin, VALID_ADMIN_SESSION_TOKEN } from './actions';
import { LayoutDashboard, ShoppingBag, Layers, Settings, LogOut, Menu, X, ArrowLeft, MessageSquare, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isLoginPage = Boolean(pathname && pathname.startsWith('/admin/login'));

  // Strict client-side route guard across all admin subroutes
  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    try {
      const localToken = localStorage.getItem('thaarakam_admin_session');
      const cookieMatch = document.cookie
        .split('; ')
        .find((row) => row.startsWith('thaarakam_admin_session='));
      const cookieVal = cookieMatch ? cookieMatch.split('=')[1] : null;

      if (localToken === VALID_ADMIN_SESSION_TOKEN || cookieVal === VALID_ADMIN_SESSION_TOKEN) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        if (typeof window !== 'undefined') {
          window.location.replace('/admin/login/');
        }
      }
    } catch {
      setIsAuthorized(false);
      if (typeof window !== 'undefined') {
        window.location.replace('/admin/login/');
      }
    }
  }, [pathname, isLoginPage]);

  // If on login page, render login screen directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent rendering admin interface or executing catalog operations until authentication is verified
  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-foreground border-t-transparent" />
          <p className="text-xs text-secondary font-medium tracking-wide">
            Verifying manager authentication...
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Customer Orders', href: '/admin/orders', icon: Package },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logoutAdmin();
      window.location.replace('/admin/login/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      
      {/* Mobile Header */}
      <header className="md:hidden flex h-14 items-center justify-between border-b border-border bg-background px-4 z-40">
        <span className="text-xs font-bold tracking-widest uppercase">
          Thaarakam Manager
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground focus:outline-none p-1"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar Navigation - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-background transform md:translate-x-0 transition-transform duration-200 ease-in-out md:static md:flex md:flex-col ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Title */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/admin" className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-foreground">
              Thaarakam
            </span>
            <span className="text-[9px] uppercase tracking-wider text-secondary mt-0.5">
              Control Panel
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-secondary hover:bg-border/30 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 stroke-[1.8]" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:bg-border/30 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 stroke-[1.8]" />
            Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none"
          >
            <LogOut className="h-4 w-4 stroke-[1.8]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Pane */}
      <main className="flex-1 min-h-[calc(100vh-3.5rem)] md:min-h-screen overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        {children}
      </main>

    </div>
  );
}
