import { NextResponse } from 'next/server';
import { calculatePricing, checkInventory, getBlockedDates } from '@/lib/booking-logic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');
    const infants = parseInt(searchParams.get('infants') || '0');

    if (!productId || !checkIn || !checkOut) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // 1. Check blocked dates
        const blocked = await getBlockedDates(productId);
        if (blocked.includes(checkIn)) {
            return NextResponse.json({ available: false, reason: 'Date is blocked' });
        }

        // 2. Check inventory
        const isAvailable = await checkInventory(productId, checkIn, checkOut);
        if (!isAvailable) {
            return NextResponse.json({ available: false, reason: 'No inventory available' });
        }

        // 3. Calculate pricing
        const pricing = await calculatePricing(productId, checkIn, checkOut, {
            adult: adults,
            child: children,
            infant: infants
        });

        return NextResponse.json({
            available: true,
            pricing: {
                total: pricing.total,
                breakdown: pricing.breakdown
            }
        });
    } catch (error: any) {
        console.error('Availability API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
