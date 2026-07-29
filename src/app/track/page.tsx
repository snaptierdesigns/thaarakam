import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import TrackClient from './TrackClient';

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <TrackClient />
      </main>
      <Footer />
    </div>
  );
}
