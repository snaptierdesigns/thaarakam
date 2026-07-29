'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { addReviewByAdmin, deleteReview } from '../actions';
import { Star, Trash2, Plus, MessageSquare, ShieldAlert } from 'lucide-react';
import { queryD1 } from '@/lib/d1';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productId, setProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  const fetchReviewsList = async () => {
    try {
      setLoading(true);
      const prodRes = await queryD1("SELECT * FROM products WHERE name != 'General Store Review Placeholder' ORDER BY name");
      if (prodRes.success && prodRes.results) {
        setProducts(prodRes.results as Product[]);
        const map: Record<string, Product> = {};
        prodRes.results.forEach((p: any) => { map[p.id] = p as Product; });
        setProductMap(map);
      }

      const revRes = await queryD1("SELECT * FROM reviews ORDER BY created_at DESC");
      if (revRes.success && revRes.results) {
        setReviews(revRes.results);
      }
    } catch (err) {
      console.error('Error fetching admin reviews data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsList();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    setFormStatus(null);

    const payload = {
      reviewer_name: reviewerName.trim(),
      rating,
      comment: comment.trim(),
      product_id: productId || null,
    };

    const res = await addReviewByAdmin(payload);
    if (res.success) {
      setFormStatus('Review added successfully!');
      setReviewerName('');
      setComment('');
      setRating(5);
      setProductId('');
      fetchReviewsList();
    } else {
      setFormStatus(`Error: ${res.error || 'Failed to save review'}`);
    }
    setSubmitting(false);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    const res = await deleteReview(reviewId);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } else {
      alert(`Failed to delete review: ${res.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-wide uppercase text-foreground">
          Reviews Moderator
        </h1>
        <p className="text-xs text-secondary">
          Add verified customer reviews or remove fake reviews and spam feedback.
        </p>
      </div>

      <hr className="border-border" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        
        {/* Left Side: Add Review Form (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <form onSubmit={handleAddReview} className="rounded-2xl border border-border p-6 bg-border/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-lg p-1.5 border border-border bg-background text-foreground">
                <Plus className="h-4 w-4 stroke-[1.5]" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Add Verified Review
              </h2>
            </div>

            {formStatus && (
              <p
                className={`text-xs font-semibold ${
                  formStatus.includes('successfully') ? 'text-green-700' : 'text-red-500'
                }`}
              >
                {formStatus}
              </p>
            )}

            {/* Reviewer Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminReviewerName" className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                Reviewer Name
              </label>
              <input
                type="text"
                id="adminReviewerName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                placeholder="e.g. Nithara S."
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-foreground/45 focus:outline-none transition-colors"
              />
            </div>

            {/* Rating Stars Selection */}
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

            {/* Associated Product Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminProductId" className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                Associated Product
              </label>
              <select
                id="adminProductId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
              >
                <option value="">General Store Review (No Product)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Comment Body */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminComment" className="text-[9px] font-semibold uppercase tracking-wider text-secondary">
                Comment
              </label>
              <textarea
                id="adminComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                placeholder="Write the customer's testimonial comment here..."
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-foreground/40 focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-foreground text-background py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              {submitting ? 'Adding...' : 'Add Review'}
            </button>
          </form>
        </div>

        {/* Right Side: Reviews Table (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-lg p-1.5 border border-border bg-background text-foreground">
              <MessageSquare className="h-4 w-4 stroke-[1.5]" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Existing Reviews ({reviews.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-secondary italic">Loading feedback history...</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-background flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="h-6 w-6 text-secondary/40 stroke-[1.2]" />
              <p className="text-xs text-secondary font-medium">No reviews are currently stored.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-border/10 text-[9px] uppercase tracking-wider text-secondary">
                      <th className="px-4 py-3 font-semibold">Reviewer</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Associated Product</th>
                      <th className="px-4 py-3 font-semibold">Comment</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reviews.map((r) => {
                      const prod = r.product_id ? productMap[r.product_id] : null;

                      return (
                        <tr key={r.id} className="text-xs hover:bg-border/5 transition-colors">
                          <td className="px-4 py-4 font-semibold whitespace-nowrap">
                            {r.reviewer_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex text-amber-500">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-secondary max-w-[150px] truncate">
                            {prod && prod.name !== 'General Store Review Placeholder' ? prod.name : <span className="italic text-[10px] text-secondary/60">General Store</span>}
                          </td>
                          <td className="px-4 py-4 text-secondary max-w-[250px] truncate" title={r.comment}>
                            {r.comment}
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors focus:outline-none inline-flex"
                              title="Delete review"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
