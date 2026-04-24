-- 1) transaction_pins: one PIN per user (hashed)
CREATE TABLE IF NOT EXISTS public.transaction_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pin"
  ON public.transaction_pins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pin"
  ON public.transaction_pins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pin"
  ON public.transaction_pins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_transaction_pins_updated_at
  BEFORE UPDATE ON public.transaction_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Add bank account snapshot fields to transactions for accurate receipts
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS payout_account_id UUID,
  ADD COLUMN IF NOT EXISTS bank_account_snapshot JSONB;

-- 3) Update handle_new_user() to NOT auto-assign Standard plan (vendor must choose)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, email, phone, business_email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  );

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);

  INSERT INTO public.personal_info (user_id, personal_phone)
  VALUES (NEW.id, NEW.phone);

  INSERT INTO public.pre_order_settings (user_id) VALUES (NEW.id);

  -- NOTE: No auto-assignment of Standard plan.
  -- Vendor must explicitly select a plan during setup step 4.

  RETURN NEW;
END;
$function$;