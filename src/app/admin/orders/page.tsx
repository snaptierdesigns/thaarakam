import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import OrdersClient from './OrdersClient';
import { getOrders } from '@/app/admin/actions';

export default async function AdminOrdersPage() {
  const { orders } = await getOrders();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <OrdersClient initialOrders={orders} />
      </main>
      <Footer />
    </div>
  );
}
