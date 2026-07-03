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
  address: string;
  city: string;
  state: string;
  pinCode: string;
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
