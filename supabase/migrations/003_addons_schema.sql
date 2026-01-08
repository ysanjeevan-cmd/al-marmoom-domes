-- Add-ons Table
CREATE TABLE IF NOT EXISTS public.addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bubble_id text UNIQUE,
    
    -- Basic Info
    name text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    
    -- Availability
    checkin timestamptz,
    checkout timestamptz,
    
    -- Relationships
    product_ids text[], -- Array of product bubble_ids this addon works with
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS for Add-ons
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view addons" ON addons FOR SELECT USING (true);
CREATE POLICY "Admins can manage addons" ON addons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

-- Index
CREATE INDEX idx_addons_product_ids ON addons USING GIN(product_ids);

-- Trigger for updated_at
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
