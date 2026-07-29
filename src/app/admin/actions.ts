import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { Settings } from '@/types';

// Admin Login helper
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const expectedEmail = 'anjuharikrishnan95@gmail.com';
  const expectedPassword = 'adminadmin';

  if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
    if (typeof document !== 'undefined') {
      document.cookie = "thaarakam_admin_session=authenticated; path=/; max-age=604800; SameSite=Lax";
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
      custom_sizes: Array.isArray(productData.custom_sizes) ? productData.custom_sizes : [],
      sizes_out_of_stock: Array.isArray(productData.sizes_out_of_stock) ? productData.sizes_out_of_stock : [],
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

// Record Paid Order helper
export async function recordPaidOrder(orderData: any) {
  try {
    const admin = getSupabaseAdmin();
    const orderNumber = `THK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email || null,
      country: orderData.country || 'India',
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      pincode: orderData.pincode,
      items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items),
      subtotal: Number(orderData.subtotal),
      shipping_fee: Number(orderData.shipping_fee),
      total_amount: Number(orderData.total_amount),
      payment_status: orderData.payment_status || 'paid',
      razorpay_order_id: orderData.razorpay_order_id || null,
      razorpay_payment_id: orderData.razorpay_payment_id || null,
      shipping_status: 'processing',
      tracking_number: null,
      carrier_name: 'India Post',
      notes: orderData.notes || null,
    };

    const { data, error } = await admin
      .from('orders')
      .insert([payload])
      .select();

    if (error) {
      console.error('Error inserting order into Supabase:', error);
    }

    // Decrement stock for ordered items
    if (orderData.cartItems) {
      await decrementStockAfterCheckout(orderData.cartItems.map((item: any) => ({
        id: item.product?.id || item.id,
        quantity: item.quantity,
      })));
    }

    return { success: true, orderNumber, data: data?.[0] || payload };
  } catch (err: any) {
    console.error('Error recording paid order:', err);
    return { success: false, error: err?.message || 'Order insertion error' };
  }
}

// Fetch All Orders helper
export async function getOrders() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, orders: [] };
    }

    return { success: true, orders: data || [] };
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return { success: false, orders: [] };
  }
}

// Update Order Shipping Status & Tracking helper
export async function updateOrderShippingStatus(
  orderId: string,
  shipping_status: string,
  tracking_number?: string
) {
  try {
    const admin = getSupabaseAdmin();
    const payload: any = { shipping_status };
    if (tracking_number !== undefined) {
      payload.tracking_number = tracking_number.trim();
    }

    const { error } = await admin
      .from('orders')
      .update(payload)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order shipping status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating order:', err);
    return { success: false, error: err?.message || 'Update error' };
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

