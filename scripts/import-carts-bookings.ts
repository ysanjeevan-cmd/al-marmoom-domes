import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CartRow {
    'unique id': string;
    chargeId: string;
    confirmationCode: string;
    status: string;
    customer: string;
}

interface BookingRow {
    'unique id': string;
    cart: string;
    product: string;
    checkIn: string;
    checkOut: string;
    nights: string;
    guestsAdult: string;
    guestsChildren: string;
    guestsInfants: string;
    numberOfDomes: string;
    priceAdult: string;
    priceChildren: string;
    priceInfants: string;
    priceAddonsTotal: string;
    priceSubTotal: string;
    priceTotal: string;
    priceVATamount: string;
    status: string;
    customer_email: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_phone_no: string;
    instructionsByGuest: string;
    instructionsByTeam: string;
}

async function importCartsAndBookings() {
    console.log('🚀 Importing Carts & Bookings...\n');

    // 1. Create Tables
    console.log('📝 Creating tables...');
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/004_carts_bookings_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const response = await fetch(`https://api.supabase.com/v1/projects/tdwlhovmemiqbhfecahd/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sbp_383f7bcc98d9f89544fe7b5597af4cc84c972389`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('❌ Table creation failed:', error);
    } else {
        console.log('✅ Tables created\n');
    }

    // 2. Get product IDs
    const { data: products } = await supabase.from('products').select('id, name');
    const productMap = new Map(products?.map(p => [p.name, p.id]) || []);

    // 3. Read Carts CSV (only Paid status)
    console.log('💳 Importing paid carts...');
    const carts: CartRow[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream('/tmp/carts.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                if (row.status === 'Paid' && row.chargeId) {
                    carts.push(row);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${carts.length} paid carts\n`);

    const cartIdMap = new Map(); // Map bubble cart ID to Supabase UUID

    let cartCount = 0;
    for (const cart of carts) {
        const { data, error } = await supabase
            .from('carts')
            .upsert({
                bubble_id: cart['unique id'],
                charge_id: cart.chargeId,
                confirmation_code: cart.confirmationCode,
                status: 'paid',
                customer_email: cart.customer,
                confirmation_sent: true
            }, { onConflict: 'bubble_id' })
            .select()
            .single();

        if (error) {
            console.error(`❌ Cart ${cart.confirmationCode}:`, error.message);
        } else {
            cartIdMap.set(cart['unique id'], data.id);
            cartCount++;
            if (cartCount % 5 === 0) {
                console.log(`✅ Imported ${cartCount} carts...`);
            }
        }
    }
    console.log(`✅ Total carts imported: ${cartCount}\n`);

    // 4. Read Bookings CSV
    console.log('📦 Importing bookings...');
    const bookings: BookingRow[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream('/tmp/bookings.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                // Only import bookings that have a cart reference
                if (row.cart && row.product) {
                    bookings.push(row);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${bookings.length} bookings with cart references\n`);

    let bookingCount = 0;
    let skippedCount = 0;

    // Helper function to parse dates like "Nov 11, 2022 12:00 AM"
    function parseBookingDate(dateStr: string): string | null {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
        } catch {
            return null;
        }
    }

    for (const booking of bookings) {
        const cartId = cartIdMap.get(booking.cart);
        const productId = productMap.get(booking.product);

        // Only import if we have a valid paid cart
        if (!cartId) {
            skippedCount++;
            continue;
        }

        if (!productId) {
            console.error(`❌ Product not found: ${booking.product}`);
            skippedCount++;
            continue;
        }

        const { error } = await supabase
            .from('bookings')
            .upsert({
                bubble_id: booking['unique id'],
                cart_id: cartId,
                product_id: productId,
                check_in: parseBookingDate(booking.checkIn),
                check_out: parseBookingDate(booking.checkOut),
                nights: parseInt(booking.nights) || 1,
                guests_adult: parseInt(booking.guestsAdult) || 2,
                guests_children: parseInt(booking.guestsChildren) || 0,
                guests_infants: parseInt(booking.guestsInfants) || 0,
                number_of_domes: parseInt(booking.numberOfDomes) || 1,
                price_adult: parseFloat(booking.priceAdult) || 0,
                price_children: parseFloat(booking.priceChildren) || 0,
                price_infants: parseFloat(booking.priceInfants) || 0,
                price_addons_total: parseFloat(booking.priceAddonsTotal) || 0,
                price_subtotal: parseFloat(booking.priceSubTotal) || 0,
                price_total: parseFloat(booking.priceTotal) || 0,
                price_vat_amount: parseFloat(booking.priceVATamount) || 0,
                status: 'confirmed',
                customer_email: booking.customer_email,
                customer_first_name: booking.customer_first_name,
                customer_last_name: booking.customer_last_name,
                customer_phone: booking.customer_phone_no,
                instructions_by_guest: booking.instructionsByGuest,
                instructions_by_team: booking.instructionsByTeam
            }, { onConflict: 'bubble_id' });

        if (error) {
            console.error(`❌ Booking error:`, error.message);
            skippedCount++;
        } else {
            bookingCount++;
            if (bookingCount % 10 === 0) {
                console.log(`✅ Imported ${bookingCount} bookings...`);
            }
        }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`✅ Carts imported: ${cartCount}`);
    console.log(`✅ Bookings imported: ${bookingCount}`);
    console.log(`⚠️  Skipped (no paid cart): ${skippedCount}`);
    console.log(`\n🎉 Import complete!`);
}

importCartsAndBookings().catch(console.error);
