/**
 * Cloudflare Pages Function — Razorpay Server-to-Server Webhook
 * Route: /api/razorpay-webhook
 * Ensures 100% reliable order recording in Supabase even if customer closes browser tab.
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const bodyText = await request.text();
    const eventData = JSON.parse(bodyText);

    console.log('Razorpay Webhook Received Event:', eventData.event);

    if (eventData.event === 'payment.captured' || eventData.event === 'order.paid') {
      const payment = eventData.payload.payment.entity;

      const paymentId = payment.id;
      const amount = payment.amount / 100; // convert paise to INR
      const email = payment.email || '';
      const phone = payment.contact || '';
      const notes = payment.notes || {};
      const orderNumber = notes.order_number || `TH-${Date.now().toString().slice(-6)}`;
      const shippingAddress = notes.shipping_address || 'Customer Order via Razorpay';

      const supabaseUrl = 'https://qkebwcsyvazjcbukyyvu.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZWJ3Y3N5dmF6amNidWt5eXZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyNDc1NCwiZXhwIjoyMTAxNTAwNzU0fQ.AWhi8mHOyEuiG7jcgXZ5yuOzdIX80xrW2MK-untK7K0';

      // Check if order already exists
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/orders?payment_id=eq.${paymentId}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      const existingOrders = await checkRes.json();
      if (existingOrders && existingOrders.length > 0) {
        console.log(`Order ${paymentId} already exists in DB.`);
        return new Response(JSON.stringify({ status: 'already_exists' }), { status: 200 });
      }

      // Insert order into Supabase
      const newOrder = {
        order_number: orderNumber,
        customer_name: payment.notes?.customer_name || 'Razorpay Customer',
        customer_phone: phone,
        customer_email: email,
        address: shippingAddress,
        city: 'Kerala',
        state: 'Kerala',
        country: 'India',
        pincode: '000000',
        items: [{ id: 'razorpay', name: 'Thaarakam Order', price: amount - 50, quantity: 1 }],
        subtotal: amount - 50,
        shipping_fee: 50,
        grand_total: amount,
        payment_id: paymentId,
        payment_status: 'paid',
        order_status: 'pending',
        created_at: new Date().toISOString()
      };

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([newOrder])
      });

      if (insertRes.ok) {
        console.log(`Successfully saved webhook order ${paymentId} to Supabase!`);
        return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
      } else {
        console.error('Webhook insert error:', await insertRes.text());
        return new Response(JSON.stringify({ status: 'error' }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ status: 'ignored_event' }), { status: 200 });
  } catch (err) {
    console.error('Razorpay Webhook Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
