import React, { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ShopClient from './ShopClient';
import { supabase, logSupabaseError } from '@/lib/supabase';
import { Product } from '@/types';

// Enable Incremental Static Regeneration (ISR) to cache catalog on CDN Edge for 24 hours (updates are still instant via on-demand revalidation)
export const revalidate = 86400;

async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('name', 'General Store Review Placeholder')
      .order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('Fetching products for Shop catalog', error);
      return [];
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      
      <main className="flex-grow bg-background">
        <Suspense fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-20 text-center">
            <p className="text-xs text-secondary animate-pulse">Loading catalog...</p>
          </div>
        }>
          <ShopClient products={products} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
