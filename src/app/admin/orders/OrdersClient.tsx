'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { getOrders, updateOrderShippingStatus } from '@/app/admin/actions';
import { Search, ArrowLeft, Truck, PackageCheck, Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface OrdersClientProps {
  initialOrders?: Order[];
}

export default function OrdersClient({ initialOrders = [] }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      if (res.success && res.orders) {
        setOrders(res.orders as Order[]);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'processing' | 'shipped' | 'delivered', trackingNo?: string) => {
    try {
      const res = await updateOrderShippingStatus(orderId, newStatus, trackingNo);
      if (res.success) {
        setStatusMessage('Order status updated successfully!');
        setEditingTrackingId(null);
        fetchOrdersList();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating order status');
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = searchQuery
      ? ord.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer_phone.includes(searchQuery) ||
        (ord.tracking_number && ord.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesStatus = filterStatus ? ord.shipping_status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-xl border border-border bg-background p-2 text-secondary hover:text-foreground transition-all"
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-secondary">
              Store Logistics
            </span>
            <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
              Customer Orders Management
            </h1>
          </div>
        </div>

        <button
          onClick={fetchOrdersList}
          disabled={loading}
          className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-border/20 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
          {statusMessage}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-background p-4 rounded-2xl border border-border">
        <div className="relative col-span-1 sm:col-span-2">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary/60">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, Phone, or Tracking Number..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-secondary focus:border-foreground/40 focus:outline-none cursor-pointer"
        >
          <option value="">All Shipping Status</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-background flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-secondary italic">No customer orders recorded yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((ord) => {
            let parsedItems: any[] = [];
            try {
              parsedItems = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
            } catch (e) {
              parsedItems = [];
            }

            return (
              <div key={ord.id} className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-5">
                
                {/* Top Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">
                      {ord.order_number}
                    </span>
                    <span className="text-[10px] text-secondary">
                      {new Date(ord.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-green-50 border border-green-200 text-green-800">
                      Payment: {ord.payment_status}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                      ord.shipping_status === 'delivered'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : ord.shipping_status === 'shipped'
                          ? 'bg-purple-50 border-purple-200 text-purple-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      Status: {ord.shipping_status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  
                  {/* Customer Address */}
                  <div className="flex flex-col gap-1 text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Customer & Shipping</span>
                    <span className="font-semibold text-foreground">{ord.customer_name}</span>
                    <span>Phone: {ord.customer_phone}</span>
                    {ord.customer_email && <span>Email: {ord.customer_email}</span>}
                    <span className="mt-1">{ord.address}, {ord.city}, {ord.state} - {ord.pincode} ({ord.country})</span>
                  </div>

                  {/* Items Purchased */}
                  <div className="flex flex-col gap-1 text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Ordered Items</span>
                    <div className="space-y-1 mt-1">
                      {parsedItems.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span>{it.quantity}x {it.name} {it.selectedSize ? `(Size ${it.selectedSize})` : ''}</span>
                          <span className="font-semibold text-foreground">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Tracking Operations */}
                  <div className="flex flex-col gap-3 rounded-xl bg-border/10 p-4 border border-border">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Total Paid</span>
                      <span>₹{ord.total_amount}</span>
                    </div>

                    {ord.razorpay_payment_id && (
                      <span className="text-[10px] text-secondary">Razorpay ID: {ord.razorpay_payment_id}</span>
                    )}

                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                        India Post Consignment Tracking
                      </span>

                      {editingTrackingId === ord.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="e.g. EK123456789IN"
                            className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'shipped', trackingInput)}
                            className="rounded-xl bg-foreground px-3 py-1.5 text-xs font-bold text-background"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-foreground font-semibold">
                            {ord.tracking_number || 'No tracking # added'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingTrackingId(ord.id);
                              setTrackingInput(ord.tracking_number || '');
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-foreground hover:underline"
                          >
                            {ord.tracking_number ? 'Edit' : 'Add Tracking #'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Selectors */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'processing', ord.tracking_number || undefined)}
                        className="flex-1 rounded-lg border border-border py-1 text-[9px] font-bold uppercase tracking-wider text-secondary hover:bg-border/20"
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'shipped', ord.tracking_number || undefined)}
                        className="flex-1 rounded-lg border border-border py-1 text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 hover:bg-purple-100"
                      >
                        Mark Shipped
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'delivered', ord.tracking_number || undefined)}
                        className="flex-1 rounded-lg border border-border py-1 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Delivered
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
