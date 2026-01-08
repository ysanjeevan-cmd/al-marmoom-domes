import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function syncProfiles() {
    console.log('🔄 Syncing profiles for existing users...\n');

    const userMap = [
        { email: 'salama@i2b.co', first_name: 'Salama', last_name: '', role: 'admin', bubble_id: '1663912686849x268900335937790180' },
        { email: 'liv@oceanairtravels.com', first_name: 'Liv', last_name: '', role: 'admin', bubble_id: '1667405219549x157175692669109300' },
        { email: 'pamela@oceanairtravels.com', first_name: 'Pamela', last_name: '', role: 'admin', bubble_id: '1667411558693x532102511998958660' },
        { email: 'support@oceanairtravels.com', first_name: 'support', last_name: '', role: 'agent', bubble_id: '1669200722380x268892924519843940' },
    ];

    // Get all auth users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError);
        return;
    }

    console.log(`Found ${users.length} auth users\n`);

    for (const authUser of users) {
        const userData = userMap.find(u => u.email === authUser.email);
        if (!userData) continue;

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: authUser.id,
                email: authUser.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role,
                bubble_id: userData.bubble_id,
            }, { onConflict: 'id' });

        if (error) {
            console.error(`❌ ${authUser.email}:`, error.message);
        } else {
            console.log(`✅ ${authUser.email} (${userData.role})`);
        }
    }

    // Verify
    const { data: profiles, error: queryError } = await supabase
        .from('profiles')
        .select('email, role, first_name');

    if (queryError) {
        console.error('\n❌ Error querying profiles:', queryError);
    } else {
        console.log('\n📊 Current profiles in database:');
        console.table(profiles);
    }
}

syncProfiles().catch(console.error);
