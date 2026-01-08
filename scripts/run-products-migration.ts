import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Running Products Schema Migration...\n');

    const sqlPath = path.join(process.cwd(), 'supabase/migrations/002_products_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute via Supabase Management API
    const response = await fetch(`https://api.supabase.com/v1/projects/tdwlhovmemiqbhfecahd/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sbp_383f7bcc98d9f89544fe7b5597af4cc84c972389`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('❌ Migration failed:', result);
        throw new Error(result.message || 'Migration failed');
    }

    console.log('✅ Schema created successfully!\n');

    // Verify tables were created
    const { data: tables, error } = await supabase
        .from('products')
        .select('count');

    if (error && !error.message.includes('0 rows')) {
        console.log('⚠️  Products table verification:', error.message);
    } else {
        console.log('✅ Products table verified');
    }

    console.log('\n🎉 Migration Complete!');
}

runMigration().catch(console.error);
