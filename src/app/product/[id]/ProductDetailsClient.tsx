'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/components/ui/CartProvider';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProductDetailsClientProps {
  product: Product;
  defaultDescription: string;
}

export default function ProductDetailsClient({ product, defaultDescription }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartFeedback, setAddedToCartFeedback] = useState(false);

  // Fetch live product details on mount so price/stock edits reflect instantly
  useEffect(() => {
    async function fetchLiveProduct() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', product.id)
          .single();
        if (data) {
          setCurrentProduct(data as Product);
        }
      } catch (e) {
        console.error('Error fetching live product details:', e);
      }
    }
    fetchLiveProduct();
  }, [product.id]);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });
        if (data && !error) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmittingReview(true);
    setReviewStatus(null);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: product.id,
            reviewer_name: reviewerName.trim(),
            rating,
            comment: comment.trim(),
          }
        ])
        .select();

      if (error) {
        console.error(error);
        setReviewStatus('Failed to submit review.');
      } else {
        setReviewStatus('Review submitted successfully!');
        setReviewerName('');
        setComment('');
        setRating(5);
        if (data) {
          setReviews(prev => [data[0], ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
      setReviewStatus('An unexpected error occurred.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : ['/images/placeholder.jpg'];
  const isOutOfStock = currentProduct.availability === 'out_of_stock';
  const isPreorder = currentProduct.is_preorder;
  const canAddToCart = !isOutOfStock || isPreorder;

  // Generate sizes from 1 to max_size (if requires_size is true and max_size is set)
  const sizeOptions: number[] = [];
  if (currentProduct.requires_size && currentProduct.max_size) {
    for (let s = 1; s <= currentProduct.max_size; s++) {
      sizeOptions.push(s);
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
    currentProduct.description
  ].filter(Boolean).join('\n\n* \n\n');

  // Handle Add to Cart action
  const handleAddToCart = () => {
    if (!canAddToCart) return;
    if (currentProduct.requires_size && selectedSize === null) {
      alert('Please select a size before adding to the cart.');
      return;
    }

    addToCart(currentProduct, quantity, selectedSize);
    
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

            <Image
              src={images[activeImageIndex]}
              alt={`${currentProduct.name} - View ${activeImageIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-all duration-300"
              priority
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
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
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
              {currentProduct.category}
            </span>
            <h1 className="text-2xl font-light tracking-wide text-foreground sm:text-3xl">
              {currentProduct.name}
            </h1>
            <p className="text-xl font-semibold mt-1">
              ₹{Number(currentProduct.price).toLocaleString('en-IN')}
            </p>
          </div>

          <hr className="border-border" />

          {/* Status Badges & Descriptions */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-secondary">Availability:</span>
              {isPreorder ? (
                <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Pre Order
                </span>
              ) : isOutOfStock ? (
                <span className="text-red-700 font-semibold uppercase tracking-wider text-[10px]">
                  Out of Stock
                </span>
              ) : (
                <span className="text-green-700 font-semibold uppercase tracking-wider text-[10px]">
                  In Stock
                </span>
              )}
            </div>

            {/* Stock Count Display */}
            {!isOutOfStock && product.stock_count !== null && product.stock_count !== undefined && (
              <div className="mt-1">
                {product.stock_count <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 select-none animate-pulse">
                    ⚠️ Only {product.stock_count} item{product.stock_count > 1 ? 's' : ''} left in stock!
                  </span>
                ) : (
                  <span className="text-[10px] text-secondary font-medium">
                    ({product.stock_count} units available)
                  </span>
                )}
              </div>
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

      {/* Reviews Section */}
      <div className="mt-20 border-t border-border pt-16 animate-fadeIn" id="reviews">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Reviews Left Column: Summary & Write a Review Form (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
                Feedback
              </span>
              <h2 className="text-xl font-light tracking-wide uppercase text-foreground">
                Customer Reviews
              </h2>
              
              {/* Avg Rating summary */}
              {reviews.length > 0 ? (
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                      return (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(avg) ? 'fill-current' : 'stroke-current fill-none'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} out of 5
                  </span>
                  <span className="text-[10px] text-secondary">
                    ({reviews.length} review{reviews.length > 1 ? 's' : ''})
                  </span>
                </div>
              ) : (
                <p className="text-xs text-secondary mt-1.5 italic">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>


          </div>

          {/* Reviews Right Column: List of Reviews (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Customer Feedback ({reviews.length})
            </h3>
            
            {loadingReviews ? (
              <p className="text-xs text-secondary italic">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-background flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-secondary font-medium">No customer feedback yet.</p>
                <p className="text-[10px] text-secondary/60">Bought this product? Share your experience with others above!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {review.reviewer_name}
                      </span>
                      <span className="text-[10px] text-secondary">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'stroke-current fill-none'}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs leading-relaxed text-secondary italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
