'use server';

import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Settings } from '@/types';
import { revalidatePath } from 'next/cache';

// Admin Login Server Action
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const expectedEmail = 'anjuharikrishnan95@gmail.com';
  const expectedPassword = 'adminadmin';

  if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
    const cookieStore = await cookies();
    cookieStore.set('thaarakam_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week session
    });
    return { success: true };
  }

  return { success: false, error: 'Incorrect email or password.' };
}

// Admin Logout Server Action
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('thaarakam_admin_session');
  return { success: true };
}

// Update settings
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

    revalidatePath('/');
    revalidatePath('/shop');
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error updating settings:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Insert or Update Product
export async function saveProduct(productData: any, productId?: string) {
  try {
    const admin = getSupabaseAdmin();
    
    // Ensure numbers are properly typed
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
      
      revalidatePath('/shop');
      revalidatePath(`/product/${productId}`);
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

      revalidatePath('/shop');
      if (data?.[0]?.id) {
        revalidatePath(`/product/${data[0].id}`);
      }
      return { success: true, data };
    }
  } catch (error: any) {
    console.error('Unexpected error saving product:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Delete Product
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

    revalidatePath('/shop');
    revalidatePath(`/product/${productId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error deleting product:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Revalidate product cache from client components
export async function revalidateProductDetails(id: string) {
  try {
    revalidatePath('/shop');
    revalidatePath(`/product/${id}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to revalidate path:', err);
    return { success: false };
  }
}
