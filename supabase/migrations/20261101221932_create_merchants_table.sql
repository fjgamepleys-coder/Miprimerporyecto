/*
# Create merchants table for business authentication

1. New Tables
- `merchants`
  - `id` (uuid, primary key)
  - `phone` (text, unique, not null) - phone number in format +57XXXXXXXXXX
  - `pin` (text, not null) - 10-digit security PIN
  - `name` (text, not null) - business name
  - `active` (boolean, default true) - whether the merchant is enabled
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `merchants`.
- The table itself is NOT directly readable by anon/authenticated (no SELECT grants to anon).
- A SECURITY DEFINER function `check_merchant_credentials` validates phone+pin and returns the merchant record if valid, so PINs are never exposed to the client.

3. Functions
- `check_merchant_credentials(p_phone text, p_pin text)` - SECURITY DEFINER function that looks up a merchant by phone+pin and returns the record if found and active. Returns NULL if no match.
*/

CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  pin text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- No direct grants to anon or authenticated: all access goes through the SECURITY DEFINER function.
GRANT SELECT, INSERT, UPDATE ON merchants TO service_role;

-- SECURITY DEFINER function: allows the anon-key client to validate merchant credentials
-- without exposing the table or other merchants' PINs.
CREATE OR REPLACE FUNCTION check_merchant_credentials(p_phone text, p_pin text)
RETURNS TABLE (
  id uuid,
  phone text,
  name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.phone, m.name
  FROM merchants m
  WHERE m.phone = p_phone
    AND m.pin = p_pin
    AND m.active = true
  LIMIT 1;
END;
$$;

-- Grant execute to anon so the frontend (anon key) can call it
REVOKE EXECUTE ON FUNCTION check_merchant_credentials(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_merchant_credentials(text, text) TO anon, authenticated;

-- Insert a demo merchant for testing
INSERT INTO merchants (phone, pin, name)
VALUES ('+573001234567', '9876543210', 'Asadero El Valle')
ON CONFLICT (phone) DO NOTHING;
