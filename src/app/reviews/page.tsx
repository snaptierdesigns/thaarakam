'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Star, MessageSquare, Send, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  product_id: string | null;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Filter State
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (reviewsData && !reviewsError) {
          setReviews(reviewsData);

          // Get unique product IDs to fetch product metadata
          const productIds = Array.from(
            new Set(reviewsData.map((r) => r.product_id).filter(Boolean))
          ) as string[];

          if (productIds.length > 0) {
            const { data: productsData } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds);

            if (productsData) {
              const productMap: Record<string, Product> = {};
              productsData.forEach((prod) => {
                productMap[prod.id] = prod;
              });
              setProducts(productMap);
            }
          }
        }
      } catch (err) {
        console.error('Error loading reviews data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    setStatus(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            reviewer_name: reviewerName.trim(),
            rating,
            comment: comment.trim(),
            product_id: null, // General store review
          },
        ])
        .select();

      if (error) {
        console.error(error);
        setStatus('Failed to submit review. Please try again.');
      } else {
        setStatus('Review submitted successfully! Thank you.');
        setReviewerName('');
        setComment('');
        setRating(5);
        if (data) {
          setReviews((prev) => [data[0], ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => {
    const count = reviews.filter((rev) => rev.rating === r).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating: r, count, percentage };
  });

  const filteredReviews = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews;

  return (
    <>
      <Navbar />

      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-center py-2 px-4 text-[10px] uppercase font-bold tracking-[0.15em] select-none">
        ✨ Prepaid Orders Only • Cash On Delivery (COD) is not available ✨
      </div>

      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
              Testimonials
            </span>
            <h1 className="text-3xl font-light tracking-wide uppercase text-foreground sm:text-4xl">
              Customer Reviews
            </h1>
            <div className="h-[1px] w-12 bg-foreground/60 mt-1" />
            <p className="max-w-md text-xs text-secondary mt-2 leading-relaxed">
              Read real customer feedback or leave your own review about your shopping experience with Thaarakam.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            
            {/* Left Column: Summary & Form (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              {/* Rating Summary Card */}
              <div className="rounded-2xl border border-border p-6 bg-background">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  Rating Summary
                </h2>

                {reviews.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-light text-foreground">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(averageRating) ? 'fill-current' : 'stroke-current fill-none'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-secondary font-medium">
                          Based on {reviews.length} customer review{reviews.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div className="flex flex-col gap-2">
                      {ratingCounts.map(({ rating: stars, count, percentage }) => (
                        <button
                          key={stars}
                          onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                          className={`flex items-center gap-3 text-xs w-full text-left p-1 rounded-lg hover:bg-border/20 transition-all ${
                            ratingFilter === stars ? 'bg-border/30 font-semibold' : ''
                          }`}
                        >
                          <span className="w-3 text-secondary">{stars}</span>
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <div className="flex-grow h-2 bg-border/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-secondary text-[10px]">{count}</span>
                        </button>
                      ))}
                    </div>

                    {ratingFilter && (
                      <button
                        onClick={() => setRatingFilter(null)}
                        className="text-[10px] uppercase font-bold text-foreground hover:opacity-80 self-start border-b border-foreground mt-1"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-secondary italic">No reviews recorded yet.</p>
                )}
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 bg-border/5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg p-1.5 border border-border bg-background text-foreground">
                    <MessageSquare className="h-4 w-4 stroke-[1.5]" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Share Your Feedback
                  </h2>
                </div>

                {status && (
                  <p
                    className={`text-xs font-semibold ${
                      status.includes('successfully') ? 'text-green-700' : 'text-red-500'
                    }`}
                  >
                    {status}
                  </p>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    placeholder="e.g. Shalini P."
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                    Rating
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-amber-500 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                      >
                        <Star className={`h-5 w-5 ${star <= rating ? 'fill-current' : 'stroke-current fill-none'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reviewComment" className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                    Comments
                  </label>
                  <textarea
                    id="reviewComment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell us about the quality, finish, packaging, or customer service..."
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-foreground text-background py-3 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>

            </div>

            {/* Right Column: Reviews Grid (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                All Customer Feedback ({filteredReviews.length})
              </h2>

              {loading ? (
                <div className="py-8 text-xs text-secondary italic">Loading testimonials...</div>
              ) : filteredReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-background flex flex-col items-center justify-center gap-3">
                  <MessageSquare className="h-6 w-6 text-secondary/40 stroke-[1.2]" />
                  <p className="text-xs text-secondary font-medium">No reviews matching filter found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredReviews.map((review) => {
                    const relatedProduct = review.product_id ? products[review.product_id] : null;

                    return (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4 hover:border-foreground/20 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-xs font-bold text-foreground">
                              {review.reviewer_name}
                            </span>
                            {relatedProduct ? (
                              <Link
                                href={`/product/${relatedProduct.id}`}
                                className="text-[9px] font-semibold text-secondary hover:text-foreground transition-colors hover:underline"
                              >
                                Verified Purchase: {relatedProduct.name}
                              </Link>
                            ) : (
                              <span className="text-[9px] text-secondary/60">
                                Verified Customer Review
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[10px] text-secondary">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? 'fill-current' : 'stroke-current fill-none'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs leading-relaxed text-secondary select-text italic">
                          "{review.comment}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
