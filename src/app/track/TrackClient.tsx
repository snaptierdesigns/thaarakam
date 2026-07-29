'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Truck, Package, ExternalLink, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { queryD1 } from '@/lib/d1';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [searching, setSearching] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [consignmentOnly, setConsignmentOnly] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const performSearch = async (searchId: string) => {
    const rawClean = searchId.trim().replace(/^#/, '');
    const cleanNoHyphens = rawClean.replace(/[^a-zA-Z0-9]/g, '');
    if (!rawClean) return;

    setSearching(true);
    setNotFound(false);
    setOrderResult(null);
    setConsignmentOnly(null);

    const isIndiaPostConsignment = /^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(cleanNoHyphens) || /^[A-Z]{2}\d{9}/i.test(cleanNoHyphens);

    try {
      // Search D1 by order_number, tracking_number, or phone
      const res = await queryD1(
        `SELECT * FROM orders 
         WHERE LOWER(order_number) LIKE ? 
            OR LOWER(COALESCE(tracking_number, '')) LIKE ? 
            OR REPLACE(LOWER(order_number), '-', '') LIKE ? 
            OR REPLACE(LOWER(COALESCE(tracking_number, '')), '-', '') LIKE ? 
            OR customer_phone LIKE ? 
         ORDER BY created_at DESC LIMIT 1`,
        [
          `%${rawClean.toLowerCase()}%`,
          `%${rawClean.toLowerCase()}%`,
          `%${cleanNoHyphens.toLowerCase()}%`,
          `%${cleanNoHyphens.toLowerCase()}%`,
          `%${cleanNoHyphens}%`
        ]
      );

      if (res.success && res.results && res.results.length > 0) {
        setOrderResult(res.results[0]);
      } else if (isIndiaPostConsignment) {
        setConsignmentOnly(rawClean.toUpperCase());
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      if (isIndiaPostConsignment) {
        setConsignmentOnly(rawClean.toUpperCase());
      } else {
        setNotFound(true);
      }
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

  let itemsList: any[] = [];
  if (orderResult && orderResult.items) {
    try {
      itemsList = typeof orderResult.items === 'string' ? JSON.parse(orderResult.items) : orderResult.items;
    } catch (e) {
      itemsList = [];
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10">
      
      {/* Page Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
          Shipment Tracking Portal
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
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none transition-colors font-mono"
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
              <h2 className="text-xl font-bold text-foreground font-mono">{orderResult.order_number}</h2>
              <span className="text-[10px] text-secondary">Placed on {new Date(orderResult.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                orderResult.shipping_status === 'delivered'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : orderResult.shipping_status === 'shipped'
                    ? 'bg-purple-50 border border-purple-200 text-purple-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}>
                {orderResult.shipping_status === 'delivered' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600" />
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
                href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Track on India Post
              </a>
            )}
          </div>

          {/* Items Summary Breakdown */}
          {itemsList.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Ordered Items</span>
              <div className="divide-y divide-border/60">
                {itemsList.map((it: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{it.name || it.product?.name || 'Jewellery Item'}</span>
                      {it.selectedSize && <span className="ml-2 text-[10px] text-secondary">Size: {it.selectedSize}</span>}
                      {it.quantity > 1 && <span className="ml-2 text-[10px] text-secondary">x{it.quantity}</span>}
                    </div>
                    <span className="font-semibold text-foreground">₹{((it.price || it.product?.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-t border-border pt-3 mt-1 text-foreground">
                <span>Total Paid</span>
                <span>₹{(orderResult.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

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

      {/* Active India Post Consignment Direct Result Card */}
      {consignmentOnly && !orderResult && (
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col gap-6 shadow-sm animate-fadeIn">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">India Post Consignment</span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground font-mono">{consignmentOnly}</h2>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(consignmentOnly);
                    alert(`Consignment Number ${consignmentOnly} copied to clipboard!`);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-border bg-border/20 hover:bg-border/40 text-[10px] font-semibold text-foreground transition-all flex items-center gap-1"
                >
                  Copy Code
                </button>
              </div>
              <span className="text-[10px] text-secondary">Carrier: India Post Speed Post / Registered Parcel</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800">
                <Truck className="h-4 w-4 text-purple-600 animate-pulse" />
                Status: Dispatched & In Transit
              </span>
            </div>
          </div>

          {/* Live API & Portal Query Options */}
          <div className="rounded-xl border border-border bg-emerald-50/40 p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                Active India Post Shipment Detected
              </span>
              <span className="text-[11px] text-emerald-900 leading-relaxed">
                Consignment <strong>{consignmentOnly}</strong> is being processed by India Post. Choose an option below to view real-time location & article status:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`https://t.17track.net/en#nums=${consignmentOnly}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="h-4 w-4 text-emerald-400" />
                Track Live on 17Track API
              </a>

              <a
                href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-foreground/30 bg-background px-5 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-border/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="h-4 w-4 text-secondary" />
                India Post Official Portal
              </a>
            </div>
          </div>

        </div>
      )}

      {notFound && !consignmentOnly && (
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
