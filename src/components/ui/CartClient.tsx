'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/ui/CartProvider';
import { Settings, CheckoutDetails, COUNTRY_SHIPPING_RATES } from '@/types';
import { Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { decrementStockAfterCheckout, recordPaidOrder } from '@/app/admin/actions';

interface CartClientProps {
  settings: Settings | null;
}

export interface PostalDetectionResult {
  isSupported: boolean;
  country: string;
  state: string;
  city: string;
  shippingFee: number;
  label: string;
  errorMessage?: string;
}

export function detectLocationFromZip(
  rawZip: string,
  shippingKerala = 50,
  shippingSouthIndia = 60,
  shippingNorthIndia = 80
): PostalDetectionResult {
  const cleanPin = rawZip.trim().toUpperCase().replace(/\s+/g, '');

  if (!cleanPin) {
    return {
      isSupported: true,
      country: 'India',
      state: 'Kerala',
      city: '',
      shippingFee: shippingKerala,
      label: 'Kerala (Default)',
    };
  }

  // 1. Lakshadweep Island Pincodes (682551 - 682559)
  if (/^68255[1-9]$/.test(cleanPin)) {
    return {
      isSupported: true,
      country: 'India',
      state: 'Lakshadweep',
      city: 'Kavaratti Island',
      shippingFee: 2100,
      label: 'Lakshadweep Islands',
    };
  }

  // 2. Kerala Domestic Pincodes (67xxx, 68xxx, 69xxx)
  if (/^(67|68|69)\d{4}$/.test(cleanPin)) {
    let city = 'Kochi / Ernakulam';
    const prefix3 = cleanPin.substring(0, 3);
    if (prefix3 === '695' || prefix3 === '691') city = 'Thiruvananthapuram / Kollam';
    else if (prefix3 === '673') city = 'Kozhikode';
    else if (prefix3 === '680') city = 'Thrissur';
    else if (prefix3 === '686') city = 'Kottayam';
    else if (prefix3 === '670') city = 'Kannur';
    else if (prefix3 === '678') city = 'Palakkad';
    else if (prefix3 === '688') city = 'Alappuzha';
    else if (prefix3 === '689') city = 'Pathanamthitta';
    else if (prefix3 === '685') city = 'Idukki';
    else if (prefix3 === '671') city = 'Kasaragod';

    return {
      isSupported: true,
      country: 'India',
      state: 'Kerala',
      city,
      shippingFee: shippingKerala,
      label: 'Kerala',
    };
  }

  // 3. South India Domestic Pincodes (5xxxxx or 60xxx-66xxx)
  if (/^(5\d{5}|6[0-6]\d{4})$/.test(cleanPin)) {
    let state = 'Tamil Nadu';
    let city = 'Chennai';
    const prefix2 = cleanPin.substring(0, 2);
    const num2 = Number(prefix2);

    if (num2 >= 60 && num2 <= 64) {
      state = 'Tamil Nadu';
      if (prefix2 === '60') city = 'Chennai';
      else if (prefix2 === '64') city = 'Coimbatore';
      else if (prefix2 === '62') city = 'Madurai';
    } else if (prefix2 === '60' && cleanPin.substring(0, 3) === '605') {
      state = 'Puducherry';
      city = 'Puducherry';
    } else if (num2 >= 56 && num2 <= 59) {
      state = 'Karnataka';
      city = prefix2 === '56' ? 'Bengaluru' : 'Mysuru';
    } else if (num2 >= 50 && num2 <= 50) {
      state = 'Telangana';
      city = 'Hyderabad';
    } else if (num2 >= 51 && num2 <= 53) {
      state = 'Andhra Pradesh';
      city = prefix2 === '53' ? 'Visakhapatnam' : 'Vijayawada';
    }

    return {
      isSupported: true,
      country: 'India',
      state,
      city,
      shippingFee: shippingSouthIndia,
      label: 'South India',
    };
  }

  // 4. Other Domestic India Pincodes (1xxxxx, 2xxxxx, 3xxxxx, 4xxxxx, 7xxxxx, 8xxxxx)
  if (/^[1-478]\d{5}$/.test(cleanPin)) {
    let state = 'India';
    let city = '';
    const prefix2 = cleanPin.substring(0, 2);

    if (prefix2 === '11') { state = 'Delhi'; city = 'New Delhi'; }
    else if (['40','41','42','43','44'].includes(prefix2)) {
      state = 'Maharashtra';
      city = prefix2 === '40' ? 'Mumbai' : 'Pune';
    } else if (['70','71','72','73'].includes(prefix2)) {
      state = 'West Bengal';
      city = 'Kolkata';
    } else if (['38','39'].includes(prefix2)) {
      state = 'Gujarat';
      city = 'Ahmedabad';
    } else if (['30','31','32','33','34'].includes(prefix2)) {
      state = 'Rajasthan';
      city = 'Jaipur';
    } else if (['20','22','24'].includes(prefix2)) {
      state = 'Uttar Pradesh';
      city = 'Lucknow / Noida';
    } else if (['16','14','12'].includes(prefix2)) {
      state = 'Punjab / Haryana';
      city = 'Chandigarh';
    }

    return {
      isSupported: true,
      country: 'India',
      state,
      city,
      shippingFee: shippingNorthIndia,
      label: 'Domestic India',
    };
  }

  // 5. UK Postcodes (e.g. SW1A1AA, EC1A1BB, M11AE, B11AA, G11XQ, BT11AA)
  if (/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/i.test(cleanPin)) {
    let state = 'England';
    let city = 'London';
    const prefixLetters = cleanPin.match(/^[A-Z]{1,2}/i)?.[0].toUpperCase() || '';

    if (['SW', 'SE', 'NW', 'NE', 'EC', 'WC', 'E', 'W', 'N'].includes(prefixLetters)) {
      state = 'Greater London';
      city = 'London';
    } else if (prefixLetters === 'M') {
      state = 'Greater Manchester';
      city = 'Manchester';
    } else if (prefixLetters === 'B') {
      state = 'West Midlands';
      city = 'Birmingham';
    } else if (prefixLetters === 'G' || prefixLetters === 'EH') {
      state = 'Scotland';
      city = prefixLetters === 'EH' ? 'Edinburgh' : 'Glasgow';
    } else if (prefixLetters === 'BT') {
      state = 'Northern Ireland';
      city = 'Belfast';
    } else if (prefixLetters === 'CF') {
      state = 'Wales';
      city = 'Cardiff';
    }

    return {
      isSupported: true,
      country: 'United Kingdom',
      state,
      city,
      shippingFee: 2700,
      label: 'United Kingdom',
    };
  }

  // 6. Canada Postal Codes (e.g. M5V2T6, K1A0B1, V6B1A1)
  if (/^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/i.test(cleanPin)) {
    const firstLetter = cleanPin[0].toUpperCase();
    let state = 'Ontario';
    let city = 'Toronto';

    if (firstLetter === 'A') { state = 'Newfoundland and Labrador'; city = "St. John's"; }
    else if (firstLetter === 'B') { state = 'Nova Scotia'; city = 'Halifax'; }
    else if (firstLetter === 'C') { state = 'Prince Edward Island'; city = 'Charlottetown'; }
    else if (firstLetter === 'E') { state = 'New Brunswick'; city = 'Fredericton'; }
    else if (['G', 'H', 'J'].includes(firstLetter)) { state = 'Quebec'; city = 'Montreal'; }
    else if (['K', 'L', 'M', 'N', 'P'].includes(firstLetter)) { state = 'Ontario'; city = firstLetter === 'M' ? 'Toronto' : 'Ottawa'; }
    else if (firstLetter === 'R') { state = 'Manitoba'; city = 'Winnipeg'; }
    else if (firstLetter === 'S') { state = 'Saskatchewan'; city = 'Saskatoon'; }
    else if (firstLetter === 'T') { state = 'Alberta'; city = 'Calgary'; }
    else if (firstLetter === 'V') { state = 'British Columbia'; city = 'Vancouver'; }
    else if (['X', 'Y'].includes(firstLetter)) { state = 'Northwest Territories / Yukon'; city = 'Yellowknife'; }

    return {
      isSupported: true,
      country: 'Canada',
      state,
      city,
      shippingFee: 2200,
      label: 'Canada',
    };
  }

  // 7. USA Zip Codes (5 digits or 5+4, e.g. 90210, 10001, 33101)
  if (/^\d{5}(-\d{4})?$/.test(cleanPin) || /^\d{5}$/.test(cleanPin)) {
    const num = Number(cleanPin.substring(0, 5));
    let state = 'California';
    let city = 'Los Angeles';

    if (num >= 90001 && num <= 96162) { state = 'California'; city = num >= 94000 ? 'San Francisco' : 'Los Angeles'; }
    else if (num >= 10001 && num <= 14925) { state = 'New York'; city = 'New York City'; }
    else if (num >= 33001 && num <= 34997) { state = 'Florida'; city = 'Miami'; }
    else if (num >= 75001 && num <= 79999) { state = 'Texas'; city = num >= 77000 ? 'Houston' : 'Dallas'; }
    else if (num >= 60001 && num <= 62999) { state = 'Illinois'; city = 'Chicago'; }
    else if (num >= 98001 && num <= 99403) { state = 'Washington'; city = 'Seattle'; }
    else if (num >= 2101 && num <= 2791) { state = 'Massachusetts'; city = 'Boston'; }
    else if (num >= 30001 && num <= 31999) { state = 'Georgia'; city = 'Atlanta'; }
    else if (num >= 89001 && num <= 89883) { state = 'Nevada'; city = 'Las Vegas'; }

    return {
      isSupported: true,
      country: 'United States',
      state,
      city,
      shippingFee: 2600,
      label: 'United States',
    };
  }

  // 8. Maldives Postal Code (20000 - 20999 or MAL)
  if (/^20\d{2,3}$/.test(cleanPin) || cleanPin.startsWith('MAL')) {
    return {
      isSupported: true,
      country: 'Maldives',
      state: 'Kaafu Atoll',
      city: 'Malé',
      shippingFee: 2100,
      label: 'Maldives',
    };
  }

  // 9. Singapore Postal Code (6 digits 010000 - 829999)
  if (/^(0[1-9]|[1-7]\d|8[0-2])\d{4}$/.test(cleanPin)) {
    return {
      isSupported: true,
      country: 'Singapore',
      state: 'Singapore',
      city: 'Singapore',
      shippingFee: 2000,
      label: 'Singapore',
    };
  }

  // 10. UAE / Dubai P.O. Box & Emirate Zip Codes
  if (/^(00000|00971|12345|\d{5})$/.test(cleanPin) && (cleanPin.startsWith('0') || cleanPin.startsWith('971') || cleanPin === '12345')) {
    return {
      isSupported: true,
      country: 'United Arab Emirates',
      state: 'Dubai',
      city: 'Dubai',
      shippingFee: 2200,
      label: 'United Arab Emirates',
    };
  }

  // 11. Sri Lanka Postal Code (5 digits 00100 - 96100)
  if (/^\d{5}$/.test(cleanPin) && Number(cleanPin) >= 100 && Number(cleanPin) <= 96100) {
    return {
      isSupported: true,
      country: 'Sri Lanka',
      state: 'Western Province',
      city: 'Colombo',
      shippingFee: 1500,
      label: 'Sri Lanka',
    };
  }

  // 12. Bangladesh Postal Code (4 digits 1000 - 9400)
  if (/^\d{4}$/.test(cleanPin) && Number(cleanPin) >= 1000 && Number(cleanPin) <= 9400) {
    return {
      isSupported: true,
      country: 'Bangladesh',
      state: 'Dhaka Division',
      city: 'Dhaka',
      shippingFee: 1500,
      label: 'Bangladesh',
    };
  }

  // 13. UNSUPPORTED POSTAL CODE / COUNTRY
  return {
    isSupported: false,
    country: 'Unsupported',
    state: '',
    city: '',
    shippingFee: 0,
    label: 'Unsupported Destination',
    errorMessage: 'Sorry, but we do not currently deliver to your country',
  };
}

export default function CartClient({ settings }: CartClientProps) {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutDetails>({
    fullName: '',
    phone: '',
    email: '',
    country: 'India',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutDetails>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic shipping fees from settings database
  const shippingKerala = Number(settings?.shipping_kerala ?? 50);
  const shippingSouthIndia = Number(settings?.shipping_south_india ?? 60);
  const shippingNorthIndia = Number(settings?.shipping_north_india ?? 80);

  const locationInfo = detectLocationFromZip(
    form.pinCode,
    shippingKerala,
    shippingSouthIndia,
    shippingNorthIndia
  );

  const shippingFee = locationInfo.isSupported ? locationInfo.shippingFee : 0;
  const regionLabel = locationInfo.label;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'pinCode') {
        const detected = detectLocationFromZip(value, shippingKerala, shippingSouthIndia, shippingNorthIndia);
        if (detected.isSupported && detected.country) {
          updated.country = detected.country;
          if (detected.state) updated.state = detected.state;
          if (detected.city) updated.city = detected.city;
        }
      }
      return updated;
    });

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
    
    if (!form.pinCode.trim()) {
      errors.pinCode = 'PIN / Postal Code is required';
    } else if (!locationInfo.isSupported) {
      errors.pinCode = 'Sorry, but we do not currently deliver to your country';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
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

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
      amount: Math.round(grandTotal * 100), // Amount in paise
      currency: 'INR',
      name: settings?.business_name || 'Thaarakam Jewellery',
      description: `Order Payment for ${cartCount} items`,
      image: settings?.logo_url || '/images/logo.png',
      handler: async function (response: any) {
        try {
          const orderPayload = {
            customer_name: form.fullName,
            customer_phone: form.phone,
            customer_email: form.email || null,
            country: form.country,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pinCode,
            items: cart.map((item) => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              is_preorder: item.product.is_preorder,
            })),
            cartItems: cart,
            subtotal,
            shipping_fee: shippingFee,
            total_amount: grandTotal,
            payment_status: 'paid',
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || null,
          };

          const res = await recordPaidOrder(orderPayload);
          clearCart();

          if (res.success && res.orderNumber) {
            window.location.href = `/track/?id=${encodeURIComponent(res.orderNumber)}`;
          } else {
            alert('Payment received! Order recorded successfully.');
            window.location.href = `/track/`;
          }
        } catch (err) {
          console.error('Error recording paid order:', err);
          alert('Payment succeeded! Stock decremented.');
          clearCart();
          window.location.href = '/track/';
        }
      },
      prefill: {
        name: form.fullName,
        email: form.email || '',
        contact: form.phone,
      },
      theme: {
        color: '#1a1a1a',
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert(`Payment Failed: ${resp.error.description || 'Transaction declined'}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      alert('Could not open Razorpay checkout modal.');
      setIsProcessing(false);
    }
  };

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!settings?.whatsapp_number) {
      alert('The store has not configured a WhatsApp number yet.');
      return;
    }

    let message = `*NEW ORDER - THAARAKAM JEWELLERY*\n\n`;
    message += `*Customer Details:*\n`;
    message += `• Name: ${form.fullName}\n`;
    message += `• Phone: ${form.phone}\n`;
    message += `• Country: ${form.country}\n`;
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

    const encodedText = encodeURIComponent(message);
    const whatsappNum = settings.whatsapp_number.replace(/\D/g, '');
    
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
      
      clearCart();
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
          <form className="rounded-2xl border border-border p-6 flex flex-col gap-4">
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

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Mobile number"
                />
                {formErrors.phone && <p className="text-[10px] text-red-500 font-medium">{formErrors.phone}</p>}
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
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                  placeholder="Email address"
                />
              </div>
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

            {/* PIN / Postal Code (Auto-Detects Country, Region, State & City) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pinCode" className="text-[10px] font-semibold uppercase tracking-wider text-secondary flex items-center justify-between">
                <span>PIN / Postal / Zip Code</span>
                <span className="text-[9px] text-secondary font-normal lowercase">(auto-detects country & rate)</span>
              </label>
              <input
                type="text"
                id="pinCode"
                name="pinCode"
                value={form.pinCode}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors font-medium tracking-wide"
                placeholder="Enter PIN / Zip / Postal code"
              />
              {formErrors.pinCode && <p className="text-[10px] text-red-500 font-medium">{formErrors.pinCode}</p>}
              
              {form.pinCode.trim().length > 0 && locationInfo.isSupported && (
                <p className="text-[10px] text-green-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-green-50 border border-green-200/50 p-2.5 rounded-xl w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                  ₹{shippingFee.toLocaleString('en-IN')} shipping fee applied for {regionLabel} ({form.country})
                </p>
              )}

              {form.pinCode.trim().length > 0 && !locationInfo.isSupported && (
                <p className="text-[10px] text-red-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-red-50 border border-red-200/50 p-2.5 rounded-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                  Sorry, but we do not currently deliver to your country
                </p>
              )}
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
                  State / Region
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

            {/* Razorpay Online Payment Button */}
            <button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={isProcessing || (form.pinCode.trim().length > 0 && !locationInfo.isSupported)}
              className="w-full rounded-xl bg-foreground py-3.5 text-xs font-bold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              {isProcessing ? 'Opening Payment Gateway...' : (form.pinCode.trim().length > 0 && !locationInfo.isSupported) ? 'Delivery Not Available to Your Location' : `Pay ₹${grandTotal.toLocaleString('en-IN')} Online (Razorpay)`}
            </button>

            {/* WhatsApp Alternative Checkout Button */}
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              disabled={form.pinCode.trim().length > 0 && !locationInfo.isSupported}
              className="w-full rounded-xl border border-border bg-background py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-border/20 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Order via WhatsApp
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
