'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/ui/CartProvider';
import { Settings, CheckoutDetails } from '@/types';
import { Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { decrementStockAfterCheckout } from '@/app/admin/actions';

interface CartClientProps {
  settings: Settings | null;
}

type RegionType = 'kerala' | 'south_india' | 'north_india';

export default function CartClient({ settings }: CartClientProps) {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutDetails>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutDetails>>({});

  // Dynamic shipping fees from settings database
  const shippingKerala = Number(settings?.shipping_kerala ?? 50);
  const shippingSouthIndia = Number(settings?.shipping_south_india ?? 60);
  const shippingNorthIndia = Number(settings?.shipping_north_india ?? 80);

  const getRegionFromPin = (pinCode: string): { region: RegionType; label: string } => {
    const cleanPin = pinCode.trim().replace(/\s/g, '');
    if (!cleanPin || cleanPin.length < 6 || isNaN(Number(cleanPin))) {
      return { region: 'kerala', label: 'Kerala (Default)' }; // fallback
    }

    const prefix2 = cleanPin.substring(0, 2);
    const prefix1 = cleanPin.substring(0, 1);

    // Kerala circles: 67, 68, 69
    if (prefix2 === '67' || prefix2 === '68' || prefix2 === '69') {
      return { region: 'kerala', label: 'Kerala' };
    }

    // South India region first digits: 5, or 60-66
    const numPrefix2 = Number(prefix2);
    if (prefix1 === '5' || (numPrefix2 >= 60 && numPrefix2 <= 66)) {
      return { region: 'south_india', label: 'South India' };
    }

    // Rest is North India / Rest of India
    return { region: 'north_india', label: 'North India' };
  };

  const pinDetails = getRegionFromPin(form.pinCode);
  const region = pinDetails.region;
  const regionLabel = pinDetails.label;

  const getShippingFee = () => {
    switch (region) {
      case 'kerala':
        return shippingKerala;
      case 'south_india':
        return shippingSouthIndia;
      case 'north_india':
        return shippingNorthIndia;
      default:
        return shippingKerala;
    }
  };

  const shippingFee = getShippingFee();
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!form.state.trim()) errors.state = 'State is required';
    
    const pin = form.pinCode.trim();
    if (!pin) {
      errors.pinCode = 'PIN Code is required';
    } else if (pin.length !== 6 || isNaN(Number(pin))) {
      errors.pinCode = 'Please enter a valid 6-digit PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!settings?.whatsapp_number) {
      alert('The store has not configured a WhatsApp number yet. Please contact the owner.');
      return;
    }

    // Format the WhatsApp message text
    let message = `*NEW ORDER - THAARAKAM JEWELLERY*\n\n`;
    message += `*Customer Details:*\n`;
    message += `• Name: ${form.fullName}\n`;
    message += `• Phone: ${form.phone}\n`;
    message += `• Address: ${form.address}\n`;
    message += `• City: ${form.city}\n`;
    message += `• State: ${form.state}\n`;
    message += `• PIN Code: ${form.pinCode}\n\n`;

    message += `*Items Ordered:*\n`;
    cart.forEach((item, index) => {
      const priceFormatted = `₹${item.product.price}`;
      const sizeText = item.selectedSize ? `(Size: ${item.selectedSize})` : '';
      const preorderBadge = item.product.is_preorder ? ' *[PRE-ORDER]*' : '';
      
      message += `${index + 1}. ${item.product.name} ${sizeText}${preorderBadge}\n`;
      message += `   Qty: ${item.quantity} x ${priceFormatted} = ₹${item.product.price * item.quantity}\n`;
    });
    
    message += `\n`;
    message += `*Order Summary:*\n`;
    message += `• Subtotal: ₹${subtotal}\n`;
    message += `• Shipping (${regionLabel}): ₹${shippingFee}\n`;
    message += `• *Grand Total: ₹${grandTotal}*\n`;

    // Encode message text
    const encodedText = encodeURIComponent(message);
    let whatsappNum = (settings.whatsapp_number || '8921356009').replace(/\D/g, '');
    if (whatsappNum.length === 10) {
      whatsappNum = `91${whatsappNum}`;
    }
    
    // Decrement product stock and finalize order redirect
    const finalizeCheckout = async () => {
      try {
        const items = cart.map(item => ({
          id: item.product.id,
          quantity: item.quantity
        }));
        await decrementStockAfterCheckout(items);
      } catch (err) {
        console.error('Error updating stock on checkout:', err);
      }
      
      // Clear cart upon ordering
      clearCart();
      
      // Redirect to wa.me URL (use location.href to bypass iOS Safari popup blockers inside async callbacks)
      window.location.href = `https://wa.me/${whatsappNum}?text=${encodedText}`;
    };
    
    finalizeCheckout();
  };

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
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        
        {/* Left Side: Cart Items List (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="divide-y divide-border border-b border-border">
            {cart.map((item, idx) => {
              const coverImg = item.product.images?.[0] || '/images/placeholder.jpg';
              const isOutOfStock = item.product.availability === 'out_of_stock';
              
              return (
                <div key={`${item.product.id}-${item.selectedSize ?? 'nosize'}`} className="flex py-6 gap-4">
                  {/* Item Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-border/20 border border-border/40">
                    <Image
                      src={coverImg}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Metadata & Operations */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between text-sm">
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">
                          <Link href={`/product/?id=${item.product.id}`} className="hover:opacity-85">
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-secondary">
                          {item.product.category}
                        </p>
                        {item.selectedSize && (
                          <p className="mt-1 text-[10px] text-foreground font-semibold bg-border/40 inline-block px-1.5 py-0.5 rounded">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1.5">
                          {item.product.is_preorder && (
                            <span className="inline-flex rounded bg-foreground text-background px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                              Pre Order
                            </span>
                          )}
                          {isOutOfStock && !item.product.is_preorder && (
                            <span className="inline-flex rounded bg-border border border-border/80 text-secondary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold ml-4">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Toggler */}
                      <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 text-secondary hover:text-foreground transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                          disabled={!item.product.is_preorder && item.product.stock_count !== null && item.product.stock_count !== undefined && item.quantity >= item.product.stock_count}
                          className="p-1 text-secondary hover:text-foreground disabled:opacity-30 disabled:hover:text-secondary transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-secondary hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Shipping & Checkout Form (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Order Summary Calculations */}
          <div className="rounded-2xl border border-border bg-border/5 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Order Summary
            </h2>
            
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs text-secondary">
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary">
                <span>Shipping ({regionLabel})</span>
                <span>₹{shippingFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-3 mt-2 text-foreground">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details Form */}
          <form onSubmit={handleCheckout} className="rounded-2xl border border-border p-6 flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Delivery Details
            </h2>
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
              {formErrors.fullName && <p className="text-[10px] text-red-500 font-medium">{formErrors.fullName}</p>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="Enter mobile number"
              />
              {formErrors.phone && <p className="text-[10px] text-red-500 font-medium">{formErrors.phone}</p>}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Delivery Address
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                rows={3}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors resize-none"
                placeholder="House name/number, street address, area info..."
              />
              {formErrors.address && <p className="text-[10px] text-red-500 font-medium">{formErrors.address}</p>}
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                  placeholder="City"
                />
                {formErrors.city && <p className="text-[10px] text-red-500 font-medium">{formErrors.city}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="state" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                  placeholder="State"
                />
                {formErrors.state && <p className="text-[10px] text-red-500 font-medium">{formErrors.state}</p>}
              </div>
            </div>

            {/* PIN Code */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pinCode" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                PIN Code
              </label>
              <input
                type="text"
                id="pinCode"
                name="pinCode"
                value={form.pinCode}
                onChange={handleInputChange}
                maxLength={6}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="6-digit PIN code"
              />
              {formErrors.pinCode && <p className="text-[10px] text-red-500 font-medium">{formErrors.pinCode}</p>}
              
              {form.pinCode.trim().length === 6 && !isNaN(Number(form.pinCode.trim())) && (
                <p className="text-[10px] text-green-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-green-50 border border-green-200/50 p-2.5 rounded-xl w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                  ₹{shippingFee} shipping fee applied due to location: {regionLabel}
                </p>
              )}
            </div>

            {/* COD Notice */}
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-[10px] text-amber-800 leading-relaxed flex items-start gap-2 mt-2">
              <span className="text-xs">⚠️</span>
              <div>
                <strong>Cash On Delivery is not available.</strong> We accept payments via UPI (Google Pay, PhonePe, Paytm) or online bank transfer after order confirmation on WhatsApp.
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-foreground py-3.5 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Send className="h-4 w-4" />
              Order on WhatsApp
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
