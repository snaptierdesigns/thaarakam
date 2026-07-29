'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductDetailsClient from './[id]/ProductDetailsClient';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

function ProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [product, setProduct] = useState<Product | null>(null);
  const [defaultDescription, setDefaultDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      router.replace('/shop');
      return;
    }

    async function loadProductData() {
      try {
        setLoading(true);
        setError(false);

        // 1. Try loading from Cloudflare CDN static asset (0 BYTES Supabase Egress!)
        try {
          const res = await fetch('/data/products.json');
          if (res.ok) {
            const cdnData: Product[] = await res.json();
            const found = cdnData.find((p) => p.id === id);
            if (found) {
              setProduct(found);
              setDefaultDescription(
                'Details\n• Material: 316L Stainless Steel\n• Finish: Anti-tarnish, High Polish\n• Lightweight & comfortable for all-day wear\n• Hypoallergenic & skin-friendly\n\nCare\nAvoid harsh chemicals and perfumes.\nWipe gently after use and store in a dry place for extended shine.'
              );
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('CDN asset load fallback:', e);
        }

        // 2. Fallback to Supabase if newly added or not in CDN file
        const [productRes, settingsRes] = await Promise.all([
          supabase.from('products').select('*').eq('id', id).single(),
          supabase.from('settings').select('*').eq('id', 1).single()
        ]);

        if (productRes.error || !productRes.data) {
          console.error('Error fetching product:', productRes.error);
          setError(true);
          return;
        }

        setProduct(productRes.data as Product);
        if (settingsRes.data) {
          setDefaultDescription(settingsRes.data.default_description || '');
        }
      } catch (err) {
        console.error('Unexpected error loading product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-secondary animate-pulse">
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <h2 className="text-xl font-light uppercase tracking-wider text-foreground">
          Product Not Found
        </h2>
        <p className="max-w-md text-xs text-secondary leading-relaxed">
          The product you are looking for might have been removed, or the link is invalid.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-4 px-6 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded-full font-medium"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return <ProductDetailsClient product={product} defaultDescription={defaultDescription} />;
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs uppercase tracking-widest text-secondary animate-pulse">
              Loading product details...
            </p>
          </div>
        }>
          <ProductContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
