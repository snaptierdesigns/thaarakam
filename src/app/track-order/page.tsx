import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import TrackOrderClient from './TrackOrderClient';

export const metadata = {
  title: 'Track Order - India Post Consignment Tracking | Thaarakam',
  description: 'Track your India Post consignment number for real-time delivery status.',
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <TrackOrderClient />
      </main>
      <Footer />
    </div>
  );
}
