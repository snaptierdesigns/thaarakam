'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/components/ui/CartProvider';
import { ChevronLeft, ChevronRight, Plus, Minus, Check } from 'lucide-react';

interface ProductDetailsClientProps {
  product: Product;
  defaultDescription: string;
}

export default function ProductDetailsClient({ product, defaultDescription }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartFeedback, setAddedToCartFeedback] = useState(false);

  const images = product.images.length > 0 ? product.images : ['/images/placeholder.jpg'];
  const isOutOfStock = product.availability === 'out_of_stock';
  const isPreorder = product.is_preorder;
  const canAddToCart = !isOutOfStock || isPreorder;

  // Generate sizes from 1 to max_size (if requires_size is true and max_size is set)
  const sizeOptions: number[] = [];
  if (product.requires_size && product.max_size) {
    for (let i = 1; i <= product.max_size; i++) {
      sizeOptions.push(i);
    }
  }

  // Handle quantity adjustment
  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  // Assemble the description
  const fullDescription = [
    defaultDescription,
    product.description
  ].filter(Boolean).join('\n\n* \n\n');

  // Handle Add to Cart action
  const handleAddToCart = () => {
    if (!canAddToCart) return;
    if (product.requires_size && selectedSize === null) {
      alert('Please select a size before adding to the cart.');
      return;
    }

    addToCart(product, quantity, selectedSize);
    
    // Trigger visual button feedback
    setAddedToCartFeedback(true);
    setTimeout(() => {
      setAddedToCartFeedback(false);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb link */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3 w-3 stroke-[3]" />
          Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        
        {/* Left Side: Image Gallery (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Large Image Display */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-border/20 border border-border/40">
            
            {/* Nav Arrows (only if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-sm hover:opacity-85 focus:outline-none transition-opacity z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-sm hover:opacity-85 focus:outline-none transition-opacity z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <img
              src={images[activeImageIndex]}
              alt={`${product.name} - View ${activeImageIndex + 1}`}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* Desktop Thumbnails (Row beneath main view) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-background transition-all ${
                    idx === activeImageIndex
                      ? 'border-foreground ring-1 ring-foreground/20'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Product Actions & Description (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-4">
          
          {/* Header Info */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
              {product.category}
            </span>
            <h1 className="text-2xl font-light tracking-wide text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <p className="text-xl font-semibold mt-1">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
          </div>

          <hr className="border-border" />

          {/* Status Badges & Descriptions */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-secondary">Availability:</span>
            {isPreorder ? (
              <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">
                Pre Order
              </span>
            ) : isOutOfStock ? (
              <span className="text-secondary font-semibold uppercase tracking-wider text-[10px] line-through">
                Out of Stock
              </span>
            ) : (
              <span className="text-green-700 font-semibold uppercase tracking-wider text-[10px]">
                In Stock
              </span>
            )}
          </div>

          {/* Sizes Toggle */}
          {product.requires_size && sizeOptions.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Select Size
              </span>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 w-9 rounded-full border text-xs font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-foreground border-foreground text-background'
                        : 'bg-background border-border text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize === null && (
                <p className="text-[10px] text-red-500 font-medium">* Please choose a size to continue</p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          {canAddToCart && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Quantity
              </span>
              <div className="inline-flex items-center self-start rounded-xl border border-border bg-background p-1">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="rounded-lg p-1.5 text-secondary hover:text-foreground hover:bg-border/20 transition-all focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="rounded-lg p-1.5 text-secondary hover:text-foreground hover:bg-border/20 transition-all focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="mt-2 flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider text-background transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                !canAddToCart
                  ? 'bg-border text-secondary cursor-not-allowed'
                  : addedToCartFeedback
                    ? 'bg-green-700 text-background'
                    : 'bg-foreground hover:opacity-90'
              }`}
            >
              {addedToCartFeedback ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Cart
                </>
              ) : isPreorder ? (
                'Pre Order Now'
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>

          <hr className="border-border" />

          {/* Editorial Product Description Block */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Description & Care
            </h3>
            <div className="whitespace-pre-line text-xs leading-relaxed text-secondary select-text">
              {fullDescription}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
