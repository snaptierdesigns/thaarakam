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
