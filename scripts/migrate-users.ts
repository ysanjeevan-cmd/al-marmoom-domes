import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Starting User DB Migration...\n');

    // Read and execute the SQL migration
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/001_init_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executing SQL Schema...');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error && !error.message.includes('already exists')) {
            console.error('❌ SQL Error:', error);
        }
    }

    console.log('✅ Schema created!\n');

    // Now import user data
    console.log('📥 Importing user data from CSV...');

    const users = [
        { email: 'salama@i2b.co', first_name: 'Salama', last_name: '', role: 'admin', bubble_id: '1663912686849x268900335937790180' },
        { email: 'liv@oceanairtravels.com', first_name: 'Liv', last_name: '', role: 'admin', bubble_id: '1667405219549x157175692669109300' },
        { email: 'pamela@oceanairtravels.com', first_name: 'Pamela', last_name: '', role: 'admin', bubble_id: '1667411558693x532102511998958660' },
        { email: 'support@oceanairtravels.com', first_name: 'support', last_name: '', role: 'agent', bubble_id: '1669200722380x268892924519843940' },
    ];

    for (const user of users) {
        // Create auth user first
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
        });

        if (authError && !authError.message.includes('already registered')) {
            console.error(`❌ Error creating auth for ${user.email}:`, authError.message);
            continue;
        }

        const userId = authData?.user?.id;
        if (!userId) continue;

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                bubble_id: user.bubble_id,
            });

        if (profileError) {
            console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
        } else {
            console.log(`✅ Created: ${user.email} (${user.role})`);
        }
    }

    console.log('\n🎉 Migration Complete!');
}

runMigration().catch(console.error);
