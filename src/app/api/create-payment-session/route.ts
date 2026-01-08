import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getBooking } from "@/lib/booking-logic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        // 1. Verify Booking details from Supabase (Security)
        const booking = await getBooking(bookingId);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            customer_email: body.email,
            line_items: [
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: booking.product?.name || "Dome Stay",
                            description: `${booking.nights} Night(s) for ${booking.guests_adult + booking.guests_children + booking.guests_infants} Guest(s)`,
                        },
                        unit_amount: Math.round(Number(booking.price_total) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${request.headers.get("origin")}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get("origin")}/checkout?bookingId=${bookingId}`,
            metadata: {
                bookingId: bookingId,
                cartId: booking.cart_id
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Session Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
