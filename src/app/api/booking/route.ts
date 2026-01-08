import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            productId,
            checkIn,
            checkOut,
            nights,
            adults,
            children,
            infants,
            customer,
            pricing,
            status = 'confirmed'
        } = body;

        // 1. Create a Cart record (Transaction record)
        // Note: For real bookings, this usually happens *after* Stripe payment success,
        // but for the initial flow migration, we create the record in 'paid' or 'unpaid' status.
        const { data: cart, error: cartError } = await supabaseAdmin!
            .from('carts')
            .insert({
                status: 'unpaid',
                customer_email: customer.email,
                confirmation_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                confirmation_sent: false
            })
            .select()
            .single();

        if (cartError) throw new Error(`Cart error: ${cartError.message}`);

        // 2. Create the Booking linked to the Cart
        const { data: booking, error: bookingError } = await supabaseAdmin!
            .from('bookings')
            .insert({
                cart_id: cart.id,
                product_id: productId,
                check_in: checkIn,
                check_out: checkOut,
                nights: nights,
                guests_adult: adults,
                guests_children: children,
                guests_infants: infants,
                number_of_domes: body.numberOfDomes || 1,
                customer_email: customer.email,
                customer_first_name: customer.firstName,
                customer_last_name: customer.lastName,
                customer_phone: customer.phone,
                price_subtotal: pricing.subtotal,
                price_total: pricing.total,
                price_vat_amount: pricing.vat,
                status: 'cart'
            })
            .select()
            .single();

        if (bookingError) throw new Error(`Booking error: ${bookingError.message}`);

        // 3. Update Product Availability (booked_count)
        // In a high-traffic app, we would use a more robust locking mechanism,
        // but for now, we upsert/increment.
        const { data: existingAvailability } = await supabaseAdmin!
            .from('product_availability')
            .select('*')
            .eq('product_id', productId)
            .eq('date', checkIn)
            .single();

        if (existingAvailability) {
            await supabaseAdmin!
                .from('product_availability')
                .update({ booked_count: existingAvailability.booked_count + 1 })
                .eq('id', existingAvailability.id);
        } else {
            // If no record exists, create one (default inventory to 2 for now, or fetch from product)
            await supabaseAdmin!
                .from('product_availability')
                .insert({
                    product_id: productId,
                    date: checkIn,
                    booked_count: 1,
                    total_inventory: 2 // Assuming 2 domes per product for now
                });
        }

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            confirmationCode: cart.confirmation_code
        });
    } catch (error: any) {
        console.error("Booking Creation API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
