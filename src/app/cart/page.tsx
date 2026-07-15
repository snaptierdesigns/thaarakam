import React, { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CartClient from '@/components/ui/CartClient';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/types';

// Enable 24-hour caching (updates are revalidated instantly when settings change)
export const revalidate = 86400;

async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings for Cart page:', error);
      return null;
    }
    return data as Settings;
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
