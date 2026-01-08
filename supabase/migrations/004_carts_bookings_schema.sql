-- Cart & Bookings Schema

-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('cart', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');

-- Carts Table (Payment Transactions)
CREATE TABLE IF NOT EXISTS public.carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bubble_id text UNIQUE,
    
    -- Payment Info
    charge_id text UNIQUE, -- Stripe charge ID
    confirmation_code text UNIQUE,
    status payment_status DEFAULT 'unpaid',
    
    -- Customer
    customer_email text,
    customer_id uuid REFERENCES profiles(id),
    
    -- Metadata
    confirmation_sent boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Bookings Table (Order Details)
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bubble_id text UNIQUE,
    
    -- Cart Relationship
    cart_id uuid REFERENCES carts(id) ON DELETE SET NULL,
    
    -- Product & Dates
    product_id uuid REFERENCES products(id),
    check_in date NOT NULL,
    check_out date NOT NULL,
    nights int NOT NULL,
    
    -- Guests
    guests_adult int DEFAULT 2,
    guests_children int DEFAULT 0,
    guests_infants int DEFAULT 0,
    number_of_domes int DEFAULT 1,
    
    -- Pricing
    price_adult decimal(10,2),
    price_children decimal(10,2),
    price_infants decimal(10,2),
    price_addons_total decimal(10,2) DEFAULT 0,
    price_subtotal decimal(10,2),
    price_total decimal(10,2),
    price_vat_amount decimal(10,2),
    
    -- Status
    status booking_status DEFAULT 'cart',
    
    -- Customer Info
    customer_email text,
    customer_first_name text,
    customer_last_name text,
    customer_phone text,
    
    -- Instructions
    instructions_by_guest text,
    instructions_by_team text,
    
    -- Metadata
    venue_id uuid REFERENCES venues(id),
    rank int DEFAULT 0,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Booking Add-ons Junction Table
CREATE TABLE IF NOT EXISTS public.booking_addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id uuid REFERENCES addons(id) ON DELETE CASCADE,
    quantity int DEFAULT 1,
    price_at_booking decimal(10,2),
    
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(booking_id, addon_id)
);

-- Indexes
CREATE INDEX idx_carts_charge_id ON carts(charge_id);
CREATE INDEX idx_carts_confirmation_code ON carts(confirmation_code);
CREATE INDEX idx_carts_customer ON carts(customer_email);
CREATE INDEX idx_bookings_cart ON bookings(cart_id);
CREATE INDEX idx_bookings_product ON bookings(product_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_customer ON bookings(customer_email);
CREATE INDEX idx_booking_addons_booking ON booking_addons(booking_id);

-- RLS Policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
CREATE POLICY "Admins can manage carts" ON carts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage booking_addons" ON booking_addons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
    customer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Triggers
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
