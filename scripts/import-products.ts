import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importProducts() {
    console.log('📦 Importing Products...\n');

    // 1. Create Venue
    const { data: venue, error: venueError } = await supabase
        .from('venues')
        .upsert({
            name: 'Al Marmoom Domes',
            slug: 'al-marmoom-domes'
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (venueError) {
        console.error('❌ Venue error:', venueError);
        return;
    }

    console.log('✅ Venue created:', venue.name);

    // 2. Import Products
    const products = [
        {
            bubble_id: '1736244444097x547594168357093400',
            name: '1 Night',
            sub_name: '1 Night Stay',
            slug: '1-night-at-al-marmoom-oasis',
            description_short: '1 Night Stay',
            details: '1 Night Stay',
            cover_image: '//7a743219444e82ce84c181d0034034c2.cdn.bubble.io/f1736756357109x994180371626288300/Header01.jpg',
            product_type: 'stay',
            pricing_type: 'per_product',
            venue_id: venue.id,
            max_guests: 3,
            min_stay_nights: 1,
            max_stay_nights: 1,
            duration_hours: 24,
            start_hour: 15,
            end_hour: 12,
            beds: 1,
            baths: 1,
            rank: 0,
            rating: 5.0,
            stats_guests: 18,
            stats_reviews: 0,
            stats_bookings: 7,
            stats_revenue: 33900,
            status: 'active',
            launch_from: '2025-01-01T00:00:00Z',
            launch_to: '2026-12-20T00:00:00Z'
        },
        {
            bubble_id: '1736756553189x377194975902826500',
            name: '2 Nights',
            sub_name: '2 Night',
            slug: '2-nights-at-al-marmoom-oasis',
            description_short: '2 Nights',
            details: '2 Night',
            cover_image: '//7a743219444e82ce84c181d0034034c2.cdn.bubble.io/f1736756571272x519468956599173060/Header01.jpg',
            product_type: 'stay',
            pricing_type: 'per_night',
            venue_id: venue.id,
            max_guests: 3,
            min_stay_nights: 2,
            max_stay_nights: 2,
            duration_hours: 24,
            start_hour: 15,
            end_hour: 12,
            beds: 1,
            baths: 1,
            rank: 0,
            rating: 5.0,
            stats_guests: 5,
            stats_reviews: 0,
            stats_bookings: 2,
            stats_revenue: 19200,
            status: 'active',
            launch_from: '2025-01-01T00:00:00Z',
            launch_to: '2026-11-20T00:00:00Z'
        },
        {
            bubble_id: '1736756746784x420350402028372000',
            name: '3 Nights',
            sub_name: '3 Nights',
            slug: '3-nights-at-al-marmoom-oasis',
            description_short: '3 Nights',
            details: '3 Nights',
            cover_image: '//7a743219444e82ce84c181d0034034c2.cdn.bubble.io/f1736756765384x479250164777004860/Header01.jpg',
            product_type: 'stay',
            pricing_type: 'per_night',
            venue_id: venue.id,
            max_guests: 4,
            min_stay_nights: 3,
            max_stay_nights: 3,
            duration_hours: 24,
            start_hour: 15,
            end_hour: 12,
            beds: 1,
            baths: 1,
            rank: 5,
            rating: 5.0,
            stats_guests: 0,
            stats_reviews: 0,
            stats_bookings: 0,
            stats_revenue: 0,
            status: 'active',
            launch_from: '2025-01-01T00:00:00Z',
            launch_to: '2025-12-20T00:00:00Z'
        }
    ];

    for (const product of products) {
        const { data, error } = await supabase
            .from('products')
            .upsert(product, { onConflict: 'bubble_id' })
            .select()
            .single();

        if (error) {
            console.error(`❌ ${product.name}:`, error.message);
        } else {
            console.log(`✅ ${product.name} imported`);
        }
    }

    console.log('\n🎉 Products imported successfully!');
}

importProducts().catch(console.error);
