export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string | null;
  is_featured: boolean;
  requires_size: boolean;
  max_size: number | null;
  custom_sizes?: number[] | null;
  sizes_out_of_stock?: number[] | null;
  is_preorder: boolean;
  availability: 'in_stock' | 'out_of_stock';
  stock_count: number | null;
  created_at: string;
}

export interface Settings {
  id: number;
  business_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  store_email: string | null;
  shipping_kerala: number;
  shipping_south_india: number;
  shipping_north_india: number;
  default_description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: number | null;
}

export interface CheckoutDetails {
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  country: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: number | null;
    is_preorder?: boolean;
  }>;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  shipping_status: 'processing' | 'shipped' | 'delivered';
  tracking_number?: string | null;
  carrier_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export const COUNTRY_SHIPPING_RATES: Record<string, number> = {
  'India': 0, // Calculated dynamically by pincode
  'United Kingdom': 2700,
  'United States': 2600,
  'Canada': 2200,
  'Maldives': 2100,
  'Lakshadweep': 2100,
  'Singapore': 2000,
  'United Arab Emirates': 2200,
  'Sri Lanka': 1500,
  'Bangladesh': 1500,
  'Other International': 2800,
};

export const CATEGORIES = [
  'Neckchains',
  'Pendant',
  'Bangles',
  'Bracelets and Hand Chains',
  'Rings',
  'Stainless Steel Watches',
  'Earrings & Studs',
  'Nose Rings & Nose Pins',
  'Anklets',
  'Waist Chains',
  'Kid\'s Accessories',
  'Men\'s Accessories'
] as const;

export type CategoryType = typeof CATEGORIES[number];

