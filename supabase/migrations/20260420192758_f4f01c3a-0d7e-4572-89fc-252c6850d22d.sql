-- =========================================================
-- 1. Shared timestamp trigger function
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 2. PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 3. WALLETS
-- =========================================================
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  lifetime_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. NOTIFICATIONS
-- =========================================================
CREATE TYPE public.notification_type AS ENUM ('order', 'payment', 'profile', 'system');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================================
-- 5. TRANSACTIONS
-- =========================================================
CREATE TYPE public.transaction_type AS ENUM ('sale', 'payout', 'refund', 'adjustment');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE DEFAULT ('VDR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  sender TEXT,
  receiver TEXT,
  order_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_created
  ON public.transactions(user_id, created_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 6. RIDERS (shared pool, read-only to vendors)
-- =========================================================
CREATE TABLE public.riders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  distance_km NUMERIC(4,1) NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view riders"
  ON public.riders FOR SELECT
  TO authenticated
  USING (true);

-- =========================================================
-- 7. ORDER_RIDERS (vendor's rider assignments)
-- =========================================================
CREATE TYPE public.assignment_status AS ENUM ('requested', 'accepted', 'rejected', 'completed', 'cancelled');

CREATE TABLE public.order_riders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  rider_id UUID NOT NULL REFERENCES public.riders(id),
  status public.assignment_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_riders_user_order
  ON public.order_riders(user_id, order_id);

ALTER TABLE public.order_riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments"
  ON public.order_riders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assignments"
  ON public.order_riders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON public.order_riders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_order_riders_updated_at
  BEFORE UPDATE ON public.order_riders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 8. PUBLIC TRANSACTION VERIFICATION (read-only by reference)
-- =========================================================
-- Security definer function so QR scanners (anonymous) can verify a transaction
-- by reference without exposing the full table.
CREATE OR REPLACE FUNCTION public.verify_transaction(_reference TEXT)
RETURNS TABLE (
  reference TEXT,
  type public.transaction_type,
  status public.transaction_status,
  net_amount NUMERIC,
  created_at TIMESTAMPTZ,
  business_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.reference,
    t.type,
    t.status,
    t.net_amount,
    t.created_at,
    p.business_name
  FROM public.transactions t
  LEFT JOIN public.profiles p ON p.user_id = t.user_id
  WHERE t.reference = _reference
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_transaction(TEXT) TO anon, authenticated;

-- =========================================================
-- 9. SIGNUP TRIGGER — auto-create profile + wallet
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 10. Seed riders for the rider-assignment feature
-- =========================================================
INSERT INTO public.riders (name, phone, rating, distance_km, available) VALUES
  ('Tunde Bello',     '+2348011223344', 4.9, 0.8, true),
  ('Chioma Okafor',   '+2348022334455', 4.8, 1.2, true),
  ('Femi Adebayo',    '+2348033445566', 4.7, 1.6, true),
  ('Aisha Ibrahim',   '+2348044556677', 4.9, 2.1, true),
  ('Kelechi Eze',     '+2348055667788', 4.6, 2.4, true),
  ('Bola Williams',   '+2348066778899', 4.5, 3.0, false);