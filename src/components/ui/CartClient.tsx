'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/ui/CartProvider';
import { Settings, CheckoutDetails, Order } from '@/types';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { decrementStockAfterCheckout } from '@/app/admin/actions';
import { COUNTRIES_LIST, calculateShippingFee } from '@/lib/shipping';

interface CartClientProps {
  settings: Settings | null;
}

export default function CartClient({ settings }: CartClientProps) {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutDetails>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutDetails>>({});
  const [paying, setPaying] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Dynamic Shipping Calculation based on Selected Country and State
  const shippingFee = calculateShippingFee(form.country, form.state);
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CheckoutDetails]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Partial<CheckoutDetails> = {};
    if (!form.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!form.phone.trim()) errors.phone = 'Phone Number is required';
    if (!form.address.trim()) errors.address = 'Delivery Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State / Region is required';
    if (!form.country.trim()) errors.country = 'Country is required';
    if (!form.pinCode.trim()) errors.pinCode = 'Postal / PIN Code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPaying(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load Razorpay Payment Gateway. Please check your internet connection.');
      setPaying(false);
      return;
    }

    const orderNumber = `TH-${Date.now().toString().slice(-6)}`;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJNVaCMelGkB71';

    const options = {
      key: razorpayKey,
      amount: grandTotal * 100, // Amount in paise
      currency: 'INR',
      name: 'Thaarakam Jewellery',
      description: `Order ${orderNumber} (${cartCount} items)`,
      image: settings?.logo_url || '/images/intro1.jpeg',
      prefill: {
        name: form.fullName.trim(),
        contact: form.phone.trim(),
        email: form.email ? form.email.trim() : '',
      },
      notes: {
        order_number: orderNumber,
        shipping_address: `${form.address}, ${form.city}, ${form.state}, ${form.country} - ${form.pinCode}`,
      },
      theme: {
        color: '#111111',
      },
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;

        // 1. Decrement Stock ONLY NOW after confirmed payment
        try {
          const items = cart.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          }));
          await decrementStockAfterCheckout(items);
        } catch (err) {
          console.error('Error decrementing stock post-payment:', err);
        }

        // 2. Insert Order into Supabase orders table
        const newOrder = {
          order_number: orderNumber,
          customer_name: form.fullName.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email ? form.email.trim() : null,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country || 'India',
          pincode: form.pinCode.trim(),
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            image: item.product.images?.[0] || null,
          })),
          subtotal,
          shipping_fee: shippingFee,
          grand_total: grandTotal,
          payment_id: paymentId,
          payment_status: 'paid',
          order_status: 'pending',
          created_at: new Date().toISOString(),
        };

        try {
          const { data: dbData, error: dbErr } = await supabase.from('orders').insert([newOrder]).select();
          if (dbErr) {
            console.error('Supabase order insert error:', dbErr.message);
          }
        } catch (e) {
          console.error('Database connection error during order save:', e);
        }

        // 3. Clear Cart & Display Order Confirmation Modal
        clearCart();
        setConfirmedOrder(newOrder as Order);
        setPaying(false);
      },
      modal: {
        ondismiss: function () {
          setPaying(false);
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error launching Razorpay modal:', err);
      alert('Could not initialize Razorpay checkout. Please try again.');
      setPaying(false);
    }
  };

  // Order Confirmation Success Screen
  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-20 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center gap-6">
        <div className="rounded-full bg-green-100 p-5 text-green-600 border border-green-200">
          <CheckCircle2 className="h-12 w-12 stroke-[1.5]" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-700">
            Payment Confirmed & Order Placed
          </span>
          <h1 className="text-3xl font-light tracking-wide uppercase text-foreground">
            Thank You, {confirmedOrder.customer_name}!
          </h1>
          <p className="text-xs text-secondary mt-1 max-w-md mx-auto leading-relaxed">
            Your order <strong>#{confirmedOrder.order_number}</strong> has been received and verified. Stock has been reserved for your items.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border bg-background p-6 text-left flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-3 text-xs">
            <span className="font-semibold text-secondary">Payment Reference:</span>
            <span className="font-mono text-foreground font-bold">{confirmedOrder.payment_id}</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">Shipping Destination:</span>
            <p className="text-secondary leading-relaxed">
              {confirmedOrder.address}, {confirmedOrder.city}, {confirmedOrder.state}, <strong>{confirmedOrder.country}</strong> - {confirmedOrder.pincode}
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">Ordered Items:</span>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/40 last:border-0">
                <span>{item.name} {item.selectedSize ? `(Size: ${item.selectedSize})` : ''} x {item.quantity}</span>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-border pt-3 font-bold text-sm text-foreground">
            <span>Total Paid:</span>
            <span>₹{confirmedOrder.grand_total}</span>
          </div>
        </div>

        <Link
          href="/shop"
          className="rounded-xl bg-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.98] transition-all mt-2"
        >
          Continue Shopping →
        </Link>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center gap-6">
        <div className="rounded-full bg-border/40 p-5 text-secondary">
          <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-light tracking-wide text-foreground">Your shopping cart is empty</h2>
          <p className="text-xs text-secondary">Browse our premium jewellery items and add them to your cart.</p>
        </div>
        <Link
          href="/shop"
          className="rounded-xl bg-foreground px-6 py-3 text-xs font-semibold text-background hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      
      <h1 className="text-2xl font-light tracking-wider uppercase text-foreground mb-10">
        Shopping Cart & Online Checkout
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        
        {/* Left Side: Cart Items List (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Items ({cartCount})
            </span>
            <button
              onClick={clearCart}
              className="text-[10px] uppercase font-bold tracking-wider text-red-500 hover:text-red-700 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-border">
            {cart.map((item) => {
              const coverImage = item.product.images?.[0] || '/images/placeholder.jpg';
              return (
                <div key={`${item.product.id}-${item.selectedSize || 'nosize'}`} className="py-6 flex gap-4 sm:gap-6 items-center">
                  
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-border/20 border border-border/40">
                    <Image
                      src={coverImage}
                      alt={item.product.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-grow flex-col justify-between self-stretch">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-secondary">
                          {item.product.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </h3>
                        {item.selectedSize && (
                          <span className="text-[10px] text-secondary font-semibold">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          className="p-1.5 text-secondary hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          className="p-1.5 text-secondary hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Shipping & Online Razorpay Form (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-border/5 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Shipping & Checkout
            </h2>
          </div>

          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="e.g. Karuna Santi"
                className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none transition-colors ${
                  formErrors.fullName ? 'border-red-500' : 'border-border focus:border-foreground/40'
                }`}
              />
              {formErrors.fullName && <span className="text-[10px] text-red-500">{formErrors.fullName}</span>}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none transition-colors ${
                    formErrors.phone ? 'border-red-500' : 'border-border focus:border-foreground/40'
                  }`}
                />
                {formErrors.phone && <span className="text-[10px] text-red-500">{formErrors.phone}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Country Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="country" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Street / Door Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                rows={2}
                placeholder="House No, Street, Landmark"
                className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none transition-colors resize-none ${
                  formErrors.address ? 'border-red-500' : 'border-border focus:border-foreground/40'
                }`}
              />
              {formErrors.address && <span className="text-[10px] text-red-500">{formErrors.address}</span>}
            </div>

            {/* City, State & PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none transition-colors ${
                    formErrors.city ? 'border-red-500' : 'border-border focus:border-foreground/40'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="state" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none transition-colors ${
                    formErrors.state ? 'border-red-500' : 'border-border focus:border-foreground/40'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pinCode" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Postal / PIN *
                </label>
                <input
                  type="text"
                  id="pinCode"
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleInputChange}
                  placeholder="PIN / Zip"
                  className={`rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none transition-colors ${
                    formErrors.pinCode ? 'border-red-500' : 'border-border focus:border-foreground/40'
                  }`}
                />
              </div>
            </div>

            <hr className="border-border my-2" />

            {/* Order Totals Summary */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal ({cartCount} items):</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Shipping ({form.country}):</span>
                <span>₹{shippingFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground border-t border-border pt-2 mt-1">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Payment Button */}
            <button
              type="submit"
              disabled={paying}
              className="w-full rounded-xl bg-foreground text-background py-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              {paying ? (
                'Initializing Razorpay...'
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay ₹{grandTotal.toLocaleString('en-IN')} via Razorpay
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
