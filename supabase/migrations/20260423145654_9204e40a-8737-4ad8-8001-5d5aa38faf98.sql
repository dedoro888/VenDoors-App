-- Add new business profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS business_lat numeric,
  ADD COLUMN IF NOT EXISTS business_lng numeric,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

-- Storage buckets for logo and banner (public read so images can be displayed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('business-banners', 'business-banners', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies: anyone can view (public buckets), only owner (folder = user_id) can write
DO $$
BEGIN
  -- LOGOS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Logos are publicly accessible') THEN
    CREATE POLICY "Logos are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'business-logos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own logo') THEN
    CREATE POLICY "Users can upload their own logo"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own logo') THEN
    CREATE POLICY "Users can update their own logo"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own logo') THEN
    CREATE POLICY "Users can delete their own logo"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- BANNERS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Banners are publicly accessible') THEN
    CREATE POLICY "Banners are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'business-banners');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own banner') THEN
    CREATE POLICY "Users can upload their own banner"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'business-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own banner') THEN
    CREATE POLICY "Users can update their own banner"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'business-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own banner') THEN
    CREATE POLICY "Users can delete their own banner"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'business-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;