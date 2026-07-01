import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, ShoppingBag, Tag, CheckCircle2, AlertTriangle, Clock, Plus, Eye } from 'lucide-react';

// Force dynamic rendering to load fresh statistics
export const revalidate = 0;

async function getDashboardStats() {
  try {
    const productsRes = await supabase.from('products').select('category, availability, is_featured, is_preorder');
    const products = productsRes.data || [];

    const total = products.length;
    const featured = products.filter(p => p.is_featured).length;
    const inStock = products.filter(p => p.availability === 'in_stock').length;
    const outOfStock = products.filter(p => p.availability === 'out_of_stock').length;
    const preorder = products.filter(p => p.is_preorder).length;
    
    // Count unique categories currently having products
    const uniqueCats = new Set(products.map(p => p.category));
    const activeCategoriesCount = uniqueCats.size;

    return {
      total,
      featured,
      inStock,
      outOfStock,
      preorder,
      activeCategoriesCount,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      total: 0,
      featured: 0,
      inStock: 0,
      outOfStock: 0,
      preorder: 0,
      activeCategoriesCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { name: 'Total Products', value: stats.total, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Featured Products', value: stats.featured, icon: Tag, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Active Categories', value: stats.activeCategoriesCount, icon: Tag, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'Products In Stock', value: stats.inStock, icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' },
    { name: 'Products Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100' },
    { name: 'Products on Pre Order', value: stats.preorder, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
          Store Dashboard
        </h1>
        <p className="text-xs text-secondary">
          Summary of your catalog status and inventory metrics.
        </p>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="flex flex-col justify-between rounded-2xl border border-border bg-background p-5">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {card.name}
                </span>
                <span className={`rounded-lg p-1.5 border ${card.color}`}>
                  <Icon className="h-4 w-4 stroke-[1.8]" />
                </span>
              </div>
              <span className="text-3xl font-light text-foreground mt-4">
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-border/5 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/products?action=add"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-foreground/35 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-foreground text-background p-2">
                <Plus className="h-4 w-4 stroke-[2]" />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground">Add Product</span>
                <span className="text-[10px] text-secondary">Create a new item in your inventory</span>
              </div>
            </div>
            <span className="text-xs font-medium text-foreground">→</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-foreground/35 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-border text-foreground p-2">
                <Eye className="h-4 w-4 stroke-[2]" />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground">View Products</span>
                <span className="text-[10px] text-secondary">Manage existing catalog inventory</span>
              </div>
            </div>
            <span className="text-xs font-medium text-foreground">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
