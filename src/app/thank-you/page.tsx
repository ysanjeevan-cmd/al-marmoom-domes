import { redirect } from "next/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { CheckCircle, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button"; // Or raw button
import Stripe from "stripe";
import { updateCart } from "@/lib/bubble";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

export default async function ThankYouPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const { session_id } = await searchParams;

    if (!session_id) {
        redirect("/");
    }

    let confirmationCode = "";
    let status = "processing";

    try {
        // 1. Retrieve Session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            // 2. Generate Confirmation Code
            // Format: AMD + 4 random digits
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            confirmationCode = `AMD${randomCode}`;

            // 3. Update Cart in Bubble
            const cartId = session.metadata?.cart;
            const chargeId = session.payment_intent as string; // Charge ID (PI)

            if (cartId) {
                // Update Cart
                await updateCart(cartId, {
                    status: "Paid",
                    chargeId: chargeId, // Corrected to match Bubble screenshot (chargeId)
                    confirmationCode: confirmationCode
                });
                status = "success";
            } else {
                console.error("No Cart ID found in Stripe Metadata");
                // Still show success to user, but log error
                status = "success_no_cart";
            }
        } else {
            status = "unpaid";
        }
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        status = "error";
        confirmationCode = error.message; // Hack to pass error message to UI
    }

    if (status === "error" || status === "unpaid") {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Issue</h1>
                    <p className="text-muted mb-6">We verify your payment right now. Please check your bank or try again.</p>

                    {/* Debug Error Message */}
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-left text-sm font-mono max-w-lg mx-auto overflow-auto">
                        <p className="font-bold">Debug Info:</p>
                        <p>Status: {status}</p>
                        <p>Message: {confirmationCode || "Unknown Error"}</p>
                        <p>Session: {session_id}</p>
                    </div>

                    <Link href="/">
                        <button className="px-6 py-3 bg-primary text-white rounded-xl">Return Home</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#394231] text-white py-12 px-6 flex items-center justify-center">
            <FadeIn className="max-w-xl w-full bg-white text-foreground rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted mb-8">Thank you for successful payment. Your dome is reserved.</p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-muted font-bold mb-1">Confirmation Code</p>
                    <p className="text-4xl font-mono font-bold text-primary tracking-widest">{confirmationCode}</p>
                </div>

                <Link href="/">
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#394231] text-white rounded-xl hover:bg-[#2a3024] transition-colors font-semibold">
                        <Home className="w-5 h-5" /> Return to Home
                    </button>
                </Link>
            </FadeIn>
        </main>
    );
}
