import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { getPricing, getProducts, getAddons } from "@/lib/bubble";

export default async function Home() {
  // Fetch data in parallel
  // We prioritize fetching Catalog (Products/Addons) server-side for SEO and init speed
  const [pricingRules, products, addons] = await Promise.all([
    getPricing(),
    getProducts(),
    getAddons()
  ]);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
      <Navbar />
      <Hero>
        <BookingWidget
          pricingRules={pricingRules}
          products={products}
          addons={addons}
          className="-mt-12"
        />
      </Hero>

      <div className="h-24"></div>

      {/* Floating Book Now Button - Fixed to Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/book-now">
          <button className="bg-primary text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 border-4 border-white">
            Book Now
            <ChevronRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </main>
  );
}
