import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductDetailsClient from './ProductDetailsClient';
import { supabase } from '@/lib/supabase';
import { Product, Settings } from '@/types';

// Enable Incremental Static Regeneration (ISR) to cache product details on CDN Edge for 24 hours (updates are still instant via on-demand revalidation)
export const revalidate = 86400;

type Params = Promise<{ id: string }>;

interface ProductPageProps {
  params: Params;
}

// Pre-render product pages at build time
export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id');

    if (products && products.length > 0) {
      return products.map((product) => ({
        id: product.id,
      }));
    }
    return [{ id: '7d6c7cd4-f8d2-4f03-98d2-4605a1cbc9d6' }];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [{ id: '7d6c7cd4-f8d2-4f03-98d2-4605a1cbc9d6' }];
  }
}

async function getProductData(id: string) {
  try {
    const productPromise = supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    const settingsPromise = supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const [productRes, settingsRes] = await Promise.all([
      productPromise,
      settingsPromise,
    ]);

    if (productRes.error || !productRes.data) {
      console.error('Error fetching product:', productRes.error);
      return null;
    }

    return {
      product: productRes.data as Product,
      settings: settingsRes.data as Settings | null,
    };
  } catch (error) {
    console.error('Unexpected error in getProductData:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.id);

  if (!data) {
    notFound();
  }

  const { product, settings } = data;
  const defaultDescription = settings?.default_description || '';

  return (
    <>
      <Navbar />
      
      <main className="flex-grow bg-background">
        <ProductDetailsClient
          product={product}
          defaultDescription={defaultDescription}
        />
      </main>

      <Footer />
    </>
  );
}
