'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Settings, CATEGORIES } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  // Fetch settings dynamically
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        if (data && !error) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings for Navbar:', err);
      }
    }
    fetchSettings();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="text-foreground lg:hidden p-1.5 -ml-1.5 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex lg:flex-1 justify-center lg:justify-start">
          <Link href="/" className="flex items-center gap-2">
            {(() => {
              const rawLogoUrl = settings?.logo_url || '';
              const cleanLogoUrl = rawLogoUrl.split('#')[0] || '/images/thaarakaml.png';
              const scaleMatch = rawLogoUrl.match(/#scale=(\d+)/);
              const logoScale = scaleMatch ? Number(scaleMatch[1]) : 100;
              
              const logoSrc = (cleanLogoUrl.startsWith('http') && !cleanLogoUrl.includes('/images/'))
                ? cleanLogoUrl
                : '/images/thaarakaml.png';

              return (
                <img
                  src={logoSrc}
                  alt={settings?.business_name || 'Thaarakam'}
                  style={{ height: `${32 * (logoScale / 100)}px` }}
                  className="max-w-[200px] object-contain transition-all duration-300"
                />
              );
            })()}
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex lg:gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                pathname === link.href ? 'text-foreground font-semibold' : 'text-secondary'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Categories Dropdown */}
          <div className="relative group">
            <button
              onMouseEnter={() => setCategoriesOpen(true)}
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-foreground/80 focus:outline-none"
            >
              Categories
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            {/* Dropdown Menu */}
            <div
              onMouseLeave={() => setCategoriesOpen(false)}
              className={`absolute top-full -left-4 mt-2 w-56 rounded-xl border border-border bg-background p-2 shadow-sm transition-all duration-200 ${
                categoriesOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
              }`}
            >
              <div className="grid gap-1">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/shop?category=${encodeURIComponent(category)}`}
                    className="block rounded-lg px-3 py-2 text-xs text-secondary hover:bg-border/30 hover:text-foreground transition-all duration-150"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/#about"
            className="text-sm font-medium text-secondary transition-colors hover:text-foreground/80"
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
              pathname === '/contact' ? 'text-foreground font-semibold' : 'text-secondary'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Cart Icon */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <Link href="/cart" className="relative p-1.5 text-foreground hover:opacity-85 transition-opacity" aria-label="View Cart">
            <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 shadow-lg animate-fadeIn duration-200">
          <div className="flex flex-col gap-y-4">
            <Link
              href="/"
              className={`text-sm font-medium ${pathname === '/' ? 'text-foreground font-semibold' : 'text-secondary'}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium ${pathname === '/shop' ? 'text-foreground font-semibold' : 'text-secondary'}`}
            >
              Shop
            </Link>
            
            {/* Mobile Categories list */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-xs text-secondary hover:text-foreground py-1"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/#about"
              className="text-sm font-medium text-secondary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium ${pathname === '/contact' ? 'text-foreground font-semibold' : 'text-secondary'}`}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
