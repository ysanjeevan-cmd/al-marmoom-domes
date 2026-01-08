-- Activate products
UPDATE products SET status = 'active' WHERE status = 'draft';

-- Enable public read for blocked_dates so the booking engine can show them
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blocked dates" ON blocked_dates
    FOR SELECT USING (true);

-- Ensure public can view availability
CREATE POLICY "Public can view product availability" ON product_availability
    FOR SELECT USING (true);
