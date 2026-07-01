import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/components/ui/CartProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-satoshi",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Thaarakam Jewellery | Premium & Elegant Fine Jewellery",
  description: "Explore Thaarakam's luxury collection of premium jewellery. Crafted with precision, featuring neckchains, bangles, rings, and watches. Simple ordering via WhatsApp.",
  keywords: ["jewellery", "luxury jewellery", "rings", "neckchains", "bangles", "stainless steel watches", "thaarakam"],
  authors: [{ name: "Thaarakam" }],
  openGraph: {
    title: "Thaarakam Jewellery | Premium & Elegant Fine Jewellery",
    description: "Explore Thaarakam's luxury collection of premium jewellery. Handcrafted elegance delivered directly to you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

