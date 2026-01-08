import { getBooking } from "@/lib/booking-logic";
import { FadeIn } from "@/components/ui/FadeIn";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutPageClient from "@/components/booking/CheckoutPageClient";
import { Button } from "@/components/ui/Button";

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ bookingId?: string }>;
}) {
    const { bookingId } = await searchParams;

    if (!bookingId) {
        redirect("/");
    }

    const booking = await getBooking(bookingId);

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Booking Not Found</h1>
                    <p className="text-muted mb-6">We couldn't find booking ID: <code className="bg-gray-100 px-1 rounded">{bookingId}</code></p>
                    <p className="text-xs text-muted max-w-md mx-auto mb-6">Check your Bubble App Settings &gt; API &gt; Data API. Ensure "booking" is checked.</p>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#394231] text-white py-12 px-6">
            <FadeIn className="max-w-6xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-serif mb-12">Confirm and pay</h1>

                <CheckoutPageClient booking={booking} />
            </FadeIn>
        </main>
    );
}
