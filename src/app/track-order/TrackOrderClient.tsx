'use client';

import React, { useState } from 'react';
import { Package, Search, ExternalLink, ShieldCheck, Truck, ArrowRight, RefreshCw } from 'lucide-react';

export default function TrackOrderClient() {
  const [consignmentNumber, setConsignmentNumber] = useState('');
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = consignmentNumber.trim().toUpperCase().replace(/\s/g, '');
    if (!cleanNum) {
      setError('Please enter a valid Consignment Number.');
      return;
    }
    setError('');
    setActiveTrackingNumber(cleanNum);
  };

  const get17TrackUrl = (num: string) => {
    return `https://t.17track.net/en#nums=${num}&fc=190011`;
  };

  const getIndiaPostUrl = () => {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Title & Subtitle */}
      <div className="flex flex-col items-center text-center gap-3 mb-10">
        <div className="rounded-full bg-border/40 p-4 text-foreground mb-1">
          <Truck className="h-8 w-8 stroke-[1.5]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
          India Post Consignment Tracking
        </span>
        <h1 className="text-3xl font-light tracking-wide uppercase text-foreground sm:text-4xl">
          Track Your Order
        </h1>
        <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
          Enter your 13-digit Speed Post or Registered Parcel consignment number below to view real-time delivery status.
        </p>
      </div>

      {/* Consignment Tracking Form */}
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="consignmentNumber" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Consignment Number *
            </label>
            <div className="relative">
              <input
                type="text"
                id="consignmentNumber"
                value={consignmentNumber}
                onChange={(e) => {
                  setConsignmentNumber(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. ET123456789IN or RM987654321IN"
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground uppercase tracking-widest placeholder:text-secondary/40 placeholder:normal-case focus:border-foreground/50 focus:outline-none transition-colors"
              />
              {consignmentNumber && (
                <button
                  type="button"
                  onClick={() => {
                    setConsignmentNumber('');
                    setActiveTrackingNumber(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary hover:text-foreground"
                >
                  CLEAR
                </button>
              )}
            </div>
            {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-foreground text-background py-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="h-4 w-4" /> Track Shipment
          </button>
        </form>
      </div>

      {/* Tracking Result View */}
      {activeTrackingNumber && (
        <div className="mt-10 flex flex-col gap-6 animate-fadeIn duration-300">
          
          <div className="rounded-2xl border border-border bg-border/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-foreground text-background p-3">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                  Carrier: India Post (Speed Post)
                </span>
                <span className="text-base font-bold font-mono text-foreground tracking-widest">
                  {activeTrackingNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={get17TrackUrl(activeTrackingNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm"
              >
                Track on 17Track <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href={getIndiaPostUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:border-foreground/40 transition-all"
              >
                India Post Official Portal <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Embedded 17Track Tracker iFrame Container */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
            <div className="border-b border-border bg-border/10 px-6 py-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-secondary animate-spin" />
                Live Tracking Portal
              </span>
              <span className="text-[10px] text-secondary font-mono">
                Consignment #{activeTrackingNumber}
              </span>
            </div>
            
            <div className="w-full h-[650px] bg-background">
              <iframe
                src={`https://t.17track.net/en#nums=${activeTrackingNumber}`}
                title={`Track ${activeTrackingNumber}`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      )}

      {/* Helpful Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Where is my consignment number?
          </span>
          <p className="text-xs text-secondary leading-relaxed">
            Your 13-digit consignment number (e.g. ET123456789IN) is sent to your registered phone number via SMS/WhatsApp once your order is dispatched.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Delivery Timelines
          </span>
          <p className="text-xs text-secondary leading-relaxed">
            Speed Post shipments within South India take 2-4 business days. Rest of India shipments take 4-7 business days.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Need Help with Delivery?
          </span>
          <p className="text-xs text-secondary leading-relaxed">
            Reach out to our customer care team on WhatsApp at <strong>+91 89213 56009</strong> for dispatch queries.
          </p>
        </div>
      </div>

    </div>
  );
}
