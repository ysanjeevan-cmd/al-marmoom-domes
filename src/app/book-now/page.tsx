import { Navbar } from "@/components/layout/Navbar";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { getPricing, getProducts, getAddons } from "@/lib/bubble";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Force dynamic rendering since we are fetching live data
export const dynamic = 'force-dynamic';

export default async function BookNowPage() {
    // Fetch data in parallel
    const [pricingRules, products, addons] = await Promise.all([
        getPricing(),
        getProducts(),
        getAddons()
    ]);

    return (
        <main className="min-h-screen bg-background font-sans">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-colors mb-6">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                    <FadeIn>
                        <h1 className="text-4xl font-bold mb-4 text-primary">Book Your Stay</h1>
                        <p className="text-muted text-lg">Secure your sanctuary in the dunes.</p>
                    </FadeIn>
                </div>

                {/* Using className to override homepage margins if needed or just letting it flow */}
                <BookingWidget
                    pricingRules={pricingRules}
                    products={products}
                    addons={addons}
                    className="mt-0"
                />
            </div>
        </main>
    );
}
