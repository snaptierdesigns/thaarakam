import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Privacy Policy | Thaarakam Jewellery',
  description: 'Read the official Privacy Policy for Thaarakam Jewellery. Learn how we collect, store, and process your delivery information.',
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
          </div>

          {/* Copy Content */}
          <div className="flex flex-col gap-6 text-sm leading-relaxed text-secondary select-text">
            
            <p>
              <strong>Thaarakam</strong> operates this store and website, including all related information, content, features, tools, products, and services, in order to provide you, the customer, with a curated shopping experience (the &quot;Services&quot;). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us.
            </p>

            <p>
              Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described herein.
            </p>

            {/* Section 1 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                Personal Information We Collect or Process
              </h2>
              <p>
                When we use the term &quot;personal information,&quot; we are referring to information that identifies or can reasonably be linked to you. We may collect or process the following categories of personal information, depending on how you interact with the Services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-1">
                <li><strong>Contact details</strong> including your name, shipping address, phone number, and email address.</li>
                <li><strong>Transaction information</strong> including the items you view, put in your cart, or purchase, and your past transactions.</li>
                <li><strong>Communications with us</strong> including the details you include in communications, such as when sending a customer support inquiry.</li>
                <li><strong>Device and Usage information</strong> including information about your device, browser, network connection, IP address, and details regarding your interaction with the Services.</li>
              </ul>
              <p className="mt-2 text-xs italic bg-border/20 p-3 rounded-lg border border-border/40">
                <strong>Note on Payment Details:</strong> Thaarakam operates on a WhatsApp-based checkout system. We do not store or process credit cards, debit cards, or billing accounts on this website. Payments are completed securely and privately off-site during your WhatsApp consultation.
              </p>
            </section>

            {/* Section 2 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                Personal Information Sources
              </h2>
              <p>
                We may collect personal information from the following sources:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li><strong>Directly from you</strong> including when you visit or use the Services, communicate with us, or place an order.</li>
                <li><strong>Automatically through the Services</strong> using cookies and similar web analytics.</li>
                <li><strong>From our database providers</strong> (such as Supabase) who process data on our behalf.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                How We Use Your Personal Information
              </h2>
              <p>
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-1">
                <li><strong>Provide and Improve the Services:</strong> To process your cart details, compile your delivery address, arrange shipping, and create a customized shopping experience.</li>
                <li><strong>Communicating with You:</strong> To provide customer support, confirm order details over WhatsApp, and maintain our business relationship.</li>
                <li><strong>Security and Fraud Prevention:</strong> To identify, investigate, or take action regarding potential fraudulent, illegal, or malicious activity.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and cooperate with valid legal processes.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                How We Disclose Personal Information
              </h2>
              <p>
                We may disclose your personal information in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-1">
                <li>With infrastructure providers who perform services on our behalf (e.g. database host Supabase, cloud storage providers).</li>
                <li>When you explicitly direct or request us to share details (such as sharing delivery addresses with shipping couriers).</li>
                <li>To comply with legal obligations, enforce terms of service, and protect or defend our rights, users, or others.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                Third-Party Websites and Links
              </h2>
              <p>
                Our services provide links to WhatsApp. If you follow links to sites not affiliated with or controlled by us, you should review their own privacy policies. We are not responsible for the privacy or security of third-party platforms.
              </p>
            </section>

            {/* Section 6 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                Security and Retention of Your Information
              </h2>
              <p>
                Please be aware that no security measures are perfect, and we cannot guarantee absolute security. Any information you send to us may not be secure while in transit. We recommend using secure channels for sensitive information.
              </p>
              <p>
                How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
              </p>
            </section>

            {/* Section 7 */}
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mt-4">
                Your Rights and Choices
              </h2>
              <p>
                Depending on your location, you may have rights to access, delete, or correct the personal data we hold. You can manage your preferences or request data modifications by contacting us directly.
              </p>
            </section>

            {/* Section 8 */}
            <section className="flex flex-col gap-2 mt-4 pt-6 border-t border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contact Us
              </h2>
              <p>
                Should you have any questions about our privacy practices, this Privacy Policy, or if you would like to exercise any of your rights, please contact us:
              </p>
              <ul className="mt-2 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:anjuharikrishnan95@gmail.com" className="underline hover:text-foreground transition-colors">anjuharikrishnan95@gmail.com</a></li>
                <li><strong>Phone / WhatsApp:</strong> <a href="tel:8921356009" className="underline hover:text-foreground transition-colors">8921356009</a></li>
              </ul>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
