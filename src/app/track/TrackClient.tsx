'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Truck, Package, ExternalLink, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [searching, setSearching] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  const performSearch = async (searchId: string) => {
    const clean = searchId.trim();
    if (!clean) return;

    setSearching(true);
    setNotFound(false);
    setOrderResult(null);

    try {
      // Search by order_number OR tracking_number
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${clean}%,tracking_number.ilike.%${clean}%`)
        .single();

      if (data && !error) {
        setOrderResult(data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performSearch(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10">
      
      {/* Page Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
          India Post Shipment Tracking
        </span>
        <h1 className="text-3xl font-light tracking-wider uppercase text-foreground">
          Track Your Order
        </h1>
        <p className="text-xs text-secondary max-w-md leading-relaxed">
          Enter your Order Number (e.g. THK-123456-789) or India Post Consignment Number (e.g. EK123456789IN) to view real-time delivery status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto w-full">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-secondary">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order # or Tracking #"
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="rounded-xl bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Result Display Card */}
      {orderResult && (
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col gap-6 shadow-sm animate-fadeIn">
          
          {/* Status Badge & Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Order Number</span>
              <h2 className="text-xl font-bold text-foreground">{orderResult.order_number}</h2>
              <span className="text-[10px] text-secondary">Placed on {new Date(orderResult.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                orderResult.shipping_status === 'delivered'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : orderResult.shipping_status === 'shipped'
                    ? 'bg-purple-50 border border-purple-200 text-purple-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}>
                {orderResult.shipping_status === 'delivered' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                Status: {orderResult.shipping_status}
              </span>
            </div>
          </div>

          {/* Consignment Tracking Info */}
          <div className="rounded-xl border border-border bg-border/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Carrier & Consignment Number</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {orderResult.carrier_name || 'India Post'} - {orderResult.tracking_number || 'Awaiting Shipment Dispatch'}
              </span>
            </div>

            {orderResult.tracking_number && (
              <a
                href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Track on India Post Official Portal
              </a>
            )}
          </div>

          {/* Customer Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Customer Details</span>
              <span className="font-semibold text-foreground">{orderResult.customer_name}</span>
              <span className="text-secondary">{orderResult.customer_phone}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Delivery Destination</span>
              <span className="text-foreground">{orderResult.address}, {orderResult.city}, {orderResult.state} - {orderResult.pincode} ({orderResult.country})</span>
            </div>
          </div>

        </div>
      )}

      {notFound && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-background flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-semibold text-foreground">No order found matching "{query}"</p>
          <p className="text-[10px] text-secondary max-w-sm leading-relaxed">
            Please check the Order ID or Consignment Number and try again. If you recently placed an order on WhatsApp, your consignment number will be updated once shipped.
          </p>
        </div>
      )}

      <div className="text-center mt-6">
        <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3 w-3" /> Return to Shop
        </Link>
      </div>

    </div>
  );
}

export default function TrackClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-secondary animate-pulse">
          Loading order tracking...
        </p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
