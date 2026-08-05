import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import OrdersClient from './OrdersClient';

export const metadata = {
  title: 'Customer Orders Management | Admin Panel - Thaarakam',
  description: 'View and manage online customer orders.',
};

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow py-8">
        <OrdersClient />
      </main>
      <Footer />
    </div>
  );
}
