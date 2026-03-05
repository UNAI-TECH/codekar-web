-- ============================================================
-- CODEKARX — Add Payment Columns to Existing registrations Table
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to run even if table already exists (uses IF NOT EXISTS)
-- ============================================================

-- Add payment tracking columns to the EXISTING table
DO $$ BEGIN
  -- payment_status: tracks payment state
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  -- zoho_payment_link_id: the Zoho payment link ID (used for server-side verification)
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN zoho_payment_link_id TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  -- zoho_payment_id: actual Zoho payment transaction ID (set after payment is confirmed)
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN zoho_payment_id TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  -- generated_code: participation code shown after successful payment (e.g. IND-2026-ABCDE)
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN generated_code TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  -- amount: registration fee paid
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN amount NUMERIC NOT NULL DEFAULT 1;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  -- registration_type: 'individual' or 'team' (may already exist)
  BEGIN
    ALTER TABLE public.registrations ADD COLUMN registration_type TEXT NOT NULL DEFAULT 'individual';
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

END $$;

-- Add unique constraint on generated_code (ignore error if already exists)
DO $$ BEGIN
  ALTER TABLE public.registrations ADD CONSTRAINT registrations_generated_code_key UNIQUE (generated_code);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status   ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_zoho_link_id     ON public.registrations(zoho_payment_link_id);
CREATE INDEX IF NOT EXISTS idx_registrations_generated_code   ON public.registrations(generated_code);

-- Enable Row Level Security (RLS) if not already
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service_role) to do everything
DO $$ BEGIN
  CREATE POLICY "service_role_all" ON public.registrations
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anon to read by generated_code (for lookup tab)
DO $$ BEGIN
  CREATE POLICY "anon_read_by_code" ON public.registrations
    FOR SELECT TO anon USING (generated_code IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

SELECT 'Migration complete! New columns added: payment_status, zoho_payment_link_id, zoho_payment_id, generated_code, amount, registration_type' AS result;
