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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
            
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

            {/* Instagram Card */}
            <div className="rounded-2xl border border-border p-8 bg-background flex flex-col justify-between hover:border-foreground/30 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <span className="rounded-xl p-3 border border-border bg-border/5 text-foreground w-fit">
                  <svg className="h-5 w-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    Instagram Feed
                  </h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Follow us on Instagram for styling inspiration, daily updates, behind-the-scenes content, and new arrival announcements.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                <span className="text-sm font-semibold text-foreground">
                  @thaarakam_by_nithara
                </span>
                <a
                  href="https://www.instagram.com/thaarakam_by_nithara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border text-foreground hover:bg-border/10 py-3 text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.885.058 1.012.046 1.724.207 2.2.39a4.121 4.121 0 011.51 1.04 4.08 4.08 0 011.04 1.51c.182.476.343 1.188.39 2.2.049 1.1.058 1.455.058 3.885 0 2.43-.008 2.784-.058 3.885-.046 1.012-.207 1.724-.39 2.2a4.121 4.121 0 01-1.04 1.51 4.08 4.08 0 01-1.51 1.04c-.476.182-1.188.343-2.2.39-1.1.049-1.455.058-3.885.058-2.43 0-2.784-.008-3.885-.058-1.012-.046-1.724-.207-2.2-.39a4.122 4.122 0 01-1.51-1.04 4.08 4.08 0 01-1.04-1.51c-.182-.476-.343-1.188-.39-2.2-.049-1.1-.058-1.455-.058-3.885 0-2.43.008-2.784.058-3.885.046-1.012.207-1.724.39-2.2a4.122 4.122 0 011.04-1.51 4.08 4.08 0 011.51-1.04c.476-.182 1.188-.343 2.2-.39 1.1-.049 1.455-.058 3.885-.058zm-.21 2.32c-2.405 0-2.685.009-3.637.052-.876.04-1.352.186-1.669.31-.42.163-.72.358-1.036.673a3.111 3.111 0 00-.673 1.036c-.124.317-.27.793-.31 1.669-.043.952-.052 1.232-.052 3.637s.009 2.685.052 3.637c.04.876.186 1.352.31 1.669.163.42.358.72.673 1.036.317.317.617.512 1.036.673.317.124.793.27 1.669.31.952.043 1.232.052 3.637.052s2.685-.009 3.637-.052c.876-.04 1.352-.186 1.669-.31.42-.163.72-.358 1.036-.673.317-.317.512-.617.673-1.036.124-.317.27-.793.31-1.669.043-.952.052-1.232.052-3.637s-.009-2.685-.052-3.637c-.04-.876-.186-1.352-.31-1.669a3.111 3.111 0 00-.673-1.036 3.116 3.116 0 00-1.036-.673c-.317-.124-.793-.27-1.669-.31-.952-.043-1.233-.052-3.637-.052zm0 3.262a4.418 4.418 0 100 8.837 4.418 4.418 0 000-8.837zm0 7.037a2.62 2.62 0 110-5.24 2.62 2.62 0 010 5.24zm4.877-7.204a1.03 1.03 0 11-2.06 0 1.03 1.03 0 012.06 0z" />
                  </svg>
                  Visit Instagram
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
