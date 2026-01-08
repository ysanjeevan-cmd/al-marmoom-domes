import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import csvParser from 'csv-parser';


dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

interface BubbleUser {
    email: string;
    firstName: string;
    lastName: string;
    type: string;
    typePermission: string;
    'unique id': string;
    phone?: string;
}

async function importAllUsers() {
    console.log('📥 Importing all users from CSV...\n');

    const users: BubbleUser[] = [];

    // Read CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream('/tmp/users.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                if (row.email && row.email.trim()) {
                    users.push(row);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${users.length} users in CSV\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of users) {
        const role = user.typePermission?.toLowerCase() === 'admin' ? 'admin'
            : user.typePermission?.toLowerCase() === 'agent' ? 'agent'
                : user.typePermission?.toLowerCase() === 'superadmin' ? 'superadmin'
                    : 'customer';

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: {
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                role: role
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                skipCount++;
                // Try to update profile for existing user
                const { data: existingUsers } = await supabase.auth.admin.listUsers();
                const existingUser = existingUsers?.users.find(u => u.email === user.email);

                if (existingUser) {
                    await supabase.from('profiles').upsert({
                        id: existingUser.id,
                        email: user.email,
                        first_name: user.firstName || '',
                        last_name: user.lastName || '',
                        role: role,
                        bubble_id: user['unique id'],
                        phone: user.phone || null
                    }, { onConflict: 'id' });
                }
                continue;
            }
            console.error(`❌ ${user.email}: ${authError.message}`);
            errorCount++;
            continue;
        }

        const userId = authData?.user?.id;
        if (!userId) {
            errorCount++;
            continue;
        }

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            email: user.email,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            role: role,
            bubble_id: user['unique id'],
            phone: user.phone || null
        });

        if (profileError) {
            console.error(`❌ Profile error for ${user.email}: ${profileError.message}`);
            errorCount++;
        } else {
            successCount++;
            if (successCount % 10 === 0) {
                console.log(`✅ Imported ${successCount} users...`);
            }
        }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully created: ${successCount}`);
    console.log(`⚠️  Already existed: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${users.length}`);
}

importAllUsers().catch(console.error);
