'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Settings, CATEGORIES } from '@/types';

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);

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
        console.error('Error fetching settings for Footer:', err);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold tracking-[0.2em] uppercase text-foreground">
                {settings?.business_name || 'THAARAKAM'}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-secondary">
              Premium, elegant, and minimal fine jewellery curated for modern sophistication. Simple booking, delivered to your door.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://www.instagram.com/thaarakam_by_nithara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-secondary hover:text-foreground transition-all duration-200 flex items-center gap-1.5"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.885.058 1.012.046 1.724.207 2.2.39a4.121 4.121 0 011.51 1.04 4.08 4.08 0 011.04 1.51c.182.476.343 1.188.39 2.2.049 1.1.058 1.455.058 3.885 0 2.43-.008 2.784-.058 3.885-.046 1.012-.207 1.724-.39 2.2a4.121 4.121 0 01-1.04 1.51 4.08 4.08 0 01-1.51 1.04c-.476.182-1.188.343-2.2.39-1.1.049-1.455.058-3.885.058-2.43 0-2.784-.008-3.885-.058-1.012-.046-1.724-.207-2.2-.39a4.122 4.122 0 01-1.51-1.04 4.08 4.08 0 01-1.04-1.51c-.182-.476-.343-1.188-.39-2.2-.049-1.1-.058-1.455-.058-3.885 0-2.43.008-2.784.058-3.885.046-1.012.207-1.724.39-2.2a4.122 4.122 0 011.04-1.51 4.08 4.08 0 011.51-1.04c.476-.182 1.188-.343 2.2-.39 1.1-.049 1.455-.058 3.885-.058zm-.21 2.32c-2.405 0-2.685.009-3.637.052-.876.04-1.352.186-1.669.31-.42.163-.72.358-1.036.673a3.111 3.111 0 00-.673 1.036c-.124.317-.27.793-.31 1.669-.043.952-.052 1.232-.052 3.637s.009 2.685.052 3.637c.04.876.186 1.352.31 1.669.163.42.358.72.673 1.036.317.317.617.512 1.036.673.317.124.793.27 1.669.31.952.043 1.232.052 3.637.052s2.685-.009 3.637-.052c.876-.04 1.352-.186 1.669-.31.42-.163.72-.358 1.036-.673.317-.317.512-.617.673-1.036.124-.317.27-.793.31-1.669.043-.952.052-1.232.052-3.637s-.009-2.685-.052-3.637c-.04-.876-.186-1.352-.31-1.669a3.111 3.111 0 00-.673-1.036 3.116 3.116 0 00-1.036-.673c-.317-.124-.793-.27-1.669-.31-.952-.043-1.233-.052-3.637-.052zm0 3.262a4.418 4.418 0 100 8.837 4.418 4.418 0 000-8.837zm0 7.037a2.62 2.62 0 110-5.24 2.62 2.62 0 010 5.24zm4.877-7.204a1.03 1.03 0 11-2.06 0 1.03 1.03 0 012.06 0z" clipRule="evenodd" />
                </svg>
                <span>@thaarakam_by_nithara</span>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 sm:grid-cols-3">
            
            {/* Nav Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Navigation
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Shop Collection
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="text-xs text-secondary hover:text-foreground transition-colors">
                    About Brand
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Customer Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="text-xs text-secondary hover:text-foreground transition-colors">
                    Shipping Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Top Categories */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Categories
              </p>
              <ul className="mt-4 space-y-2">
                {CATEGORIES.slice(0, 4).map((category) => (
                  <li key={category}>
                    <Link
                      href={`/shop?category=${encodeURIComponent(category)}`}
                      className="text-xs text-secondary hover:text-foreground transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
                {CATEGORIES.length > 4 && (
                  <li>
                    <Link href="/shop" className="text-xs text-foreground/80 hover:text-foreground font-medium transition-colors">
                      Browse All →
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Details */}
            <div className="col-span-2 sm:col-span-1" id="contact">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Contact
              </p>
              <ul className="mt-4 space-y-2">
                {settings?.whatsapp_number && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-secondary hover:text-foreground transition-colors"
                    >
                      WhatsApp: {settings.whatsapp_number}
                    </a>
                  </li>
                )}
                {settings?.store_email && (
                  <li>
                    <a
                      href={`mailto:${settings.store_email}`}
                      className="text-xs text-secondary hover:text-foreground transition-colors"
                    >
                      Email: {settings.store_email}
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="https://www.instagram.com/thaarakam_by_nithara"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-secondary hover:text-foreground transition-colors"
                  >
                    Instagram: @thaarakam_by_nithara
                  </a>
                </li>
                <li className="text-xs text-secondary leading-relaxed">
                  Kerala, India
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary">
            &copy; {new Date().getFullYear()} {settings?.business_name || 'Thaarakam'} Jewellery. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="text-[10px] uppercase tracking-wider text-secondary/65 hover:text-foreground transition-colors">
              Store Manager Login
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
