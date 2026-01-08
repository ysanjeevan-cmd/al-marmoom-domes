import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function runMigration() {
    console.log('🚀 Activating Products & RLS Policies...\n');

    const sqlPath = path.join(process.cwd(), 'supabase/migrations/005_activate_products_rls.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

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

    console.log('✅ Migration executed successfully!');
}

runMigration().catch(console.error);
