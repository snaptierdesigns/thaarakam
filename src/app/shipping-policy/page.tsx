import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Shipping Policy | Thaarakam Jewellery',
  description: 'Read the official Shipping Policy for Thaarakam Jewellery. Understand order processing, delivery timelines, and courier partnerships.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[700px] px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex flex-col gap-3 mb-10 border-b border-border pb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
              Store Information
            </span>
            <h1 className="text-3xl font-light tracking-wide uppercase text-foreground">
              Shipping Policy
            </h1>
          </div>

          {/* Copy Content */}
          <div className="flex flex-col gap-6 text-sm leading-relaxed text-secondary select-text">
            
            <p className="italic text-foreground">
              Thank you for shopping with us! We aim to process and deliver your orders as quickly as possible.
            </p>

            {/* Section 1 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-2">
                Order Processing
              </h2>
              <p>
                All orders are processed and dispatched within <strong>2 business days</strong> after your order is confirmed.
              </p>
            </section>

            {/* Section 2 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-2">
                Shipping Partner
              </h2>
              <p>
                We ship all orders through <strong>India Post</strong> to ensure safe and reliable delivery across India.
              </p>
            </section>

            {/* Section 3 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-2">
                Estimated Delivery Time
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 mt-1">
                <li>Once dispatched, orders are typically delivered within <strong>7 working days</strong>.</li>
                <li>Delivery times may vary depending on your location, weather conditions, public holidays, or other unforeseen circumstances.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-2">
                Home Delivery
              </h2>
              <p>
                Home delivery is subject to the service availability of your nearest local India Post office. In areas where home delivery is not available, customers may be required to collect their parcel from their nearest post office.
              </p>
            </section>

            {/* Section 5 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-2">
                Order Tracking
              </h2>
              <p>
                Tracking details will be shared only upon request. Customers who require tracking information can request it, and it will be provided within 3 days after dispatch.
              </p>
            </section>

            {/* Section 6 */}
            <section className="flex flex-col gap-2 mt-4 pt-6 border-t border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Delivery Delays
              </h2>
              <p>
                While we strive to deliver every order on time, delays caused by the courier service or factors beyond our control may occasionally occur. We appreciate your patience and understanding in such situations.
              </p>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
