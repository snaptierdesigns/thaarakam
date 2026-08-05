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
  available_sizes?: (number | string)[] | null;
  out_of_stock_sizes?: (number | string)[] | null;
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
  selectedSize: number | string | null;
}

export interface CheckoutDetails {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: number | string | null;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  grand_total: number;
  payment_id?: string | null;
  razorpay_order_id?: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  consignment_number?: string | null;
  created_at: string;
}

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
