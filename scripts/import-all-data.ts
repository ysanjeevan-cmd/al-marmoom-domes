import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importAllData() {
    console.log('🚀 Importing Pricing, Blocked Dates & Add-ons...\n');

    // 1. Create Add-ons Table
    console.log('📝 Creating add-ons table...');
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/003_addons_schema.sql');
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
        console.error('❌ Add-ons table creation failed:', error);
    } else {
        console.log('✅ Add-ons table created\n');
    }

    // 2. Get product IDs for mapping
    const { data: products } = await supabase
        .from('products')
        .select('id, bubble_id, name');

    const productMap = new Map(products?.map(p => [p.name, p.id]) || []);
    const bubbleToUuidMap = new Map(products?.map(p => [p.bubble_id, p.id]) || []);

    // 3. Import Pricing Rules
    console.log('💰 Importing pricing rules...');
    const pricingRules = [
        { product: '1 Night', dateStart: '2026-01-03', dateEnd: '2026-01-03', priceAdult: 4350, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '1 Night', dateStart: '2026-01-01', dateEnd: '2026-01-02', priceAdult: 5250, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '1 Night', dateStart: '2026-01-04', dateEnd: '2026-01-08', priceAdult: 4350, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '1 Night', dateStart: '2026-01-09', dateEnd: '2026-01-11', priceAdult: 3850, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '1 Night', dateStart: '2026-01-12', dateEnd: '2026-01-12', priceAdult: 4350, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '1 Night', dateStart: '2026-01-13', dateEnd: '2026-12-24', priceAdult: 3850, priceChild: 0, priceInfant: 0, priority: 0 },
        { product: '1 Night', dateStart: '2026-12-25', dateEnd: '2027-01-05', priceAdult: 4900, priceChild: 0, priceInfant: 0, priority: 2 },
        { product: '2 Nights', dateStart: '2026-01-09', dateEnd: '2026-12-24', priceAdult: 3850, priceChild: 0, priceInfant: 0, priority: 0 },
        { product: '2 Nights', dateStart: '2026-12-25', dateEnd: '2027-01-05', priceAdult: 4900, priceChild: 0, priceInfant: 0, priority: 1 },
        { product: '3 Nights', dateStart: '2026-01-05', dateEnd: '2026-12-24', priceAdult: 3850, priceChild: 0, priceInfant: 0, priority: 0 },
        { product: '3 Nights', dateStart: '2026-12-25', dateEnd: '2027-01-05', priceAdult: 4900, priceChild: 0, priceInfant: 0, priority: 1 },
    ];

    let pricingCount = 0;
    for (const rule of pricingRules) {
        const productId = productMap.get(rule.product);
        if (!productId) continue;

        const { error } = await supabase
            .from('pricing_rules')
            .insert({
                product_id: productId,
                date_start: rule.dateStart,
                date_end: rule.dateEnd,
                price_adult: rule.priceAdult,
                price_child: rule.priceChild,
                price_infant: rule.priceInfant,
                priority: rule.priority
            });

        if (error && !error.message.includes('duplicate')) {
            console.error(`❌ ${rule.product}:`, error.message);
        } else {
            pricingCount++;
        }
    }
    console.log(`✅ ${pricingCount} pricing rules imported\n`);

    // 4. Import Add-ons
    console.log('🎁 Importing add-ons...');
    const addonsData = [
        { bubble_id: '1760960850136x582918574179876900', name: 'Breakfast', price: 0, product: '1 Night', checkin: '2026-01-01', checkout: '2027-01-06' },
        { bubble_id: '1760960861846x182522913761787900', name: 'Halfboard', price: 950, product: '1 Night', checkin: '2026-01-01', checkout: '2026-12-25' },
        { bubble_id: '1760961172065x339180467144359940', name: 'Full board with experiences', price: 1950, product: '1 Night', checkin: '2026-01-01', checkout: '2026-12-25' },
        { bubble_id: '1760961190830x258980041110061060', name: 'All-Inclusive with Occasional Private Setup', price: 2950, product: '1 Night', checkin: '2026-01-01', checkout: '2026-12-25' },
        { bubble_id: '1760961384562x467872332856688600', name: 'Breakfast', price: 0, product: '2 Nights', checkin: '2026-01-01', checkout: '2027-01-06' },
        { bubble_id: '1760961465748x926576082028068900', name: 'Half board', price: 2200, product: '2 Nights', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1760961503988x389387557830918140', name: 'Full board with experiences', price: 5800, product: '2 Nights', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1760961523673x823809623923621900', name: 'All-Inclusive with Occasional Private Setup', price: 7800, product: '2 Nights', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1760961838484x568194203468693500', name: 'Breakfast', price: 0, product: '3 Nights', checkin: '2026-01-05', checkout: '2027-01-05' },
        { bubble_id: '1760961943695x711796508560719900', name: 'Full board with experiences', price: 8700, product: '3 Nights', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1760961967462x831178279025639400', name: 'All-Inclusive with Occasional Private Setup', price: 11700, product: '3 Nights', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1761307964565x360241126385909760', name: 'Pick-up', price: 250, product: '1 Night', checkin: '2026-01-01', checkout: '2027-01-06', description: 'Private Car Pick-up' },
        { bubble_id: '1767599121032x175879524259987460', name: 'Halfboard', price: 1100, product: '1 Night', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1767599545332x861710714240761900', name: 'Full board with experiences', price: 2900, product: '1 Night', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1767599574111x556254424701337600', name: 'All-Inclusive with Occasional Private Setup', price: 3900, product: '1 Night', checkin: '2026-12-25', checkout: '2027-01-06' },
        { bubble_id: '1767613291239x214589901238435840', name: 'Half Board', price: 1900, product: '2 Nights', checkin: '2026-01-05', checkout: '2026-12-25' },
        { bubble_id: '1767613573769x994432249315721200', name: 'Full board with experiences', price: 3900, product: '2 Nights', checkin: '2026-01-05', checkout: '2026-12-25' },
    ];

    let addonsCount = 0;
    for (const addon of addonsData) {
        const productId = productMap.get(addon.product);

        const { error } = await supabase
            .from('addons')
            .upsert({
                bubble_id: addon.bubble_id,
                name: addon.name,
                description: addon.description || null,
                price: addon.price,
                checkin: addon.checkin ? `${addon.checkin}T00:00:00Z` : null,
                checkout: addon.checkout ? `${addon.checkout}T00:00:00Z` : null,
                product_ids: productId ? [productId] : []
            }, { onConflict: 'bubble_id' });

        if (error) {
            console.error(`❌ ${addon.name}:`, error.message);
        } else {
            addonsCount++;
        }
    }
    console.log(`✅ ${addonsCount} add-ons imported\n`);

    // 5. Import Blocked Dates
    console.log('🚫 Importing blocked dates...');
    const blockedDatesData = [
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-12' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-12' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-12' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-04' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-05' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-04' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-05' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-04' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-05' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-03' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-03' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-03' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-06' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-06' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-06' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-07' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-07' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-07' },
        { product: '3 Nights', addon: '1760961838484x568194203468693500', date: '2026-01-08' },
        { product: '1 Night', addon: '1760960850136x582918574179876900', date: '2026-01-08' },
        { product: '2 Nights', addon: '1760961384562x467872332856688600', date: '2026-01-08' },
    ];

    // Get addon IDs
    const { data: addons } = await supabase
        .from('addons')
        .select('id, bubble_id');
    const addonMap = new Map(addons?.map(a => [a.bubble_id, a.id]) || []);

    let blockedCount = 0;
    for (const blocked of blockedDatesData) {
        const productId = productMap.get(blocked.product);
        const addonId = addonMap.get(blocked.addon);

        const { error } = await supabase
            .from('blocked_dates')
            .insert({
                product_id: productId,
                addon_id: addonId,
                date: blocked.date,
                reason: 'Addon not available'
            });

        if (error && !error.message.includes('duplicate')) {
            console.error(`❌ Blocked date:`, error.message);
        } else {
            blockedCount++;
        }
    }
    console.log(`✅ ${blockedCount} blocked dates imported\n`);

    console.log('🎉 All data imported successfully!');
}

importAllData().catch(console.error);
