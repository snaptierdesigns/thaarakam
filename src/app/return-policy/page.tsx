import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Return & Refund Policy | Thaarakam Jewellery',
  description: 'Read the official Return & Refund Policy for Thaarakam Jewellery. Understand the guidelines and requirements for damage-related replacements.',
};

export default function ReturnPolicyPage() {
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
              Return & Refund Policy
            </h1>
          </div>

          {/* Copy Content */}
          <div className="flex flex-col gap-6 text-sm leading-relaxed text-secondary select-text">
            
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Overview
              </h2>
              <p>
                We do not offer returns or refunds unless the product arrives damaged. We take utmost care in packaging our fine jewellery, but in the rare event of transit damage, we are committed to resolving your issue.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Unboxing Video Requirements
              </h2>
              <p className="border-l-2 border-foreground/30 pl-4 italic">
                To be eligible for a refund or replacement, customers must provide a continuous 360° unboxing video recorded from the moment the sealed courier package is opened until the product is fully removed and clearly shown. The video must be unedited and uninterrupted.
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Verification Guidelines
              </h2>
              <p>
                Claims submitted without a proper, raw unboxing video will not be accepted. Any evidence of tampering, editing, or fraudulent activity will result in the claim being rejected.
              </p>
              <p>
                We reserve the right to inspect all submitted evidence before approving any refund or replacement request. We appreciate your cooperation in maintaining store integrity.
              </p>
            </section>

            <section className="flex flex-col gap-2 mt-4 pt-6 border-t border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contact for Claims
              </h2>
              <p>
                If you have received a damaged product and have the required unboxing footage ready, please reach out to us directly via WhatsApp with your order details and attach the raw video file.
              </p>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
