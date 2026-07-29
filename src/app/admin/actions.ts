import { queryD1 } from '@/lib/d1';
import { Settings } from '@/types';

// Admin Login helper
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const expectedEmail = 'anjuharikrishnan95@gmail.com';
  const expectedPassword = 'adminadmin';

  if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
    if (typeof document !== 'undefined') {
      document.cookie = "thaarakam_admin_session_v2=auth_v2_98472; path=/; max-age=604800; SameSite=Lax";
      document.cookie = "thaarakam_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      try {
        localStorage.setItem('thaarakam_admin_session_v2', 'auth_v2_98472');
        localStorage.removeItem('thaarakam_admin_session');
      } catch (e) {}
    }
    return { success: true };
  }

  return { success: false, error: 'Incorrect email or password.' };
}

// Admin Logout helper
export async function logoutAdmin() {
  if (typeof document !== 'undefined') {
    document.cookie = "thaarakam_admin_session_v2=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "thaarakam_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      localStorage.removeItem('thaarakam_admin_session_v2');
      localStorage.removeItem('thaarakam_admin_session');
    } catch (e) {}
  }
  return { success: true };
}

// Update settings helper
export async function updateStoreSettings(settingsData: Partial<Settings>) {
  try {
    const fields: string[] = [];
    const params: any[] = [];

    if (settingsData.business_name !== undefined) { fields.push('business_name = ?'); params.push(settingsData.business_name); }
    if (settingsData.logo_url !== undefined) { fields.push('logo_url = ?'); params.push(settingsData.logo_url); }
    if (settingsData.whatsapp_number !== undefined) { fields.push('whatsapp_number = ?'); params.push(settingsData.whatsapp_number); }
    if (settingsData.store_email !== undefined) { fields.push('store_email = ?'); params.push(settingsData.store_email); }
    if (settingsData.shipping_kerala !== undefined) { fields.push('shipping_kerala = ?'); params.push(Number(settingsData.shipping_kerala)); }
    if (settingsData.shipping_south_india !== undefined) { fields.push('shipping_south_india = ?'); params.push(Number(settingsData.shipping_south_india)); }
    if (settingsData.shipping_north_india !== undefined) { fields.push('shipping_north_india = ?'); params.push(Number(settingsData.shipping_north_india)); }
    if (settingsData.default_description !== undefined) { fields.push('default_description = ?'); params.push(settingsData.default_description); }

    if (fields.length === 0) return { success: true };

    const sql = `UPDATE settings SET ${fields.join(', ')} WHERE id = 1`;
    const res = await queryD1(sql, params);

    return { success: res.success, error: res.error };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error updating settings' };
  }
}

