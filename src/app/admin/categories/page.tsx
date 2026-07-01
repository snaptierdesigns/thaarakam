import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/types';
import { Eye, Layers } from 'lucide-react';

// Force dynamic rendering to load fresh configurations
export const revalidate = 0;

async function getCategoryMetrics() {
  try {
    const { data: products } = await supabase.from('products').select('category, availability, is_preorder');
    const list = products || [];

    // Map each category to its details
    return CATEGORIES.map((cat) => {
      const catProducts = list.filter((p) => p.category === cat);
      const total = catProducts.length;
      const outOfStock = catProducts.filter((p) => p.availability === 'out_of_stock').length;
      const preorder = catProducts.filter((p) => p.is_preorder).length;

      return {
        name: cat,
        total,
        outOfStock,
        preorder,
      };
    });
  } catch (error) {
    console.error('Error calculating category metrics:', error);
    return CATEGORIES.map((cat) => ({
      name: cat,
      total: 0,
      outOfStock: 0,
      preorder: 0,
    }));
  }
}

export default async function AdminCategoriesPage() {
  const categoriesData = await getCategoryMetrics();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
          Product Categories
        </h1>
        <p className="text-xs text-secondary">
          Predefined category inventory and stock metrics distribution.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesData.map((cat) => (
          <div
            key={cat.name}
            className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between hover:border-foreground/20 transition-colors"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-sm font-semibold text-foreground tracking-wide line-clamp-2">
                  {cat.name}
                </h2>
                <span className="rounded-lg p-1.5 border bg-border/20 text-secondary">
                  <Layers className="h-4 w-4 stroke-[1.8]" />
                </span>
              </div>

              {/* Counts Stack */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-border/60">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-secondary font-bold">Total</span>
                  <span className="text-lg font-light text-foreground mt-0.5">{cat.total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-secondary font-bold">Stock Out</span>
                  <span className={`text-lg font-light mt-0.5 ${cat.outOfStock > 0 ? 'text-red-600 font-normal' : 'text-foreground'}`}>
                    {cat.outOfStock}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-secondary font-bold">Pre Order</span>
                  <span className="text-lg font-light text-foreground mt-0.5">{cat.preorder}</span>
                </div>
              </div>
            </div>

            {/* Quick View Link */}
            <div className="mt-8 pt-4 border-t border-border/40 flex justify-end">
              <Link
                href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-foreground hover:border-foreground/30 transition-all"
              >
                <Eye className="h-3.5 w-3.5" />
                View Products
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
