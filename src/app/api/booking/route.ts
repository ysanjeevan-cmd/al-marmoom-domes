import { NextResponse } from "next/server";
import { createBooking, createCart, updateCart } from "@/lib/bubble";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Create Cart
        // Note: User must ensure 'cart' permissions allow Create via API
        const cartId = await createCart();

        if (!cartId) {
            throw new Error("Failed to create Cart. Please check 'cart' permissions in Bubble.");
        }

        // 2. Create Booking with Cart Link
        const bookingPayload = {
            ...body,
            cart: cartId // Link Booking -> Cart
        };

        const bookingId = await createBooking(bookingPayload);

        if (!bookingId) {
            throw new Error("Failed to create Booking");
        }

        // 3. Update Cart with Booking Link (List)
        // Bubble List fields: provide array of IDs
        try {
            await updateCart(cartId, {
                bookings: [bookingId], // Link Cart -> Booking (List) - Trying PLURAL 'bookings'
            });
        } catch (cartError) {
            console.error("Warning: Failed to link Booking to Cart:", cartError);
            // Proceed anyway, as we have the bookingId
        }

        return NextResponse.json({ id: bookingId, cartId: cartId });
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
