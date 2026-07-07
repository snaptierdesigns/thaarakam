import React, { Suspense } from 'react';
import ProductsClient from './ProductsClient';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

// Force dynamic rendering to load fresh configurations
export const revalidate = 0;

async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('name', 'General Store Review Placeholder')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products for admin Products page:', error);
      return [];
    }

    return (data || []) as Product[];
  } catch (error) {
    console.error('Unexpected error fetching products for admin Products page:', error);
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <p className="text-xs text-secondary animate-pulse">Loading products inventory...</p>
      </div>
    }>
      <ProductsClient initialProducts={products} />
    </Suspense>
  );
}
