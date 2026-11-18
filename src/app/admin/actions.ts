import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { Settings } from '@/types';

// Cryptographic constants for secure admin authentication
const SALT = 'THAARAKAM_SEC_SALT_2026_9x';
const EXPECTED_HASH = '49fc66109b5d5c4cd2dd9d6c10f97c4eba8ef88eb7ee248cf2f379a48cd63e8c';
export const VALID_ADMIN_SESSION_TOKEN = '4779e7a33bf221a0cad1e3a6ba6448e8ddee8e64f403b99463b780f89d6f4ddf';

// Pure, zero-dependency SHA-256 implementation guaranteeing 100% reliability across all browsers/environments
function pureSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const maxWord = Math.pow(2, 32);
  let i: number, j: number;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: { [key: number]: number } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];
    for (i = 0; i < 64; i++) {
      const i2 =
        i < 16
          ? w[i]
          : ((rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10)) +
              (w[i - 7] | 0) +
              (rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3)) +
              (w[i - 16] | 0)) |
            0;
      w[i] = i2;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ch +
          k[i] +
          i2) |
        0;
      const temp2 =
        ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
          maj) |
        0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Secure Admin Login helper using salted one-way hash
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.trim()) {
    return { success: false, error: 'Please enter your email.' };
  }

  const computed = pureSha256(password.trim() + ':' + SALT);
  if (computed === EXPECTED_HASH) {
    if (typeof document !== 'undefined') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secureAttr = isHttps ? '; Secure' : '';
      document.cookie = `thaarakam_admin_session=authenticated; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
      try {
        localStorage.setItem('thaarakam_admin_session', 'authenticated');
      } catch (e) {}
    }
    return { success: true };
  }

  return { success: false, error: 'Incorrect email or password.' };
}

// Admin Logout helper
export async function logoutAdmin() {
  if (typeof document !== 'undefined') {
    document.cookie = "thaarakam_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      localStorage.removeItem('thaarakam_admin_session');
    } catch (e) {}
  }
  return { success: true };
}

// Update settings helper
export async function updateStoreSettings(settingsData: Partial<Settings>) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('settings')
      .update(settingsData)
      .eq('id', 1);

    if (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error updating settings' };
  }
}

// Insert or Update Product helper
export async function saveProduct(productData: any, productId?: string) {
  try {
    const admin = getSupabaseAdmin();
    
    const payload = {
      name: productData.name,
      price: Number(productData.price),
      category: productData.category,
      images: productData.images,
      description: productData.description || null,
      is_featured: Boolean(productData.is_featured),
      requires_size: Boolean(productData.requires_size),
      max_size: productData.requires_size ? Number(productData.max_size || 18) : null,
      is_preorder: Boolean(productData.is_preorder),
      availability: productData.availability || 'in_stock',
      stock_count: productData.stock_count !== undefined && productData.stock_count !== null ? Number(productData.stock_count) : null,
    };

    if (productId) {
      const { data, error } = await admin
        .from('products')
        .update(payload)
        .eq('id', productId)
        .select();

      if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } else {
      const { data, error } = await admin
        .from('products')
        .insert([payload])
        .select();

      if (error) {
        console.error('Error inserting product:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
  } catch (error: any) {
    console.error('Unexpected error saving product:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Delete Product helper
export async function deleteProduct(productId: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error deleting product:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Add Review By Admin helper
export async function addReviewByAdmin(reviewData: {
  product_id?: string | null;
  reviewer_name: string;
  rating: number;
  comment?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('reviews')
      .insert([{
        product_id: reviewData.product_id || null,
        reviewer_name: reviewData.reviewer_name,
        rating: Number(reviewData.rating),
        comment: reviewData.comment || '',
      }])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add review' };
  }
}

// Delete Review helper
export async function deleteReview(reviewId: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete review' };
  }
}

// Decrement stock after checkout helper
export async function decrementStockAfterCheckout(items: { id: string; quantity: number }[]) {
  try {
    const admin = getSupabaseAdmin();
    for (const item of items) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock_count')
        .eq('id', item.id)
        .single();

      if (prod && prod.stock_count !== null && prod.stock_count !== undefined) {
        const newStock = Math.max(0, prod.stock_count - item.quantity);
        const newAvailability = newStock === 0 ? 'out_of_stock' : 'in_stock';

        await admin
          .from('products')
          .update({
            stock_count: newStock,
            availability: newAvailability,
          })
          .eq('id', item.id);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('Stock decrement error:', err);
    return { success: false, error: err?.message || 'Stock decrement error' };
  }
}
