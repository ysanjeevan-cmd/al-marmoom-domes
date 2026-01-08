import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Fetch data from Supabase
  const [
    { data: products },
    { data: pricingRules },
    { data: addons }
  ] = await Promise.all([
    supabase.from('products').select('*').order('rank', { ascending: true }),
    supabase.from('pricing_rules').select('*'),
    supabase.from('addons').select('*')
  ]);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
      <Navbar />
      <Hero>
        {/* Passing data to client widget */}
        <BookingWidget
          pricingRules={pricingRules || []}
          products={products || []}
          addons={addons || []}
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
