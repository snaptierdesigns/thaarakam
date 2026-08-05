'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, ExternalLink, MessageCircle, CheckCircle2, Clock, XCircle, MapPin, Phone, User, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setOrders(data as Order[]);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      setUpdatingId(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) {
        alert(`Failed to update order status: ${error.message}`);
      } else {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getWhatsappLink = (phone: string, orderNumber: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    const msg = encodeURIComponent(`Hi! Regarding your Thaarakam Jewellery Order #${orderNumber}:`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      o.order_number.toLowerCase().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_phone.includes(query) ||
      o.city.toLowerCase().includes(query) ||
      (o.country && o.country.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
            Customer Orders Management
          </h1>
          <p className="text-xs text-secondary mt-1">
            View order tiles, customer addresses, purchased items, payment status, and dispatch actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:border-foreground/40 transition-colors"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-background p-4 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {['all', 'pending', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-border/30 text-secondary hover:bg-border/60 hover:text-foreground'
              }`}
            >
              {status} ({status === 'all' ? orders.length : orders.filter(o => o.order_status === status).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, order #..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none transition-colors"
          />
        </div>

      </div>

      {/* Orders Grid List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-secondary italic">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center bg-background flex flex-col items-center justify-center gap-3">
          <Package className="h-8 w-8 text-secondary/40 stroke-[1.2]" />
          <p className="text-xs text-secondary font-medium">No customer orders found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between gap-5 hover:border-foreground/30 transition-all duration-300 shadow-sm"
            >
              
              {/* Order Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">
                    #{order.order_number}
                  </span>
                  <span className="text-[10px] text-secondary flex items-center gap-1">
                    <Calendar className="h-3 w-3 inline" />
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      order.order_status === 'completed'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : order.order_status === 'cancelled'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {order.order_status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                    {order.order_status === 'cancelled' && <XCircle className="h-3 w-3" />}
                    {order.order_status === 'pending' && <Clock className="h-3 w-3" />}
                    {order.order_status}
                  </span>

                  <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    Payment: {order.payment_status?.toUpperCase() || 'PAID'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex flex-col gap-2 bg-border/10 p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <User className="h-3.5 w-3.5 text-secondary" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Phone className="h-3.5 w-3.5 text-secondary" />
                  {order.customer_phone}
                </div>
                <div className="flex items-start gap-2 text-secondary leading-relaxed">
                  <MapPin className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                  <span>
                    {order.address}, {order.city}, {order.state}, <strong>{order.country || 'India'}</strong> - {order.pincode}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Items Ordered ({order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0}):
                </span>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.selectedSize && (
                          <span className="text-[10px] text-secondary">Size: {item.selectedSize}</span>
                        )}
                      </div>
                      <span className="font-semibold text-foreground">
                        {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Shipping ({order.country || 'India'}):</span>
                  <span>₹{order.shipping_fee}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/40">
                  <span>Grand Total:</span>
                  <span>₹{order.grand_total}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col gap-2 pt-2">
                
                {/* WhatsApp Message Direct Action */}
                <a
                  href={getWhatsappLink(order.customer_phone, order.order_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Message Customer on WhatsApp
                </a>

                {/* Status Switcher Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'pending')}
                    disabled={updatingId === order.id}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      order.order_status === 'pending'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'border-border text-secondary hover:bg-border/30'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    disabled={updatingId === order.id}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      order.order_status === 'completed'
                        ? 'bg-green-600 text-white border-green-700'
                        : 'border-border text-secondary hover:bg-border/30'
                    }`}
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    disabled={updatingId === order.id}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      order.order_status === 'cancelled'
                        ? 'bg-red-600 text-white border-red-700'
                        : 'border-border text-secondary hover:bg-border/30'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
