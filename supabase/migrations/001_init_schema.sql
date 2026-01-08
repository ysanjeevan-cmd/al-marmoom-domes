-- 1. Create Enumerated Types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'superadmin', 'agent');

-- 2. Create Profiles Table (Public User Data)
-- Note: auth.users is managed by Supabase internal logic.
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Legacy Bubble ID for reference
    bubble_id text UNIQUE, 
    
    email text, -- Copied from auth.users for easier queries
    first_name text,
    last_name text,
    full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    
    role user_role DEFAULT 'customer',
    phone text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable Grid/RLS Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read basic profile info (if needed for reviews, etc)
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT 
    USING ( true );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE 
    USING ( auth.uid() = id );
