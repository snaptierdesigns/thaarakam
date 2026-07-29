import React, { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CartClient from '@/components/ui/CartClient';
import { queryD1 } from '@/lib/d1';
import { Settings } from '@/types';

// Enable 24-hour caching (updates are revalidated instantly when settings change)
export const revalidate = 86400;

async function getSettings() {
  try {
    const res = await queryD1('SELECT * FROM settings WHERE id = 1 LIMIT 1');
    if (res.success && res.results.length > 0) {
      return res.results[0] as Settings;
    }
    return null;
  } catch (error) {
    console.error('Unexpected error fetching settings for Cart page:', error);
    return null;
  }
}

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <>
      <Navbar />
      
      <main className="flex-grow bg-background">
        <Suspense fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-20 text-center">
            <p className="text-xs text-secondary animate-pulse">Loading cart details...</p>
          </div>
        }>
          <CartClient settings={settings} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
