import React from 'react';
import OrdersClient from './OrdersClient';

export const metadata = {
  title: 'Customer Orders Management | Admin Panel - Thaarakam',
  description: 'View and manage online customer orders.',
};

export default function AdminOrdersPage() {
  return <OrdersClient />;
}