// Insert or Update Product helper
export async function saveProduct(productData: any, productId?: string) {
  try {
    const name = productData.name;
    const price = Number(productData.price);
    const category = productData.category;
    const images = typeof productData.images === 'string' ? productData.images : JSON.stringify(productData.images || []);
    const description = productData.description || null;
    const is_featured = productData.is_featured ? 1 : 0;
    const requires_size = productData.requires_size ? 1 : 0;
    const max_size = productData.requires_size ? Number(productData.max_size || 18) : null;
    const custom_sizes = JSON.stringify(Array.isArray(productData.custom_sizes) ? productData.custom_sizes : []);
    const sizes_out_of_stock = JSON.stringify(Array.isArray(productData.sizes_out_of_stock) ? productData.sizes_out_of_stock : []);
    const is_preorder = productData.is_preorder ? 1 : 0;
    const availability = productData.availability || 'in_stock';
    const stock_count = productData.stock_count !== undefined && productData.stock_count !== null ? Number(productData.stock_count) : 10;

    if (productId) {
      const sql = `UPDATE products SET name = ?, price = ?, category = ?, images = ?, description = ?, is_featured = ?, requires_size = ?, max_size = ?, custom_sizes = ?, sizes_out_of_stock = ?, is_preorder = ?, availability = ?, stock_count = ? WHERE id = ?`;
      const params = [name, price, category, images, description, is_featured, requires_size, max_size, custom_sizes, sizes_out_of_stock, is_preorder, availability, stock_count, productId];
      const res = await queryD1(sql, params);
      return { success: res.success, error: res.error };
    } else {
      const newId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const sql = `INSERT INTO products (id, name, price, category, images, description, is_featured, requires_size, max_size, custom_sizes, sizes_out_of_stock, is_preorder, availability, stock_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [newId, name, price, category, images, description, is_featured, requires_size, max_size, custom_sizes, sizes_out_of_stock, is_preorder, availability, stock_count, createdAt];
      const res = await queryD1(sql, params);
      return { success: res.success, error: res.error };
    }
  } catch (error: any) {
    console.error('Unexpected error saving product:', error);
    return { success: false, error: error?.message || 'Server error' };
  }
}

// Delete Product helper
export async function deleteProduct(productId: string) {
  try {
    const res = await queryD1('DELETE FROM products WHERE id = ?', [productId]);
    return { success: res.success, error: res.error };
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
    const newId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const sql = `INSERT INTO reviews (id, product_id, reviewer_name, rating, comment, is_verified, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`;
    const params = [newId, reviewData.product_id || null, reviewData.reviewer_name, Number(reviewData.rating), reviewData.comment || '', createdAt];
    const res = await queryD1(sql, params);
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add review' };
  }
}

// Delete Review helper
export async function deleteReview(reviewId: string) {
  try {
    const res = await queryD1('DELETE FROM reviews WHERE id = ?', [reviewId]);
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete review' };
  }
}

// Record Paid Order helper
export async function recordPaidOrder(orderData: any) {
  try {
    const newId = crypto.randomUUID();
    const orderNumber = `THK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const itemsStr = typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items);

    const sql = `INSERT INTO orders (id, order_number, customer_name, customer_phone, customer_email, country, address, city, state, pincode, items, subtotal, shipping_fee, total_amount, payment_status, razorpay_order_id, razorpay_payment_id, shipping_status, tracking_number, carrier_name, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', NULL, 'India Post', ?, ?)`;
    const params = [
      newId,
      orderNumber,
      orderData.customer_name,
      orderData.customer_phone,
      orderData.customer_email || null,
      orderData.country || 'India',
      orderData.address,
      orderData.city,
      orderData.state,
      orderData.pincode,
      itemsStr,
      Number(orderData.subtotal),
      Number(orderData.shipping_fee),
      Number(orderData.total_amount),
      orderData.payment_status || 'paid',
      orderData.razorpay_order_id || null,
      orderData.razorpay_payment_id || null,
      orderData.notes || null,
      createdAt
    ];

    const res = await queryD1(sql, params);

    // Decrement stock for ordered items
    if (orderData.cartItems) {
      await decrementStockAfterCheckout(orderData.cartItems.map((item: any) => ({
        id: item.product?.id || item.id,
        quantity: item.quantity,
      })));
    }

    return { success: res.success, orderNumber, error: res.error };
  } catch (err: any) {
    console.error('Error recording paid order:', err);
    return { success: false, error: err?.message || 'Order insertion error' };
  }
}

// Fetch All Orders helper
export async function getOrders() {
  try {
    const res = await queryD1('SELECT * FROM orders ORDER BY created_at DESC');
    return { success: res.success, orders: res.results || [] };
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
    let sql = `UPDATE orders SET shipping_status = ?`;
    const params: any[] = [shipping_status];

    if (tracking_number !== undefined) {
      sql += `, tracking_number = ?`;
      params.push(tracking_number.trim());
    }

    sql += ` WHERE id = ?`;
    params.push(orderId);

    const res = await queryD1(sql, params);
    return { success: res.success, error: res.error };
  } catch (err: any) {
    console.error('Error updating order:', err);
    return { success: false, error: err?.message || 'Update error' };
  }
}

// Decrement stock after checkout helper
export async function decrementStockAfterCheckout(items: { id: string; quantity: number }[]) {
  try {
    for (const item of items) {
      const prodRes = await queryD1('SELECT stock_count FROM products WHERE id = ?', [item.id]);
      const prod = prodRes.results[0];

      if (prod && prod.stock_count !== null && prod.stock_count !== undefined) {
        const newStock = Math.max(0, prod.stock_count - item.quantity);
        const newAvailability = newStock === 0 ? 'out_of_stock' : 'in_stock';

        await queryD1('UPDATE products SET stock_count = ?, availability = ? WHERE id = ?', [newStock, newAvailability, item.id]);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('Stock decrement error:', err);
    return { success: false, error: err?.message || 'Stock decrement error' };
  }
}
