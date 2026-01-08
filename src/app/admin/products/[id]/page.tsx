import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ProductEditorTabs } from './ProductEditorTabs';
import { ArrowLeft, Save, Globe, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function ProductEditorPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    if (!id) notFound();

    // Fetch product, pricing, blocked dates, and addons
    const [
        { data: product },
        { data: pricingRules },
        { data: blockedDates },
        { data: addons }
    ] = await Promise.all([
        supabaseAdmin!.from('products').select('*, venue:venues(*)').eq('id', id).single(),
        supabaseAdmin!.from('pricing_rules').select('*').eq('product_id', id).order('priority', { ascending: false }),
        supabaseAdmin!.from('blocked_dates').select('*').eq('product_id', id),
        supabaseAdmin!.from('addons').select('*').contains('product_ids', [id])
    ]);

    if (!product) notFound();

    return (
        <div className="bg-gray-50 min-h-screen">
            <ProductEditorTabs
                product={product}
                pricingRules={pricingRules || []}
                blockedDates={blockedDates || []}
                addons={addons || []}
            />
        </div>
    );
}
