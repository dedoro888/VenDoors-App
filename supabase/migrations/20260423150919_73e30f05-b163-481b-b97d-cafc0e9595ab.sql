-- ===========================================================
-- 1. PLANS CATALOG
-- ===========================================================
CREATE TYPE public.plan_tier AS ENUM ('standard', 'pro', 'premium');

CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.plan_tier NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  sort_order INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view plans"
ON public.plans FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the three tiers
INSERT INTO public.plans (tier, name, tagline, price_monthly, currency, sort_order, features) VALUES
('standard', 'Standard', 'Get Started', 2500, 'NGN', 1, '{
  "max_menu_items": 20,
  "categories": "single",
  "analytics_window_days": 30,
  "top_items": 1,
  "promotions_active": 1,
  "discount_types": ["flat"],
  "payouts": "weekly",
  "transaction_history_days": 30,
  "payout_accounts": 1,
  "support": "faq",
  "scheduled_menu": false,
  "bulk_edit": false,
  "out_of_stock_toggle": false,
  "prep_time": false,
  "peak_hours_heatmap": false,
  "push_notifications_per_month": 0,
  "featured_items": 0,
  "customer_profiles": false,
  "loyalty": false,
  "broadcast_per_month": 0,
  "multi_branch": false,
  "ai_menu_suggestions": false,
  "inventory_tracking": false,
  "auto_pause_orders": false,
  "qr_menus": false,
  "pos_integration": false,
  "competitor_benchmarking": false,
  "ai_forecasting": false,
  "homepage_banner": false,
  "sms_marketing": false,
  "crm": false,
  "vip_tagging": false
}'::jsonb),
('pro', 'Pro', 'Grow Your Business', 7500, 'NGN', 2, '{
  "max_menu_items": null,
  "categories": "multi",
  "analytics_window_days": 90,
  "top_items": 5,
  "promotions_active": 5,
  "discount_types": ["flat", "percentage", "flash_sale"],
  "payouts": "twice_weekly",
  "transaction_history_days": 365,
  "payout_accounts": 2,
  "support": "priority_48h",
  "scheduled_menu": true,
  "bulk_edit": true,
  "out_of_stock_toggle": true,
  "prep_time": true,
  "peak_hours_heatmap": true,
  "push_notifications_per_month": 2,
  "featured_items": 3,
  "customer_profiles": true,
  "loyalty": "basic",
  "broadcast_per_month": 1,
  "multi_branch": false,
  "ai_menu_suggestions": false,
  "inventory_tracking": false,
  "auto_pause_orders": false,
  "qr_menus": false,
  "pos_integration": false,
  "competitor_benchmarking": false,
  "ai_forecasting": false,
  "homepage_banner": false,
  "sms_marketing": false,
  "crm": false,
  "vip_tagging": false
}'::jsonb),
('premium', 'Premium', 'Dominate Your Market', 15000, 'NGN', 3, '{
  "max_menu_items": null,
  "categories": "multi",
  "analytics_window_days": null,
  "top_items": null,
  "promotions_active": null,
  "discount_types": ["flat", "percentage", "flash_sale", "bundle"],
  "payouts": "daily",
  "transaction_history_days": null,
  "payout_accounts": 5,
  "support": "dedicated_24_7",
  "scheduled_menu": true,
  "bulk_edit": true,
  "out_of_stock_toggle": true,
  "prep_time": true,
  "peak_hours_heatmap": true,
  "push_notifications_per_month": null,
  "featured_items": null,
  "customer_profiles": true,
  "loyalty": "advanced",
  "broadcast_per_month": null,
  "multi_branch": true,
  "ai_menu_suggestions": true,
  "inventory_tracking": true,
  "auto_pause_orders": true,
  "qr_menus": true,
  "pos_integration": true,
  "competitor_benchmarking": true,
  "ai_forecasting": true,
  "homepage_banner": true,
  "sms_marketing": true,
  "crm": true,
  "vip_tagging": true
}'::jsonb);

-- ===========================================================
-- 2. USER SUBSCRIPTIONS
-- ===========================================================
CREATE TYPE public.subscription_status AS ENUM ('active', 'pending', 'cancelled', 'expired');

CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status public.subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================
-- 3. PAYOUT ACCOUNTS
-- ===========================================================
CREATE TABLE public.payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payout accounts"
ON public.payout_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payout accounts"
ON public.payout_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payout accounts"
ON public.payout_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payout accounts"
ON public.payout_accounts FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_payout_accounts_user ON public.payout_accounts(user_id);

CREATE TRIGGER update_payout_accounts_updated_at
BEFORE UPDATE ON public.payout_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================
-- 4. PRE-ORDER SETTINGS (one row per vendor, recurring daily)
-- ===========================================================
CREATE TABLE public.pre_order_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  start_time TEXT NOT NULL DEFAULT '06:00',
  end_time TEXT NOT NULL DEFAULT '10:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pre_order_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pre-order settings"
ON public.pre_order_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pre-order settings"
ON public.pre_order_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pre-order settings"
ON public.pre_order_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_pre_order_settings_updated_at
BEFORE UPDATE ON public.pre_order_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================
-- 5. PERSONAL INFO (operator/manager)
-- ===========================================================
CREATE TABLE public.personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  personal_phone TEXT,
  personal_phone_verified BOOLEAN NOT NULL DEFAULT false,
  personal_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personal info"
ON public.personal_info FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal info"
ON public.personal_info FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal info"
ON public.personal_info FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_personal_info_updated_at
BEFORE UPDATE ON public.personal_info
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================
-- 6. EXTEND PROFILES (setup wizard + verification + legitimacy)
-- ===========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS setup_step INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_registered BOOLEAN,
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN,
  ADD COLUMN IF NOT EXISTS business_email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personal_phone_verified BOOLEAN NOT NULL DEFAULT false;

-- ===========================================================
-- 7. UPDATE SIGNUP TRIGGER — auto-create personal_info, pre-order, and Standard subscription
-- ===========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _standard_plan_id UUID;
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

  SELECT id INTO _standard_plan_id FROM public.plans WHERE tier = 'standard' LIMIT 1;
  IF _standard_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, _standard_plan_id, 'active');
  END IF;

  RETURN NEW;
END;
$function$;

-- Make sure the trigger exists (re-create idempotently)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================
-- 8. BACKFILL existing users with Standard plan + supporting rows
-- ===========================================================
INSERT INTO public.personal_info (user_id)
SELECT p.user_id FROM public.profiles p
LEFT JOIN public.personal_info pi ON pi.user_id = p.user_id
WHERE pi.id IS NULL;

INSERT INTO public.pre_order_settings (user_id)
SELECT p.user_id FROM public.profiles p
LEFT JOIN public.pre_order_settings pos ON pos.user_id = p.user_id
WHERE pos.id IS NULL;

INSERT INTO public.user_subscriptions (user_id, plan_id, status)
SELECT p.user_id, (SELECT id FROM public.plans WHERE tier = 'standard'), 'active'
FROM public.profiles p
LEFT JOIN public.user_subscriptions us ON us.user_id = p.user_id
WHERE us.id IS NULL;