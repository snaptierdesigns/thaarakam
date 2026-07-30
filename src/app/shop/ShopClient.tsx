'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { Product, CATEGORIES } from '@/types';
import { supabase } from '@/lib/supabase';
import { Search, X } from 'lucide-react';

interface ShopClientProps {
  products: Product[];
}

// Helper to fix category parameters truncated by social media/in-app browsers (e.g., splitting on '&')
function normalizeCategory(param: string | null): string | null {
  if (!param) return null;
  
  const decoded = decodeURIComponent(param).trim().toLowerCase();

  // 1. Direct match (case-insensitive)
  const exactMatch = CATEGORIES.find(c => c.toLowerCase() === decoded);
  if (exactMatch) return exactMatch;

  // 2. Specific cut-off cases due to Android/Instagram URL parameter splitting on '&'
  if (decoded === 'earrings') {
    return 'Earrings & Studs';
  }
  if (decoded === 'nose rings') {
    return 'Nose Rings & Nose Pins';
  }

  // 3. Prefix/Fuzzy match (for split URLs or truncated strings)
  const prefixMatch = CATEGORIES.find(c => c.toLowerCase().startsWith(decoded));
  if (prefixMatch) return prefixMatch;

  return param;
}

export default function ShopClient({ products }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = normalizeCategory(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [productsList, setProductsList] = useState<Product[]>(products);

  // Sync category state with URL parameter changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Sync products list whenever props change
  useEffect(() => {
    if (products && products.length > 0) {
      setProductsList(products);
    }
  }, [products]);

  // Fallback loading if initial props were empty
  useEffect(() => {
    if (productsList && productsList.length > 0) return;

    async function fetchCdnProducts() {
      try {
        const res = await fetch('/data/products.json');
        if (res.ok) {
          const cdnData = await res.json();
          if (cdnData && Array.isArray(cdnData) && cdnData.length > 0) {
            setProductsList(cdnData as Product[]);
            return;
          }
        }
      } catch (e) {
        console.warn('CDN static asset load fallback to Supabase:', e);
      }

      // Fallback to Supabase only if CDN asset fails
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .neq('name', 'General Store Review Placeholder')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setProductsList(data as Product[]);
        }
      } catch (e) {
        console.error('Error fetching products:', e);
      }
    }
    fetchCdnProducts();
  }, [productsList]);

  // Set category filter and update URL parameter
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    handleCategorySelect(null);
  };

  // Filter products based on search query and category selection
  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
      
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = searchLower
      ? product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Editorial Title */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl font-light tracking-wider uppercase text-foreground">
          Shop Collection
        </h1>
        <p className="text-xs text-secondary">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-border">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-secondary/60">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3.5 flex items-center text-secondary hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Category Pill selector (horizontal scroll on mobile) */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none flex items-center gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`rounded-full px-4 py-2 text-[10px] font-semibold tracking-wider uppercase border transition-all whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-foreground border-foreground text-background'
                : 'bg-background border-border text-secondary hover:border-foreground/35 hover:text-foreground'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`rounded-full px-4 py-2 text-[10px] font-semibold tracking-wider uppercase border transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-foreground border-foreground text-background'
                  : 'bg-background border-border text-secondary hover:border-foreground/35 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      </div>

      {/* Active filters summary */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2.5 flex-wrap mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Active Filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-border/40 px-2.5 py-1 text-[10px] text-foreground font-medium border border-border">
              {selectedCategory}
              <button onClick={() => handleCategorySelect(null)} className="hover:text-foreground/75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-border/40 px-2.5 py-1 text-[10px] text-foreground font-medium border border-border">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-foreground/75">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-[10px] font-semibold uppercase tracking-wider text-foreground hover:underline ml-1.5"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
          <p className="text-sm text-secondary italic">No products found matching your selections.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 rounded-xl bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
