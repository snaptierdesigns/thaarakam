import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Thaarakam Jewellery',
  description: 'Reach out to Thaarakam Jewellery. Contact us via email or WhatsApp for order inquiries, sizing details, and custom consultations.',
};

export default function ContactPage() {
  const email = 'anjuharikrishnan95@gmail.com';
  const phone = '8921356009';
  const whatsappLink = `https://wa.me/91${phone}`;

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
              Get in Touch
            </span>
            <h1 className="text-3xl font-light tracking-wide uppercase text-foreground sm:text-4xl">
              Contact Us
            </h1>
            <div className="h-[1px] w-12 bg-foreground/60 mt-1" />
            <p className="max-w-md text-xs text-secondary mt-2 leading-relaxed">
              Have questions about our collections, sizing, shipping, or need a custom consultation? We are here to help you.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            
            {/* WhatsApp Card */}
            <div className="rounded-2xl border border-border p-8 bg-background flex flex-col justify-between hover:border-foreground/30 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <span className="rounded-xl p-3 border border-border bg-border/5 text-foreground w-fit">
                  <MessageSquare className="h-5 w-5 stroke-[1.5]" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    WhatsApp & Phone
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Message us directly on WhatsApp for instant assistance with orders, custom sizing, and product availability.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                <span className="text-sm font-semibold text-foreground">
                  +91 {phone}
                </span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-foreground text-background py-3 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-2xl border border-border p-8 bg-background flex flex-col justify-between hover:border-foreground/30 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <span className="rounded-xl p-3 border border-border bg-border/5 text-foreground w-fit">
                  <Mail className="h-5 w-5 stroke-[1.5]" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    Email Inquiry
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Send us an email for general inquiries, corporate collaborations, or feedback. We respond to all emails within 24 hours.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {email}
                </span>
                <a
                  href={`mailto:${email}`}
                  className="rounded-xl border border-border text-foreground hover:bg-border/10 py-3 text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send an Email
                </a>
              </div>
            </div>

          </div>



        </div>
      </main>

      <Footer />
    </>
  );
}
