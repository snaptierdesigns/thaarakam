import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { Settings } from '@/types';

// Cryptographic constants for secure admin authentication
const SALT = 'THAARAKAM_SEC_SALT_2026_9x';
const EXPECTED_HASH = '49fc66109b5d5c4cd2dd9d6c10f97c4eba8ef88eb7ee248cf2f379a48cd63e8c';
export const VALID_ADMIN_SESSION_TOKEN = '4779e7a33bf221a0cad1e3a6ba6448e8ddee8e64f403b99463b780f89d6f4ddf';
const ALLOWED_EMAILS = ['anjuharikrishnan95@gmail.com', 'admin@thaarakam.in'];

async function computeHash(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

// Secure Admin Login helper using salted one-way hash
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!ALLOWED_EMAILS.includes(cleanEmail)) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  const computed = await computeHash(password + ':' + SALT);
  if (computed && computed === EXPECTED_HASH) {
    if (typeof document !== 'undefined') {
      document.cookie = `thaarakam_admin_session=${VALID_ADMIN_SESSION_TOKEN}; path=/; max-age=604800; SameSite=Lax`;
      try {
        localStorage.setItem('thaarakam_admin_session', VALID_ADMIN_SESSION_TOKEN);
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
