-- Create Enums
CREATE TYPE product_type AS ENUM ('stay', 'experience');
CREATE TYPE pricing_type AS ENUM ('per_night', 'per_product');
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');

-- Venues Table
CREATE TABLE public.venues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Products Table
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bubble_id text UNIQUE,
    
    -- Basic Info
    name text NOT NULL,
    sub_name text,
    slug text UNIQUE NOT NULL,
    description_short text,
    details text,
    
    -- Media
    cover_image text,
    gallery text[], -- Array of image URLs
    
    -- Classification
    product_type product_type DEFAULT 'stay',
    pricing_type pricing_type DEFAULT 'per_night',
    venue_id uuid REFERENCES venues(id),
    
    -- Capacity & Duration
    max_guests int DEFAULT 4,
    min_stay_nights int DEFAULT 1,
    max_stay_nights int DEFAULT 3,
    duration_hours int DEFAULT 24,
    start_hour int DEFAULT 15, -- 3 PM check-in
    end_hour int DEFAULT 12, -- 12 PM checkout
    
    -- Amenities
    beds int DEFAULT 1,
    baths int DEFAULT 1,
    
    -- Display & Stats
    rank int DEFAULT 0,
    rating decimal(2,1) DEFAULT 5.0,
    stats_guests int DEFAULT 0,
    stats_reviews int DEFAULT 0,
    stats_bookings int DEFAULT 0,
    stats_revenue decimal(10,2) DEFAULT 0,
    
    -- Status & Launch
    status product_status DEFAULT 'draft',
    launch_from timestamptz,
    launch_to timestamptz,
    
    -- SEO
    seo_keywords text,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Pricing Rules Table
CREATE TABLE public.pricing_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    
    -- Date Range
    date_start date NOT NULL,
    date_end date NOT NULL,
    
    -- Prices by Guest Type
    price_adult decimal(10,2) NOT NULL,
    price_child decimal(10,2) DEFAULT 0,
    price_infant decimal(10,2) DEFAULT 0,
    
    -- Priority (higher = takes precedence)
    priority int DEFAULT 0,
    
    created_at timestamptz DEFAULT now()
);

-- Product Availability Table
CREATE TABLE public.product_availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    date date NOT NULL,
    
    -- Inventory Management
    total_inventory int DEFAULT 10, -- Total domes available
    booked_count int DEFAULT 0, -- Auto-incremented by bookings
    is_blocked boolean DEFAULT false, -- Manual block
    
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(product_id, date)
);

-- Blocked Dates Table (for maintenance, events, etc.)
CREATE TABLE public.blocked_dates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    date date NOT NULL,
    reason text,
    addon_id uuid, -- If blocking specific addon
    
    created_at timestamptz DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_venue ON products(venue_id);
CREATE INDEX idx_pricing_product_dates ON pricing_rules(product_id, date_start, date_end);
CREATE INDEX idx_availability_product_date ON product_availability(product_id, date);
CREATE INDEX idx_blocked_dates_product ON blocked_dates(product_id, date);

-- RLS Policies
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (status = 'active');

-- Admins can do everything
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Similar policies for other tables
CREATE POLICY "Public can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Admins can manage venues" ON venues FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Public can view pricing" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing" ON pricing_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Public can view availability" ON product_availability FOR SELECT USING (true);
CREATE POLICY "Admins can manage availability" ON product_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage blocked dates" ON blocked_dates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
