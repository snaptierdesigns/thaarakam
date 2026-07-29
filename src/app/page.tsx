import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { queryD1 } from '@/lib/d1';
import { Product, Settings, CATEGORIES } from '@/types';
import { Search, Gem, Heart } from 'lucide-react';

// Enable Incremental Static Regeneration (ISR) for Cloudflare Pages Edge deployment
export const revalidate = 86400;

async function getHomepageData() {
  try {
    const [settingsRes, featuredRes, newArrivalsRes] = await Promise.all([
      queryD1('SELECT * FROM settings WHERE id = 1 LIMIT 1'),
      queryD1("SELECT * FROM products WHERE is_featured = 1 AND name != 'General Store Review Placeholder' ORDER BY created_at DESC LIMIT 4"),
      queryD1("SELECT * FROM products WHERE name != 'General Store Review Placeholder' ORDER BY created_at DESC LIMIT 4")
    ]);
    const settings = (settingsRes.success && settingsRes.results[0]) ? settingsRes.results[0] as Settings : null;

    const parseImgs = (items: any[]) => (items || []).map((p: any) => {
      try { p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch (e) {}
      return p as Product;
    });

    const featuredProducts = parseImgs(featuredRes.results);
    const newArrivals = parseImgs(newArrivalsRes.results);

    return {
      settings,
      featuredProducts,
      newArrivals,
    };
  } catch (error) {
    console.error('Unexpected error fetching homepage data:', error);
    return {
      settings: null,
      featuredProducts: [],
      newArrivals: [],
    };
  }
}

export default async function HomePage() {
  const { settings, featuredProducts, newArrivals } = await getHomepageData();
  
  // Use wtulip.jpeg or cgrace.jpeg if present in public folder, else fallback
  const heroImage = '/images/intro1.jpeg';

  return (
    <>
      <Navbar />
      
      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-center py-2 px-4 text-[10px] uppercase font-bold tracking-[0.15em] select-none">
        ✨ Prepaid Orders Only • Cash On Delivery (COD) is not available ✨
      </div>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border py-16 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Hero text */}
              <div className="lg:col-span-6 flex flex-col items-start justify-center gap-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
                  Fine Jewellery
                </span>
                <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1] font-sans">
                  Simplicity is the <br />
                  <span className="font-normal italic">ultimate</span> luxury.
                </h1>
                <p className="max-w-md text-sm leading-relaxed text-secondary">
                  Explore {settings?.business_name || 'Thaarakam\'s'} latest collection of hand-crafted anti-tarnish jewellery. Timeless designs designed for daily comfort.
                </p>
                <div className="mt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-xs font-semibold text-background hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Shop Collection
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-border/20 border border-border/40">
                  <img
                    src={heroImage}
                    alt="Thaarakam Collection Hero"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 border-b border-border">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <h2 className="text-2xl font-light tracking-wider uppercase text-foreground">
                Featured Products
              </h2>
              <div className="h-[1px] w-12 bg-foreground/60" />
            </div>

            {featuredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-xs text-secondary italic">Our catalog is currently being updated. Check back soon.</p>
                <Link href="/admin/products" className="mt-4 text-[10px] uppercase tracking-wider font-semibold hover:underline">
                  Add products in admin panel →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-x-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Shop By Category Section */}
        <section className="py-20 border-b border-border bg-border/5">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <h2 className="text-2xl font-light tracking-wider uppercase text-foreground">
                Shop By Category
              </h2>
              <div className="h-[1px] w-12 bg-foreground/60" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(category)}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 hover:border-foreground/40 transition-all duration-350"
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground tracking-wide group-hover:text-foreground/80 transition-colors">
                      {category}
                    </h3>
                    <p className="mt-1 text-[10px] text-secondary uppercase tracking-widest">
                      Explore Collection
                    </p>
                  </div>
                  <span className="mt-8 text-xs font-semibold text-foreground group-hover:translate-x-1.5 transition-transform inline-block">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-20 border-b border-border">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <h2 className="text-2xl font-light tracking-wider uppercase text-foreground">
                New Arrivals
              </h2>
              <div className="h-[1px] w-12 bg-foreground/60" />
            </div>

            {newArrivals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-xs text-secondary italic">No products added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-x-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 px-5 py-2.5 text-xs font-semibold hover:bg-foreground/5 hover:border-foreground/30 transition-all"
              >
                View Full Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* Face of Thaarakam / About Section */}
        <section className="py-24 border-b border-border bg-border/5" id="about">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Left Side: Photo (somewhat like TULA screenshot) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl bg-border/20 border border-border/40 shadow-sm">
                  <img
                    src="/images/thaarakamintro.jpeg"
                    alt="Face of Thaarakam"
                    className="h-full w-full object-cover object-center animate-fadeIn"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Side: Text & Value points */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">
                    Face of Thaarakam
                  </span>
                  <h2 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl leading-tight">
                    Thaarakam is a big dream.<br />
                    And every tiny detail is a big effort.
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-secondary max-w-xl">
                  What started as a quiet dream is now our everyday commitment. From sketches and samples to sourcing and setting, every step is taken with care, patience, and purpose — to create pieces that feel just right.
                </p>

                {/* Values Stack */}
                <div className="flex flex-col gap-6 mt-4">
                  {/* Point 1 */}
                  <div className="flex gap-4 items-start">
                    <span className="rounded-full bg-background p-2.5 border border-border text-foreground flex-shrink-0">
                      <Search className="h-4 w-4 stroke-[1.8]" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Carefully Handpicked
                      </h3>
                      <p className="text-xs text-secondary leading-relaxed max-w-lg">
                        We personally handpick every product, for its design, quality, and the way it makes you feel.
                      </p>
                    </div>
                  </div>

                  {/* Point 2 */}
                  <div className="flex gap-4 items-start">
                    <span className="rounded-full bg-background p-2.5 border border-border text-foreground flex-shrink-0">
                      <Gem className="h-4 w-4 stroke-[1.8]" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Quality You Can Trust
                      </h3>
                      <p className="text-xs text-secondary leading-relaxed max-w-lg">
                        We never compromise on quality. Our jewelry is crafted using durable, skin-friendly materials that are made to last and made for everyday wear.
                      </p>
                    </div>
                  </div>

                  {/* Point 3 */}
                  <div className="flex gap-4 items-start">
                    <span className="rounded-full bg-background p-2.5 border border-border text-foreground flex-shrink-0">
                      <Heart className="h-4 w-4 stroke-[1.8]" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Made For You
                      </h3>
                      <p className="text-xs text-secondary leading-relaxed max-w-lg">
                        Lightweight, timeless, and versatile — our pieces are designed to be with you in every room, at every hour, of your life.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-6 pt-6 border-t border-border/80 max-w-xl">
                  <p className="text-xs italic font-semibold text-foreground">
                    Thaarakam is more than jewelry. It&apos;s our dream, our effort, and our promise to you.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
