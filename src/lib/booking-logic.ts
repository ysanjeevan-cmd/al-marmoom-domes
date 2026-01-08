import { startOfDay, addDays, isSameDay, parseISO, format } from "date-fns";
import { supabaseAdmin } from "./supabase";

/**
 * Checks if a specific date is blocked for a product or its add-ons.
 */
export async function getBlockedDates(productId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin!
        .from('blocked_dates')
        .select('date')
        .eq('product_id', productId);

    if (error) return [];
    return data.map(d => d.date);
}

/**
 * Checks inventory availability for a product over a date range.
 */
export async function checkInventory(productId: string, startDate: string, endDate: string): Promise<boolean> {
    const { data: availability, error } = await supabaseAdmin!
        .from('product_availability')
        .select('*')
        .eq('product_id', productId)
        .gte('date', startDate)
        .lt('date', endDate);

    if (error) return false;

    // If any date in range is blocked or fully booked, return false
    const isUnavailable = availability.some(day => day.is_blocked || (day.booked_count >= day.total_inventory));

    return !isUnavailable;
}

/**
 * Calculates total price for a stay based on Supabase pricing rules.
 */
export async function calculatePricing(
    productId: string,
    checkIn: string, // YYYY-MM-DD
    checkOut: string, // YYYY-MM-DD
    guests: { adult: number, child: number, infant: number }
) {
    // Fetch all pricing rules for this product
    const { data: rules, error } = await supabaseAdmin!
        .from('pricing_rules')
        .select('*')
        .eq('product_id', productId)
        .order('priority', { ascending: false });

    if (error || !rules) return { total: 0, breakdown: [] };

    let total = 0;
    const breakdown = [];
    let currentDate = parseISO(checkIn);
    const endDate = parseISO(checkOut);

    // Loop through each day of the stay
    while (currentDate < endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");

        // Find the matching rule for this specific day
        const activeRule = rules.find(rule => {
            return dateStr >= rule.date_start && dateStr <= rule.date_end;
        });

        if (activeRule) {
            // Note: Currently treating prices as Per Unit/Dome. 
            // If you later need per-person pricing, check product.pricing_type here.
            const dayPrice =
                (Number(activeRule.price_adult) || 0) +
                (guests.child * (Number(activeRule.price_child) || 0)) +
                (guests.infant * (Number(activeRule.price_infant) || 0));

            total += dayPrice;
            breakdown.push({
                date: dateStr,
                price: dayPrice,
                rule: activeRule.id
            });
        } else {
            console.warn(`No price rule for ${dateStr} on product ${productId}`);
        }

        currentDate = addDays(currentDate, 1);
    }

    return { total, breakdown };
}

/**
 * Fetches available add-ons for a product.
 */
export async function getAvailableAddons(productId: string) {
    const { data: addons, error } = await supabaseAdmin!
        .from('addons')
        .select('*')
        .contains('product_ids', [productId]);

    if (error) return [];
    return addons;
}

/**
 * Fetches a single booking by ID with related cart and product info.
 */
export async function getBooking(bookingId: string) {
    const { data: booking, error } = await supabaseAdmin!
        .from('bookings')
        .select(`
            *,
            product:products(*),
            cart:carts(*)
        `)
        .eq('id', bookingId)
        .single();

    if (error) {
        console.error('Error fetching booking:', error);
        return null;
    }
    return booking;
}
