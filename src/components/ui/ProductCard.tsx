import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.images?.[0] || '/images/placeholder.jpg';
  const isOutOfStock = product.availability === 'out_of_stock';
  const isPreorder = product.is_preorder;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-border/20 border border-border/40">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isPreorder && (
            <span className="inline-flex items-center rounded-md bg-foreground text-background px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">
              Pre Order
            </span>
          )}
          {isOutOfStock && !isPreorder && (
            <span className="inline-flex items-center rounded-md bg-border border border-border/80 text-secondary px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Cover image with group hover zoom */}
        <img
          src={coverImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product metadata */}
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-wider text-secondary">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold mt-0.5">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  );
}
